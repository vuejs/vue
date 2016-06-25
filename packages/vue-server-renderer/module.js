// thanks to airbnb/hypernova

const NativeModule = require('module')
const path = require('path')
const { ok } = require('assert')
const { runInNewContext } = require('vm')

const NativeModules = process.binding('natives')

const moduleExtensions = Object.assign({}, NativeModule._extensions)

function isNativeModule (id) {
  return Object.prototype.hasOwnProperty.call(NativeModules, id)
}

// Creates a sandbox so we don't share globals across different runs.
function createContext () {
  const sandbox = {
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

// This class should satisfy the Module interface that NodeJS defines in their native m.js
// implementation.
class Module {
  constructor (id, parent, isBundle) {
    const cache = parent ? parent.cache : null
    this.id = id
    this.exports = {}
    this.cache = cache || {}
    this.parent = parent
    this.filename = null
    this.loaded = false
    this.context = parent ? parent.context : createContext()
    this.isBundle = isBundle
  }

  load (filename) {
    ok(!this.loaded)
    this.filename = filename
    this.paths = NativeModule._nodeModulePaths(path.dirname(filename))
  }

  run (filename) {
    const ext = path.extname(filename)
    const extension = moduleExtensions[ext] ? ext : '.js'
    moduleExtensions[extension](this, filename)
    this.loaded = true
  }

  require (filePath) {
    ok(typeof filePath === 'string', 'path must be a string')
    return Module.loadFile(filePath, this)
  }

  _compile (content, filename) {
    const self = this

    function r (filePath) {
      return self.require(filePath)
    }
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

    const compiledWrapper = runInNewContext(wrapper, this.context, options)
    return compiledWrapper.call(this.exports, this.exports, r, this, filename, dirname)
  }

  static load (id, filename = id) {
    const m = new Module(id)
    m.load(filename)
    m.run(filename)
    return m
  }

  static loadFile (file, parent) {
    const filename = NativeModule._resolveFilename(file, parent)

    if (parent) {
      const cachedModule = parent.cache[filename]
      if (cachedModule) return cachedModule.exports
    }

    if (parent.isBundle || isNativeModule(filename)) {
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

  static addExtension (ext, f) {
    moduleExtensions[ext] = f
  }
}

module.exports = Module
