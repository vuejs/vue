/**
 * Can we use __proto__?
 *
 * @type {Boolean}
 */

exports.hasProto = '__proto__' in {}

/**
 * Indicates we have a window
 *
 * @type {Boolean}
 */

var toString = Object.prototype.toString
var inBrowser = exports.inBrowser =
  typeof window !== 'undefined' &&
  toString.call(window) !== '[object Object]'

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available.
 * 
 * If the user has included a setImmediate polyfill, we can
 * also use that. In Node we actually prefer setImmediate to
 * process.nextTick so we don't block the I/O.
 * 
 * Finally, fallback to setTimeout(0) if nothing else works.
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var defer
/* istanbul ignore if */
if (typeof MutationObserver !== 'undefined') {
  defer = deferFromMutationObserver(MutationObserver)
} else
/* istanbul ignore if */
if (typeof WebkitMutationObserver !== 'undefined') {
  defer = deferFromMutationObserver(WebkitMutationObserver)
} else {
  defer = setTimeout
}

/* istanbul ignore next */
function deferFromMutationObserver (Observer) {
  var queue = []
  var node = document.createTextNode('0')
  var i = 0
  new Observer(function () {
    var l = queue.length
    for (var i = 0; i < l; i++) {
      queue[i]()
    }
    queue = queue.slice(l)
  }).observe(node, { characterData: true })
  return function mutationObserverDefer (cb) {
    queue.push(cb)
    node.nodeValue = (i = ++i % 2)
  }
}

exports.nextTick = function (cb, ctx) {
  if (ctx) {
    defer(function () { cb.call(ctx) }, 0)
  } else {
    defer(cb, 0)
  }
}

/**
 * Detect if we are in IE9...
 *
 * @type {Boolean}
 */

exports.isIE9 =
  inBrowser &&
  navigator.userAgent.indexOf('MSIE 9.0') > 0

/**
 * Sniff transition/animation events
 */

if (inBrowser && !exports.isIE9) {
  var isWebkitTrans =
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  var isWebkitAnim =
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  exports.transitionProp = isWebkitTrans
    ? 'WebkitTransition'
    : 'transition'
  exports.transitionEndEvent = isWebkitTrans
    ? 'webkitTransitionEnd'
    : 'transitionend'
  exports.animationProp = isWebkitAnim
    ? 'WebkitAnimation'
    : 'animation'
  exports.animationEndEvent = isWebkitAnim
    ? 'webkitAnimationEnd'
    : 'animationend'
}