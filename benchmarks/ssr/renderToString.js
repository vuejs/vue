'use strict'

const Vue = require('../../dist/vue.common.js')
const createRenderer = require('../../dist/server-renderer.js')
const renderToString = createRenderer().renderToString
const gridComponent = require('./common.js')

console.log('--- renderToString --- ')
const self = (global || root)
self.s = self.performance.now()

renderToString(new Vue(gridComponent), () => {
  console.log('Complete time: ' + (self.performance.now() - self.s).toFixed(2) + 'ms')
  console.log()
})
