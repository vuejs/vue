var _ = require('../util')
var queue = require('./queue')
var addClass = _.addClass
var removeClass = _.removeClass
var transitionEndEvent = _.transitionEndEvent
var animationEndEvent = _.animationEndEvent
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'
var doc = typeof document === 'undefined' ? null : document

var TYPE_TRANSITION = 1
var TYPE_ANIMATION = 2

function Transition (el, id, hooks, vm) {
  this.el = el
  this.enterClass = id + '-enter'
  this.leaveClass = id + '-leave'
  this.hooks = hooks
  this.vm = vm
  // async state
  this.pendingCssEvent =
  this.pendingCssCb =
  this.jsCancel =
  this.pendingJsCb =
  this.op =
  this.cb = null
  this.typeCache = {}
  // bind
  var self = this
  ;['nextEnter', 'afterEnter', 'nextLeave', 'afterLeave']
    .forEach(function (m) {
      self[m] = _.bind(self[m], self)
    })
}

var p = Transition.prototype

p.enter = function (op, cb) {
  this.cancelPending()
  this.callHook('beforeEnter')
  this.cb = cb
  addClass(this.el, this.enterClass)
  op()
  queue.push(this.nextEnter)
}

p.nextEnter = function () {
  var enterHook = this.hooks && this.hooks.enter
  var afterEnter = this.afterEnter
  var expectsCb
  if (enterHook) {
    expectsCb = enterHook.length > 1
    if (expectsCb) {
      this.pendingJsCb = _.cancellable(afterEnter)
    }
    this.jsCancel = enterHook.call(this.vm, this.el, this.pendingJsCb)
  }
  var type = this.getCssTransitionType(this.enterClass)
  if (type === TYPE_TRANSITION) {
    // trigger transition by removing enter class now
    removeClass(this.el, this.enterClass)
    this.setupCssCb(transitionEndEvent, afterEnter)
  } else if (type === TYPE_ANIMATION) {
    this.setupCssCb(animationEndEvent, afterEnter)
  } else if (!expectsCb) {
    afterEnter()
  }
}

p.afterEnter = function () {
  this.jsCancel = this.pendingJsCb = null
  removeClass(this.el, this.enterClass)
  this.callHook('afterEnter')
  if (this.cb) this.cb()
}

p.leave = function (op, cb) {
  this.cancelPending()
  this.callHook('beforeLeave')
  this.op = op
  this.cb = cb
  addClass(this.el, this.leaveClass)
  var leaveHook = this.hooks && this.hooks.leave
  var expectsCb
  if (leaveHook) {
    expectsCb = leaveHook.length > 1
    if (expectsCb) {
      this.pendingJsCb = _.cancellable(this.afterLeave)
    }
    this.jsCancel = leaveHook.call(this.vm, this.el, this.pendingJsCb)
  }
  // only need to handle leave cb if no js cb is provided
  if (!expectsCb) {
    queue.push(this.nextLeave)
  }
}

p.nextLeave = function () {
  var type = this.getCssTransitionType(this.leaveClass)
  if (type) {
    var event = type === TYPE_TRANSITION
      ? transitionEndEvent
      : animationEndEvent
    this.setupCssCb(event, this.afterLeave)
  } else {
    this.afterLeave()
  }
}

p.afterLeave = function () {
  this.op()
  removeClass(this.el, this.leaveClass)
  this.callHook('afterLeave')
  if (this.cb) this.cb()
}

p.cancelPending = function () {
  this.op = this.cb = null
  var hasPending = false
  if (this.pendingCssCb) {
    hasPending = true
    _.off(this.el, this.pendingCssEvent, this.pendingCssCb)
    this.pendingCssEvent = this.pendingCssCb = null
  }
  if (this.pendingJsCb) {
    hasPending = true
    this.pendingJsCb.cancel()
    this.pendingJsCb = null
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass)
    removeClass(this.el, this.leaveClass)
  }
  if (this.jsCancel) {
    this.jsCancel.call(null)
    this.jsCancel = null
  }
}

p.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el)
  }
}

p.getCssTransitionType = function (className) {
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  if (!transitionEndEvent || (doc && doc.hidden)) {
    return
  }
  var type = this.typeCache[className]
  if (type) return type
  var inlineStyles = this.el.style
  var computedStyles = window.getComputedStyle(this.el)
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
    this.typeCache[className] = type
  }
  return type
}

p.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event
  var self = this
  var el = this.el
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      _.off(el, event, onEnd)
      self.pendingCssEvent = self.pendingCssCb = null
      if (!self.pendingJsCb && cb) {
        cb()
      }
    }
  }
  _.on(el, event, onEnd)
}

module.exports = Transition