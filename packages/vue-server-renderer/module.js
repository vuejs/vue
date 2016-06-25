// thanks to airbnb/hypernova

var NativeModule = require('module')
var path = require('path')
var assert = require('assert')
var vm = require('vm')

var NativeModules = process.binding('natives')

var moduleExtensions = Object.assign({}, NativeModule._extensions)

function isNativeModule (id) {
  return Object.prototype.hasOwnProperty.call(NativeModules, id)
}

// Creates a sandbox so we don't share globals across different runs.
function createContext () {
  var sandbox = {
    Buffer,
    clearImmediate,
    clearInterval,
    clearTimeout,
    setImmediate,
    setInterval,
    setTimeout,
    console,
    process
  }
  sandbox.global = sandbox
  return sandbox
}

function Module (id, parent, isBundle) {
  var cache = parent ? parent.cache : null
  this.id = id
  this.exports = {}
  this.cache = cache || {}
  this.parent = parent
  this.filename = null
  this.loaded = false
  this.context = parent ? parent.context : createContext()
  this.isBundle = isBundle
}

Module.prototype.load = function (filename) {
  assert.ok(!this.loaded)
  this.filename = filename
  this.paths = NativeModule._nodeModulePaths(path.dirname(filename))
}

Module.prototype.run = function (filename) {
  var ext = path.extname(filename)
  var extension = moduleExtensions[ext] ? ext : '.js'
  moduleExtensions[extension](this, filename)
  this.loaded = true
}

Module.prototype.require = function (filePath) {
  assert.ok(typeof filePath === 'string', 'path must be a string')
  return Module.loadFile(filePath, this)
}

Module.prototype._compile = function (content, filename) {
  var self = this

  function r (filePath) {
    return self.require(filePath)
  }
  r.resolve = request => NativeModule._resolveFilename(request, this)
  r.main = process.mainModule
  r.extensions = moduleExtensions
  r.cache = this.cache

  var dirname = path.dirname(filename)

  // create wrapper function
  var wrapper = NativeModule.wrap(content)

  var options = {
    filename,
    displayErrors: true
  }

  var compiledWrapper = vm.runInNewContext(wrapper, this.context, options)
  return compiledWrapper.call(this.exports, this.exports, r, this, filename, dirname)
}

Module.load = function (id, filename) {
  var m = new Module(id)
  filename = filename || id
  m.load(filename)
  m.run(filename)
  return m
}

Module.loadFile = function (file, parent) {
  var filename = NativeModule._resolveFilename(file, parent)

  if (parent) {
    var cachedModule = parent.cache[filename]
    if (cachedModule) return cachedModule.exports
  }

  if (parent.isBundle || isNativeModule(filename)) {
    return require(filename)
  }

  var m = new Module(filename, parent)

  m.cache[filename] = m

  var hadException = true

  try {
    m.load(filename)
    m.run(filename)
    hadException = false
  } finally {
    if (hadException) {
      delete m.cache[filename]
    }
  }

  return m.exports
}

Module.addExtension = function (ext, f) {
  moduleExtensions[ext] = f
}

module.exports = Module
