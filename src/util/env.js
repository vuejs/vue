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

var defer = inBrowser
  ? (window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    setTimeout)
  : setTimeout

exports.nextTick = function (fn) {
  return defer(fn, 0)
}

/**
 * Detect if the environment allows creating
 * a function from strings.
 *
 * @type {Boolean}
 */

exports.hasEval = (function () {
  // chrome apps enforces CSP
  if (typeof chrome !== 'undefined' &&
      chrome.app &&
      chrome.app.runtime) {
    return false
  }
  // so does Firefox OS apps...
  if (inBrowser && navigator.getDeviceStorage) {
    return false
  }
  try {
    var f = new Function('', 'return true;')
    return f()
  } catch (e) {
    return false
  }
})()

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