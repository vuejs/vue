/* global chrome */

/**
 * Are we in a browser or in Node?
 * Calling toString on window has inconsistent results in browsers
 * so we do it on the document instead.
 *
 * @type {Boolean}
 */

var inBrowser = exports.inBrowser =
  typeof document !== 'undefined' &&
  Object.prototype.toString.call(document) === '[object HTMLDocument]'

/**
 * Defer a task to the start of the next event loop
 *
 * @param {Function} fn
 */

exports.nextTick = inBrowser
  ? (window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    setTimeout)
  : setTimeout

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
  : null

exports.transitionEndEvent = (function () {
  if (!inBrowser) {
    return null
  }
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
})()

exports.animationEndEvent = inBrowser
  ? testElement.style.animation !== undefined
    ? 'animationend'
    : 'webkitAnimationEnd'
  : null