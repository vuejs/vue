import { warn } from '../util/index'

let hasProxy, proxyHandlers, initProxy

if (process.env.NODE_ENV !== 'production') {
  hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/)

  proxyHandlers = {
    has (target, key) {
      if (key === 'undefined') {
        return false
      }
      if (!(key in target)) {
        warn(
          `Trying to access non-existent property "${key}" while rendering.`,
          target
        )
      }
      return true
    }
  }

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      vm._renderProxy = new Proxy(vm, proxyHandlers)
    } else {
      vm._renderProxy = vm
    }
  }
}

export { initProxy }
