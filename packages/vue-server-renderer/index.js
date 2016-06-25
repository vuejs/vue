const { readFileSync } = require('fs')
const createRenderer = require('./create-renderer')
const Module = require('./module')

function runAsNewModule (code) {
  const path = '__app__'
  const m = new Module(path, null, true /* isBundle */)
  m.load(path)
  m._compile(code, path)
  return Object.prototype.hasOwnProperty.call(m.exports, 'default')
    ? m.exports.default
    : m.exports
}

exports.createRenderer = createRenderer

exports.createBundleRenderer = function (code, options) {
  const renderer = createRenderer(options)
  return {
    renderToString (cb) {
      const app = runAsNewModule(code)
      renderer.renderToString(app, cb)
    },
    renderToStream () {
      const app = runAsNewModule(code)
      return renderer.renderToStream(app)
    }
  }
}
