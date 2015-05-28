var _ = require('../util')
var addClass = _.addClass
var removeClass = _.removeClass
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'
var doc = typeof document === 'undefined' ? null : document

var TYPE_TRANSITION = 1
var TYPE_ANIMATION = 2

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
 * @param {Vue} vm
 * @param {Function} [cb] - user supplied callback.
 */

function push (el, dir, op, cls, vm, cb) {
  queue.push({
    el  : el,
    dir : dir,
    cb  : cb,
    cls : cls,
    vm  : vm,
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
  var f = document.documentElement.offsetHeight
  queue.forEach(run)
  queue = []
  queued = false
  // dummy return, so js linters don't complain about unused
  // variable f
  return f
}

/**
 * Run a transition job.
 *
 * @param {Object} job
 */

function run (job) {

  var el = job.el
  var data = el.__v_trans
  var hooks = data.hooks
  var cls = job.cls
  var cb = job.cb
  var op = job.op
  var vm = job.vm
  var transitionType = getTransitionType(el, data, cls)

  if (job.dir > 0) { // ENTER

    // call javascript enter hook
    if (hooks && hooks.enter) {
      var expectsCb = hooks.enter.length > 1
      if (expectsCb) {
        data.hookCb = function () {
          data.hookCancel = data.hookCb = null
          if (hooks.afterEnter) {
            hooks.afterEnter.call(vm, el)
          }
          if (cb) cb()
        }
      }
      data.hookCancel = hooks.enter.call(vm, el, data.hookCb)
    }

    if (transitionType === TYPE_TRANSITION) {
      // trigger transition by removing enter class
      removeClass(el, cls)
      setupTransitionCb(_.transitionEndEvent)
    } else if (transitionType === TYPE_ANIMATION) {
      // animations are triggered when class is added
      // so we just listen for animationend to remove it.
      setupTransitionCb(_.animationEndEvent, function () {
        removeClass(el, cls)
      })
    } else if (!data.hookCb) {
      // no transition applicable
      removeClass(el, cls)
      if (hooks && hooks.afterEnter) {
        hooks.afterEnter.call(vm, el)
      }
      if (cb) {
        cb()
      }
    }

  } else { // LEAVE
    // only need to handle leave if there's no hook callback
    if (!data.hookCb) {
      if (transitionType) {
        // leave transitions/animations are both triggered
        // by adding the class, just remove it on end event.
        var event = transitionType === TYPE_TRANSITION
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
        if (!data.hookCb) {
          if (job.dir > 0 && hooks && hooks.afterEnter) {
            hooks.afterEnter.call(vm, el)
          }
          if (job.dir < 0 && hooks && hooks.afterLeave) {
            hooks.afterLeave.call(vm, el)
          }
          if (cb) {
            cb()
          }
        }
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
 */

function getTransitionType (el, data, className) {
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  if (!_.transitionEndEvent || (doc && doc.hidden)) {
    return
  }
  var type = data.cache && data.cache[className]
  if (type) return type
  var inlineStyles = el.style
  var computedStyles = window.getComputedStyle(el)
  var transDuration =
    inlineStyles[transDurationProp] ||
    computedStyles[transDurationProp]
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION
  } else {
    var animDuration =
      inlineStyles[animDurationProp] ||
      computedStyles[animDurationProp]
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION
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
 * @param {Vue} vm
 * @param {Function} cb
 */

module.exports = function (el, direction, op, data, vm, cb) {
  vm = el.__vue__ || vm
  var hooks = data.hooks
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
  // cancel function from js hooks
  if (data.hookCancel) {
    data.hookCancel()
    data.hookCancel = null
  }
  if (direction > 0) { // enter
    // enter class
    addClass(el, enterClass)
    // js hook
    if (hooks && hooks.beforeEnter) {
      hooks.beforeEnter.call(vm, el)
    }
    op()
    push(el, direction, null, enterClass, vm, cb)
  } else { // leave
    if (hooks && hooks.beforeLeave) {
      hooks.beforeLeave.call(vm, el)
    }
    // add leave class
    addClass(el, leaveClass)
    // execute js leave hook
    if (hooks && hooks.leave) {
      var expectsCb = hooks.leave.length > 1
      if (expectsCb) {
        data.hookCb = function () {
          data.hookCancel = data.hookCb = null
          op()
          removeClass(el, leaveClass)
          if (hooks && hooks.afterLeave) {
            hooks.afterLeave.call(vm, el)
          }
          if (cb) cb()
        }
      }
      data.hookCancel = hooks.leave.call(vm, el, data.hookCb)
    }
    push(el, direction, op, leaveClass, vm, cb)
  }
}
