import { isPlainObject } from 'shared/util'

const vm = require('vm')
const path = require('path')
const resolve = require('resolve')
const NativeModule = require('module')

function createSandbox (context) {
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

function compileModule (files, basedir, runInNewContext) {
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

  function evaluateModule (filename, sandbox, evaluatedFiles = {}) {
    if (evaluatedFiles[filename]) {
      return evaluatedFiles[filename]
    }

    const script = getCompiledScript(filename)
    const compiledWrapper = runInNewContext === false
      ? script.runInThisContext()
      : script.runInNewContext(sandbox)
    const m = { exports: {}}
    const r = file => {
      file = path.join('.', file)
      if (files[file]) {
        return evaluateModule(file, sandbox, evaluatedFiles)
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
  if (isPlainObject(val)) {
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

export function createBundleRunner (entry, files, basedir, runInNewContext) {
  const evaluate = compileModule(files, basedir, runInNewContext)
  if (runInNewContext !== false && runInNewContext !== 'once') {
    // new context mode: creates a fresh context and re-evaluate the bundle
    // on each render. Ensures entire application state is fresh for each
    // render, but incurs extra evaluation cost.
    return (userContext = {}) => new Promise(resolve => {
      userContext._registeredComponents = new Set()
      const res = evaluate(entry, createSandbox(userContext))
      resolve(typeof res === 'function' ? res(userContext) : res)
    })
  } else {
    // direct mode: instead of re-evaluating the whole bundle on
    // each render, it simply calls the exported function. This avoids the
    // module evaluation costs but requires the source code to be structured
    // slightly differently.
    let runner // lazy creation so that errors can be caught by user
    let initialContext
    return (userContext = {}) => new Promise(resolve => {
      if (!runner) {
        const sandbox = runInNewContext === 'once'
          ? createSandbox()
          : global
        // the initial context is only used for collecting possible non-component
        // styles injected by vue-style-loader.
        initialContext = sandbox.__VUE_SSR_CONTEXT__ = {}
        runner = evaluate(entry, sandbox)
        // On subsequent renders, __VUE_SSR_CONTEXT__ will not be available
        // to prevent cross-request pollution.
        delete sandbox.__VUE_SSR_CONTEXT__
        if (typeof runner !== 'function') {
          throw new Error(
            'bundle export should be a function when using ' +
            '{ runInNewContext: false }.'
          )
        }
      }
      userContext._registeredComponents = new Set()
      // vue-style-loader styles imported outside of component lifecycle hooks
      if (initialContext._styles) {
        userContext._styles = deepClone(initialContext._styles)
      }
      // #6353 after the app is resolved, if the userContext doesn't have a
      // styles property, it means the app doesn't have any lifecycle-injected
      // styles, so vue-style-loader never defined the styles getter.
      // just expose the same styles from the initialContext.
      const exposeStylesAndResolve = app => {
        if (!userContext.hasOwnProperty('styles')) {
          userContext.styles = initialContext.styles
        }
        resolve(app)
      }

      const res = runner(userContext)
      if (typeof res.then === 'function') {
        res.then(exposeStylesAndResolve)
      } else {
        exposeStylesAndResolve(res)
      }
    })
  }
}
