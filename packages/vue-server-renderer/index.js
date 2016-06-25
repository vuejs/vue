var createRenderer = require('./create-renderer')
var Module = require('./module')

function runAsNewModule (code) {
  var path = '__app__'
  var m = new Module(path, null, true /* isBundle */)
  m.load(path)
  m._compile(code, path)
  return Object.prototype.hasOwnProperty.call(m.exports, 'default')
    ? m.exports.default
    : m.exports
}

exports.createRenderer = createRenderer

exports.createBundleRenderer = function (code, options) {
  var renderer = createRenderer(options)
  return {
    renderToString: function (cb) {
      var app = runAsNewModule(code)
      renderer.renderToString(app, cb)
    },
    renderToStream: function () {
      var app = runAsNewModule(code)
      return renderer.renderToStream(app)
    }
  }
}
