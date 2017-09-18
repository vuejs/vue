import * as Vue from '../../../packages/weex-vue-framework'
import { compile } from '../../../packages/weex-template-compiler'
import WeexRuntime from 'weex-js-runtime'

console.debug = () => {}

// http://stackoverflow.com/a/35478115
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g
export function strToRegExp (str) {
  return new RegExp(str.replace(matchOperatorsRe, '\\$&'))
}

export function compileAndStringify (template) {
  const { render, staticRenderFns } = compile(template)
  return {
    render: `function () { ${render} }`,
    staticRenderFns: parseStatic(staticRenderFns)
  }
}

function parseStatic (fns) {
  return '[' + fns.map(fn => `function () { ${fn} }`).join(',') + ']'
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
