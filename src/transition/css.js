var _ = require('../util')
var Batcher = require('../batcher')
var batcher = new Batcher()
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'

/**
 * Force layout before triggering transitions/animations
 */

batcher._preFlush = function () {
  /* jshint unused: false */
  var f = document.body.offsetHeight
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
  var styles = window.getComputedStyle(el)
  if (styles[transDurationProp] !== '0s') {
    return 1
  } else if (styles[animDurationProp] !== '0s') {
    return 2
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

module.exports = function (el, direction, op, data) {
  var classList = el.classList
  var callback = data.callback
  var prefix = data.id || 'v'
  var enterClass = prefix + '-enter'
  var leaveClass = prefix + '-leave'
  // clean up potential previously running transitions
  if (data.callback) {
    _.off(el, data.event, callback)
    classList.remove(enterClass)
    classList.remove(leaveClass)
    data.event = data.callback = null
  }
  var transitionType, onEnd, endEvent

  if (direction > 0) { // enter

    classList.add(enterClass)
    op()
    transitionType = getTransitionType(el)
    if (transitionType === 1) {
      // Enter Transition
      //
      // We need to force a reflow to have the enterClass
      // applied before removing it to trigger the
      // transition, so they are batched to make sure
      // there's only one reflow for everything.
      batcher.push({
        run: function () {
          classList.remove(enterClass)
        }
      })
    } else if (transitionType === 2) {
      // Enter Animation
      //
      // Animations are triggered automatically as the
      // element is inserted into the DOM, so we just
      // listen for the animationend event.
      endEvent = data.event = _.animationEndEvent
      onEnd = data.callback = function (e) {
        if (e.target === el) {
          _.off(el, endEvent, onEnd)
          data.event = data.callback = null
          classList.remove(enterClass)
        }
      }
      _.on(el, endEvent, onEnd)
    }

  } else { // leave

    transitionType = getTransitionType(el)
    if (
      transitionType &&
      (el.offsetWidth || el.offsetHeight)
    ) {
      // Leave Transition/Animation
      //
      // We push it to the batcher to ensure it triggers
      // in the same frame with other enter transitions
      // happening at the same time.
      batcher.push({
        run: function () {
          classList.add(leaveClass)
        }
      })
      endEvent = data.event = transitionType === 1
        ? _.transitionEndEvent
        : _.animationEndEvent
      onEnd = data.callback = function (e) {
        if (e.target === el) {
          _.off(el, endEvent, onEnd)
          data.event = data.callback = null
          // actually remove node here
          op()
          classList.remove(leaveClass)
        }
      }
      _.on(el, endEvent, onEnd)
    } else {
      op()
    }

  }
}