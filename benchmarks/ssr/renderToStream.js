'use strict'

const Vue = require('../../dist/vue.common.js')
const createRenderer = require('../../packages/vue-server-renderer')
const renderToStream = createRenderer().renderToStream
const gridComponent = require('./common.js')

console.log('--- renderToStream --- ')
const self = (global || root)
self.s = self.performance.now()

const stream = renderToStream(new Vue(gridComponent))
let str = ''
const stats = []
stream.on('data', chunk => {
  str += chunk
  stats.push(self.performance.now())
})
stream.on('end', () => {
  stats.push(self.performance.now())
  stats.forEach((val, index) => {
    const type = index !== stats.length - 1 ? 'Chunk' : 'Complete'
    console.log(type + ' time: ' + (val - self.s).toFixed(2) + 'ms')
  })
  console.log()
})
