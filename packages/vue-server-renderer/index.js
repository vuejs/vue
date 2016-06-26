'use strict'

const createRenderer = require('./create-renderer')
const Module = require('./module')
const stream = require('stream')

function runAsNewModule (code, context) {
  const path = '__app__'
  const m = new Module(path, null, context)
  m.load(path)
  m._compile(code, path)
  const res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
    ? m.exports.default
    : m.exports
  if (typeof res.then !== 'function') {
    throw new Error('SSR bundle should export a Promise.')
  }
  return res
}

exports.createRenderer = createRenderer

exports.createBundleRenderer = function (code, rendererOptions) {
  const renderer = createRenderer(rendererOptions)
  return {
    renderToString: (context, cb) => {
      runAsNewModule(code, context).then(app => {
        renderer.renderToString(app, cb)
      })
    },
    renderToStream: (context) => {
      const res = new stream.PassThrough()
      runAsNewModule(code, context).then(app => {
        renderer.renderToStream(app).pipe(res)
      })
      return res
    }
  }
}
