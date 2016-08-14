/* not type checking this file because flow doesn't play well with Proxy */

import { warn, makeMap } from '../util/index'

let hasProxy, proxyHandlers, initProxy

if (process.env.NODE_ENV !== 'production') {
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require,__webpack_require__' // for Webpack/Browserify
  )

  hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/)

  proxyHandlers = {
    has (target, key) {
      const has = key in target
      const isAllowedGlobal = allowedGlobals(key)
      if (!has && !isAllowedGlobal) {
        warn(
          `Property or method "${key}" is not defined on the instance but ` +
          `referenced during render. Make sure to declare reactive data ` +
          `properties in the data option.`,
          target
        )
      }
      return !isAllowedGlobal
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
