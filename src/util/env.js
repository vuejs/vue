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
 * Defer a task to the start of the next event loop
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var defer = inBrowser
  ? (window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    setTimeout)
  : setTimeout

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
  if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    exports.transitionProp = 'WebkitTransition'
    exports.transitionEndEvent = 'webkitTransitionEnd'
  } else {
    exports.transitionProp = 'transition'
    exports.transitionEndEvent = 'transitionend'
  }

  if (
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    exports.animationProp = 'WebkitAnimation'
    exports.animationEndEvent = 'webkitAnimationEnd'
  } else {
    exports.animationProp = 'animation'
    exports.animationEndEvent = 'animationend'
  }
}