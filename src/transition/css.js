var _ = require('../util')
var addClass = _.addClass
var removeClass = _.removeClass
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'

var queue = []
var queued = false

/**
 * Push a job into the transition queue, which is to be
 * executed on next frame.
 *
 * @param {Element} el    - target element
 * @param {Number} dir    - 1: enter, -1: leave
 * @param {Function} op   - the actual dom operation
 * @param {String} cls    - the className to remove when the
 *                          transition is done.
 * @param {Function} [cb] - user supplied callback.
 */

function push (el, dir, op, cls, cb) {
  queue.push({
    el  : el,
    dir : dir,
    cb  : cb,
    cls : cls,
    op  : op
  })
  if (!queued) {
    queued = true
    _.nextTick(flush)
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush () {
  /* jshint unused: false */
  var f = document.documentElement.offsetHeight
  queue.forEach(run)
  queue = []
  queued = false
}

/**
 * Run a transition job.
 *
 * @param {Object} job
 */

function run (job) {

  var el = job.el
  var data = el.__v_trans
  var cls = job.cls
  var cb = job.cb
  var op = job.op
  var transitionType = getTransitionType(el, data, cls)

  if (job.dir > 0) { // ENTER
    if (transitionType === 1) {
      // trigger transition by removing enter class
      removeClass(el, cls)
      // only need to listen for transitionend if there's
      // a user callback
      if (cb) setupTransitionCb(_.transitionEndEvent)
    } else if (transitionType === 2) {
      // animations are triggered when class is added
      // so we just listen for animationend to remove it.
      setupTransitionCb(_.animationEndEvent, function () {
        removeClass(el, cls)
      })
    } else {
      // no transition applicable
      removeClass(el, cls)
      if (cb) cb()
    }
  } else { // LEAVE
    if (transitionType) {
      // leave transitions/animations are both triggered
      // by adding the class, just remove it on end event.
      var event = transitionType === 1
        ? _.transitionEndEvent
        : _.animationEndEvent
      setupTransitionCb(event, function () {
        op()
        removeClass(el, cls)
      })
    } else {
      op()
      removeClass(el, cls)
      if (cb) cb()
    }
  }

  /**
   * Set up a transition end callback, store the callback
   * on the element's __v_trans data object, so we can
   * clean it up if another transition is triggered before
   * the callback is fired.
   *
   * @param {String} event
   * @param {Function} [cleanupFn]
   */

  function setupTransitionCb (event, cleanupFn) {
    data.event = event
    var onEnd = data.callback = function transitionCb (e) {
      if (e.target === el) {
        _.off(el, event, onEnd)
        data.event = data.callback = null
        if (cleanupFn) cleanupFn()
        if (cb) cb()
      }
    }
    _.on(el, event, onEnd)
  }
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
  var prefix = data.id || 'v'
  var enterClass = prefix + '-enter'
  var leaveClass = prefix + '-leave'
  // clean up potential previous unfinished transition
  if (data.callback) {
    _.off(el, data.event, data.callback)
    removeClass(el, enterClass)
    removeClass(el, leaveClass)
    data.event = data.callback = null
  }
  if (direction > 0) { // enter
    addClass(el, enterClass)
    op()
    push(el, direction, null, enterClass, cb)
  } else { // leave
    addClass(el, leaveClass)
    push(el, direction, op, leaveClass, cb)
  }
}