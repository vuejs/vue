// suppress logs from vdom-tester
const domModule = require('weex-vdom-tester/lib/modules/dom')
domModule.updateFinish = domModule.createFinish = domModule.refreshFinish = () => {}

import * as Vue from '../../../packages/weex-vue-framework'
import { compile } from '../../../packages/weex-template-compiler'
import { Runtime, Instance } from 'weex-vdom-tester'
import { init, config } from 'weex-js-runtime'

init()

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

export function prepareRuntime () {
  let sendTasksHandler = function () {}
  config.sendTasks = config.Document.handler = function () {
    sendTasksHandler.apply(null, arguments)
  }
  Vue.init(config)
  const runtime = new Runtime(Vue)
  sendTasksHandler = function () {
    runtime.target.callNative.apply(runtime.target, arguments)
  }
  return runtime
}

export function resetRuntime () {
  delete config.Document.handler
  Vue.reset()
}

export function createInstance (runtime, code) {
  const instance = new Instance(runtime)
  if (code) {
    instance.$create(code)
  }
  return instance
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
      checker(instance.getRealRoot())
      res()
    })
  })
}
