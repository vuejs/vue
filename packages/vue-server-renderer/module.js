// thanks to airbnb/hypernova
'use strict'

const NativeModule = require('module')
const path = require('path')
const assert = require('assert')
const vm = require('vm')

const NativeModules = process.binding('natives')

const moduleExtensions = Object.assign({}, NativeModule._extensions)

function isNativeModule (id) {
  return Object.prototype.hasOwnProperty.call(NativeModules, id)
}

// Creates a sandbox so we don't share globals across different runs.
function createContext (context) {
  const sandbox = {
    Buffer,
    clearImmediate,
    clearInterval,
    clearTimeout,
    setImmediate,
    setInterval,
    setTimeout,
    console,
    process,
    __VUE_SSR_CONTEXT__: context || {}
  }
  sandbox.global = sandbox
  return sandbox
}

function Module (id, parent, context) {
  const cache = parent ? parent.cache : null
  this.id = id
  this.exports = {}
  this.cache = cache || {}
  this.parent = parent
  this.filename = null
  this.loaded = false
  this.context = parent ? parent.context : createContext(context)
}

Module.prototype.load = function (filename) {
  assert.ok(!this.loaded)
  this.filename = filename
  this.paths = NativeModule._nodeModulePaths(path.dirname(filename))
}

Module.prototype.run = function (filename) {
  const ext = path.extname(filename)
  const extension = moduleExtensions[ext] ? ext : '.js'
  moduleExtensions[extension](this, filename)
  this.loaded = true
}

Module.prototype.require = function (filePath) {
  assert.ok(typeof filePath === 'string', 'path must be a string')
  return Module.loadFile(filePath, this)
}

Module.prototype._compile = function (content, filename) {
  const r = filePath => this.require(filePath)
  r.resolve = request => NativeModule._resolveFilename(request, this)
  r.main = process.mainModule
  r.extensions = moduleExtensions
  r.cache = this.cache

  const dirname = path.dirname(filename)

  // create wrapper function
  const wrapper = NativeModule.wrap(content)

  const options = {
    filename,
    displayErrors: true
  }

  const compiledWrapper = vm.runInNewContext(wrapper, this.context, options)
  return compiledWrapper.call(this.exports, this.exports, r, this, filename, dirname)
}

Module.load = function (id, filename) {
  const m = new Module(id)
  filename = filename || id
  m.load(filename)
  m.run(filename)
  return m
}

Module.loadFile = function (file, parent) {
  const filename = NativeModule._resolveFilename(file, parent)

  if (parent) {
    const cachedModule = parent.cache[filename]
    if (cachedModule) return cachedModule.exports
  }

  if (isNativeModule(filename)) {
    return require(filename)
  }

  const m = new Module(filename, parent)

  m.cache[filename] = m

  let hadException = true

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
