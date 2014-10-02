var _ = require('../util')
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'

/**
 * Force layout before triggering transitions/animations
 */

var justReflowed = false

function reflow () {
  if (justReflowed) return
  justReflowed = true
  /* jshint unused: false */
  var f = document.documentElement.offsetHeight
  _.nextTick(unlock)
}

function unlock () {
  justReflowed = false
}

/**
 * Get an element's transition type based on the
 * calculated styles
 *
 * @param {Element} el
 * @param {Object} data
 * @param {String} className
 * @return {Number}
 *         1 - transition
 *         2 - animation
 */

function getTransitionType (el, data, className) {
  var type = data.cache && data.cache[className]
  if (type) return type
  var inlineStyles = el.style
  var computedStyles = window.getComputedStyle(el)
  var transDuration =
    inlineStyles[transDurationProp] ||
    computedStyles[transDurationProp]
  if (transDuration && transDuration !== '0s') {
    type = 1
  } else {
    var animDuration =
      inlineStyles[animDurationProp] ||
      computedStyles[animDurationProp]
    if (animDuration && animDuration !== '0s') {
      type = 2
    }
  }
  if (type) {
    if (!data.cache) data.cache = {}
    data.cache[className] = type
  }
  return type
}

/**
 * Apply CSS transition to an element.
 *
 * @param {Element} el
 * @param {Number} direction - 1: enter, -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Object} data - target element's transition data
 */

module.exports = function (el, direction, op, data, cb) {
  var classList = el.classList
  var prefix = data.id || 'v'
  var enterClass = prefix + '-enter'
  var leaveClass = prefix + '-leave'
  // clean up potential previous unfinished transition
  if (data.callback) {
    _.off(el, data.event, data.callback)
    classList.remove(enterClass)
    classList.remove(leaveClass)
    data.event = data.callback = null
  }
  var transitionType, onEnd, endEvent
  if (direction > 0) { // enter
    // Enter Transition
    classList.add(enterClass)
    op()
    transitionType = getTransitionType(el, data, enterClass)
    if (transitionType === 1) {
      reflow()
      classList.remove(enterClass)
      // only listen for transition end if user has sent
      // in a callback
      if (cb) {
        endEvent = data.event = _.transitionEndEvent
        onEnd = data.callback = function transitionCb (e) {
          if (e.target === el) {
            _.off(el, endEvent, onEnd)
            data.event = data.callback = null
            cb()
          }
        }
        _.on(el, endEvent, onEnd)
      }
    } else if (transitionType === 2) {
      // Enter Animation
      //
      // Animations are triggered automatically as the
      // element is inserted into the DOM, so we just
      // listen for the animationend event.
      endEvent = data.event = _.animationEndEvent
      onEnd = data.callback = function transitionCb (e) {
        if (e.target === el) {
          _.off(el, endEvent, onEnd)
          data.event = data.callback = null
          classList.remove(enterClass)
          if (cb) cb()
        }
      }
      _.on(el, endEvent, onEnd)
    } else {
      // no transition applicable
      classList.remove(enterClass)
      if (cb) cb()
    }

  } else { // leave

    classList.add(leaveClass)
    transitionType = getTransitionType(el, data, leaveClass)
    if (transitionType) {
      endEvent = data.event = transitionType === 1
        ? _.transitionEndEvent
        : _.animationEndEvent
      onEnd = data.callback = function transitionCb (e) {
        if (e.target === el) {
          _.off(el, endEvent, onEnd)
          data.event = data.callback = null
          // actually remove node here
          op()
          classList.remove(leaveClass)
          if (cb) cb()
        }
      }
      _.on(el, endEvent, onEnd)
    } else {
      op()
      classList.remove(leaveClass)
      if (cb) cb()
    }

  }
}