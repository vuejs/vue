/* global MutationObserver */

// can we use __proto__?
export const hasProto = '__proto__' in {}

// Browser environment sniffing
export const inBrowser =
  typeof window !== 'undefined' &&
  Object.prototype.toString.call(window) !== '[object Object]'

// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

// UA sniffing for working around browser-specific quirks
const UA = inBrowser && window.navigator.userAgent.toLowerCase()
const isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA)
const isWechat = UA && UA.indexOf('micromessenger') > 0

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
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

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !(isWechat && isIos)) {
    let counter = 1
    const observer = new MutationObserver(nextTickHandler)
    const textNode = document.createTextNode(counter)
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = counter
    }
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    const context = inBrowser
      ? window
      : typeof global !== 'undefined' ? global : {}
    timerFunc = context.setImmediate || setTimeout
  }
  return function (cb, ctx) {
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
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    this.set = Object.create(null)
  }
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined
  }
  _Set.prototype.add = function (key) {
    this.set[key] = 1
  }
  _Set.prototype.clear = function () {
    this.set = Object.create(null)
  }
}

export { _Set }
