import * as Vue from '../../../packages/weex-vue-framework'
import { compile } from '../../../packages/weex-template-compiler'
import WeexRuntime from 'weex-js-runtime'
import styler from 'weex-styler'

const styleRE = /<\s*style\s*\w*>([^(<\/)]*)<\/\s*style\s*>/g
const scriptRE = /<\s*script.*>([^]*)<\/\s*script\s*>/
const templateRE = /<\s*template\s*>([^]*)<\/\s*template\s*>/

console.debug = () => {}

// http://stackoverflow.com/a/35478115
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g
export function strToRegExp (str) {
  return new RegExp(str.replace(matchOperatorsRe, '\\$&'))
}

function parseStatic (fns) {
  return '[' + fns.map(fn => `function () { ${fn} }`).join(',') + ']'
}

export function compileAndStringify (template) {
  const { render, staticRenderFns } = compile(template)
  return {
    render: `function () { ${render} }`,
    staticRenderFns: parseStatic(staticRenderFns)
  }
}

/**
 * Compile *.vue file into js code
 * @param {string} source raw text of *.vue file
 * @param {string} componentName whether compile to a component
 */
export function compileVue (source, componentName) {
  return new Promise((resolve, reject) => {
    if (!templateRE.test(source)) {
      return reject('No Template!')
    }
    const scriptMatch = scriptRE.exec(source)
    const script = scriptMatch ? scriptMatch[1] : ''
    const { render, staticRenderFns } = compile(templateRE.exec(source)[1])

    const generateCode = styles => (`
      var test_case = Object.assign({
        style: ${JSON.stringify(styles)},
        render: function () { ${render} },
        staticRenderFns: ${parseStatic(staticRenderFns)},
      }, (function(){
        var module = { exports: {} };
        ${script};
        return module.exports;
      })());
    ` + (componentName
        ? `Vue.component('${componentName}', test_case);\n`
        : `test_case.el = 'body';new Vue(test_case);`)
    )

    let cssText = ''
    let styleMatch = null
    while ((styleMatch = styleRE.exec(source))) {
      cssText += `\n${styleMatch[1]}\n`
    }
    styler.parse(cssText, (error, result) => {
      if (error) {
        return reject(error)
      }
      resolve(generateCode(result.jsonStyle))
    })
    resolve(generateCode({}))
  })
}

function isObject (object) {
  return object !== null && typeof object === 'object'
}

function isEmptyObject (object) {
  return isObject(object) && Object.keys(object).length < 1
}

function omitUseless (object) {
  if (isObject(object)) {
    delete object.ref
    for (const key in object) {
      if (isEmptyObject(object[key]) || object[key] === undefined) {
        delete object[key]
      }
      omitUseless(object[key])
    }
  }
  return object
}

export function getRoot (instance) {
  return omitUseless(instance.document.body.toJSON())
}

// Get all binding events in the instance
export function getEvents (instance) {
  const events = []
  const recordEvent = node => {
    if (!node) { return }
    if (Array.isArray(node.event)) {
      node.event.forEach(type => {
        events.push({ ref: node.ref, type })
      })
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(recordEvent)
    }
  }
  recordEvent(instance.document.body.toJSON())
  return events
}

export function fireEvent (instance, ref, type, event = {}) {
  const el = instance.document.getRef(ref)
  if (el) {
    instance.document.fireEvent(el, type, event = {})
  }
}

export function createInstance (id, code, ...args) {
  WeexRuntime.config.frameworks = { Vue }
  const context = WeexRuntime.init(WeexRuntime.config)
  context.registerModules({
    timer: ['setTimeout', 'setInterval']
  })
  const instance = context.createInstance(id, `// { "framework": "Vue" }\n${code}`, ...args)
  instance.$refresh = (data) => context.refreshInstance(id, data)
  instance.$destroy = () => context.destroyInstance(id)
  return instance
}

export function compileAndExecute (template, additional = '') {
  return new Promise(resolve => {
    const id = String(Date.now() * Math.random())
    const { render, staticRenderFns } = compile(template)
    const instance = createInstance(id, `
      new Vue({
        el: '#whatever',
        render: function () { ${render} },
        staticRenderFns: ${parseStatic(staticRenderFns)},
        ${additional}
      })
    `)
    setTimeout(() => resolve(instance), 10)
  })
}

export function syncPromise (arr) {
  let p = Promise.resolve()
  arr.forEach(item => {
    p = p.then(item)
  })
  return p
}

export function checkRefresh (instance, data, checker) {
  return () => new Promise(res => {
    instance.$refresh(data)
    setTimeout(() => {
      checker(getRoot(instance))
      res()
    })
  })
}
