/**
 * Are we in a browser or in Node?
 * Calling toString on window has inconsistent results in
 * browsers so we do it on the document instead.
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
 * Detect transition and animation end events.
 */

var testElement = inBrowser
  ? document.createElement('div')
  : undefined

exports.transitionEndEvent = (function () {
  if (inBrowser) {
    var map = {
      'webkitTransition' : 'webkitTransitionEnd',
      'transition'       : 'transitionend',
      'mozTransition'    : 'transitionend'
    }
    for (var prop in map) {
      if (testElement.style[prop] !== undefined) {
        return map[prop]
      }
    }
  }
})()

exports.animationEndEvent = inBrowser
  ? testElement.style.animation !== undefined
    ? 'animationend'
    : 'webkitAnimationEnd'
  : undefined