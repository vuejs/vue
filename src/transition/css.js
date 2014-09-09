var _ = require('../util')
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'

/**
 * Force layout before triggering transitions/animations.
 * This function ensures we only do it once per event loop.
 */

var forcedLayout = false
function forceLayout () {
  if (!forcedLayout) {
    /* jshint unused: false */
    var f = document.documentElement.offsetHeight
    forcedLayout = true
    _.nextTick(function () {
      forcedLayout = false
    })
  }
}

/**
 * Get an element's transition type based on the
 * calculated styles
 *
 * @param {Element} el
 * @return {Number}
 *         1 - transition
 *         2 - animation
 */

function getTransitionType (el) {
  var inlineStyles = el.style
  var computedStyles = window.getComputedStyle(el)
  var transDuration =
    inlineStyles[transDurationProp] ||
    computedStyles[transDurationProp]
  if (transDuration && transDuration !== '0s') {
    return 1
  } else {
    var animDuration =
      inlineStyles[animDurationProp] ||
      computedStyles[animDurationProp]
    if (animDuration && animDuration !== '0s') {
      return 2
    }
  }
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
    transitionType = getTransitionType(el)
    if (transitionType === 1) {
      forceLayout()
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

    // we need to add the class here before we can sniff
    // the transition type, and before that we need to
    // force a layout so the element picks up all transition
    // css rules.
    forceLayout()
    classList.add(leaveClass)
    transitionType = getTransitionType(el)
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