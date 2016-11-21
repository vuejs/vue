'use strict'

const Vue = require('../../dist/vue.runtime.common.js')
const createRenderer = require('../../packages/vue-server-renderer').createRenderer
const renderToString = createRenderer().renderToString
const gridComponent = require('./common.js')

console.log('--- renderToString --- ')
const self = (global || root)
self.s = self.performance.now()

renderToString(new Vue(gridComponent), () => {
  console.log('Complete time: ' + (self.performance.now() - self.s).toFixed(2) + 'ms')
  console.log()
})
