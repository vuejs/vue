var _ = require('../util')
var applyCSSTransition = require('./css')
var applyJSTransition = require('./js')

/**
 * Append with transition.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Function} [cb]
 * @param {Vue} vm
 */

exports.append = function (el, target, cb, vm) {
  apply(el, 1, function () {
    target.appendChild(el)
    if (cb) cb()
  }, vm)
}

/**
 * InsertBefore with transition.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Function} [cb]
 * @param {Vue} vm
 */

exports.before = function (el, target, cb, vm) {
  apply(el, 1, function () {
    _.before(el, target)
    if (cb) cb()
  }, vm)
}

/**
 * Remove with transition.
 *
 * @oaram {Element} el
 * @param {Function} [cb]
 * @param {Vue} vm
 */

exports.remove = function (el, cb, vm) {
  apply(el, -1, function () {
    _.remove(el)
    if (cb) cb()
  }, vm)
}

/**
 * Remove by appending to another parent with transition.
 * This is only used in block operations.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Function} [cb]
 * @param {Vue} vm
 */

exports.removeThenAppend = function (el, target, cb, vm) {
  apply(el, -1, function () {
    target.appendChild(el)
    if (cb) cb()
  }, vm)
}

/**
 * Apply transitions with an operation callback.
 *
 * @oaram {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 */

var apply = exports.apply = function (el, direction, op, vm) {
  var transData = el.__v_trans
  if (
    !transData ||
    !vm._isCompiled ||
    // if the vm is being manipulated by a parent directive
    // during the parent's compilation phase, skip the
    // animation.
    (vm.$parent && !vm.$parent._isCompiled)
  ) {
    return op()
  }
  // determine the transition type on the element
  var jsTransition = vm.$options.transitions[transData.id]
  if (jsTransition) {
    // js
    applyJSTransition(
      el,
      direction,
      op,
      transData,
      jsTransition
    )
  } else if (_.transitionEndEvent) {
    // css
    applyCSSTransition(
      el,
      direction,
      op,
      transData
    )
  } else {
    // not applicable
    op()
  }
}