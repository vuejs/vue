import NativeModule from 'module'
import vm from 'vm'

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

export default function runInVm (code, _context = {}) {
  return new Promise((resolve, reject) => {
    const wrapper = NativeModule.wrap(code)
    const context = createContext(_context)
    const compiledWrapper = vm.runInNewContext(wrapper, context, {
      filename: '__vue_ssr_bundle__',
      displayErrors: true
    })
    const m = { exports: {}}
    compiledWrapper.call(m.exports, m.exports, require, m)
    const res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
      ? m.exports.default
      : m.exports
    resolve(typeof res === 'function' ? res(_context) : res)
  })
}
