const NativeModule = require('module')
const vm = require('vm')
const path = require('path')

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
    __VUE_SSR_CONTEXT__: context
  }
  sandbox.global = sandbox
  return sandbox
}

function evaluateModule (filename, chunks, context, evaluatedModules) {
  if (evaluatedModules[filename]) {
    return evaluatedModules[filename]
  }

  const code = chunks[filename]
  const wrapper = NativeModule.wrap(code)
  const compiledWrapper = vm.runInNewContext(wrapper, context, {
    filename,
    displayErrors: true
  })
  const m = { exports: {}}
  const r = file => {
    file = path.join('.', file)
    if (chunks[file]) {
      return evaluateModule(file, chunks, context, evaluatedModules)
    } else {
      return require(file)
    }
  }
  compiledWrapper.call(m.exports, m.exports, r, m)

  const res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
    ? m.exports.default
    : m.exports
  evaluatedModules[filename] = res
  return res
}

export default function runInVm (entry, chunks, _context = {}) {
  return new Promise((resolve, reject) => {
    const context = createContext(_context)
    const res = evaluateModule(entry, chunks, context, {})
    resolve(typeof res === 'function' ? res(_context) : res)
  })
}
