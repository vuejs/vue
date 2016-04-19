import { warn, inBrowser } from '../util/index'

let hasProxy, proxyHandlers, initProxy

if (process.env.NODE_ENV !== 'production') {
  let context = inBrowser ? window : global

  hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/)

  proxyHandlers = {
    has (target, key) {
      if (key === 'undefined') {
        return false
      }
      let has = key in target
      if (!has && !(key in context)) {
        warn(
          `Trying to access non-existent property "${key}" while rendering.`,
          target
        )
      }
      return has
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
