/* @flow */

// can we use __proto__?
export const hasProto = '__proto__' in {}

// Browser environment sniffing
export const inBrowser =
  typeof window !== 'undefined' &&
  Object.prototype.toString.call(window) !== '[object Object]'

export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isEdge = UA && UA.indexOf('edge/') > 0
export const isAndroid = UA && UA.indexOf('android') > 0

// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, but MutationObserver is unreliable
 * in iOS UIWebView so we use a setImmediate shim and fallback to setTimeout.
 */
export const nextTick = (function () {
  let callbacks = []
  let pending = false
  let timerFunc

  function nextTickHandler () {
    pending = false
    const copies = callbacks.slice(0)
    callbacks = []
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  /* istanbul ignore else */
  if (inBrowser && window.postMessage &&
    !window.importScripts && // not in WebWorker
    !(isAndroid && !window.requestAnimationFrame) // not in Android <= 4.3
  ) {
    const NEXT_TICK_TOKEN = '__vue__nextTick__'
    window.addEventListener('message', e => {
      if (e.source === window && e.data === NEXT_TICK_TOKEN) {
        nextTickHandler()
      }
    })
    timerFunc = () => {
      window.postMessage(NEXT_TICK_TOKEN, '*')
    }
  } else {
    timerFunc = (typeof global !== 'undefined' && global.setImmediate) || setTimeout
  }

  return function queueNextTick (cb: Function, ctx?: Object) {
    const func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (pending) return
    pending = true
    timerFunc(nextTickHandler, 0)
  }
})()

let _Set
/* istanbul ignore if */
if (typeof Set !== 'undefined' && /native code/.test(Set.toString())) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set {
    set: Object;
    constructor () {
      this.set = Object.create(null)
    }
    has (key: string | number) {
      return this.set[key] !== undefined
    }
    add (key: string | number) {
      this.set[key] = 1
    }
    clear () {
      this.set = Object.create(null)
    }
  }
}

export { _Set }
