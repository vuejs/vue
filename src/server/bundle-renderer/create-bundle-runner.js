import { isObject } from 'shared/util'

const vm = require('vm')
const path = require('path')
const resolve = require('resolve')
const NativeModule = require('module')

function createContext (context) {
  const sandbox = {
    Buffer,
    console,
    process,
    setTimeout,
    setInterval,
    setImmediate,
    clearTimeout,
    clearInterval,
    clearImmediate,
    __VUE_SSR_CONTEXT__: context
  }
  sandbox.global = sandbox
  return sandbox
}

function compileModule (files, basedir) {
  const compiledScripts = {}
  const resolvedModules = {}

  function getCompiledScript (filename) {
    if (compiledScripts[filename]) {
      return compiledScripts[filename]
    }
    const code = files[filename]
    const wrapper = NativeModule.wrap(code)
    const script = new vm.Script(wrapper, {
      filename,
      displayErrors: true
    })
    compiledScripts[filename] = script
    return script
  }

  function evaluateModule (filename, context, evaluatedFiles) {
    if (evaluatedFiles[filename]) {
      return evaluatedFiles[filename]
    }

    const script = getCompiledScript(filename)
    const compiledWrapper = script.runInNewContext(context)
    const m = { exports: {}}
    const r = file => {
      file = path.join('.', file)
      if (files[file]) {
        return evaluateModule(file, context, evaluatedFiles)
      } else if (basedir) {
        return require(
          resolvedModules[file] ||
          (resolvedModules[file] = resolve.sync(file, { basedir }))
        )
      } else {
        return require(file)
      }
    }
    compiledWrapper.call(m.exports, m.exports, r, m)

    const res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
      ? m.exports.default
      : m.exports
    evaluatedFiles[filename] = res
    return res
  }
  return evaluateModule
}

function deepClone (val) {
  if (isObject(val)) {
    const res = {}
    for (const key in val) {
      res[key] = deepClone(val[key])
    }
    return res
  } else if (Array.isArray(val)) {
    return val.slice()
  } else {
    return val
  }
}

export function createBundleRunner (entry, files, basedir, direct) {
  const evaluate = compileModule(files, basedir)
  if (!direct) {
    // default mode: creates a fresh context and re-evaluate the bundle
    // on each render. Ensures entire application state is fresh for each
    // render, but incurs extra evaluation cost.
    return (_context = {}) => new Promise((resolve, reject) => {
      const context = createContext(_context)
      const evaluatedFiles = _context._evaluatedFiles = {}
      const res = evaluate(entry, context, evaluatedFiles)
      resolve(typeof res === 'function' ? res(_context) : res)
    })
  } else {
    // direct mode: instead of re-evaluating the whole bundle on
    // each render, it simply calls the exported function. This avoids the
    // module evaluation costs but requires the source code to be structured
    // slightly differently.
    const initialExposedContext = {}
    const context = createContext(initialExposedContext)
    const runner = evaluate(entry, context, {})
    if (typeof runner !== 'function') {
      throw new Error('direct mode expects bundle export to be a function.')
    }
    return (_context = {}) => {
      context.__VUE_SSR_CONTEXT__ = _context
      // vue-style-loader styles imported outside of component lifecycle hooks
      if (initialExposedContext._styles) {
        _context._styles = deepClone(initialExposedContext._styles)
      }
      return runner(_context)
    }
  }
}
