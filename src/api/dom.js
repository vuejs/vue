var _ = require('../util')
var transition = require('../transition')

/**
 * Append instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 */

exports.$appendTo = function (target, cb, withTransition) {
  target = query(target)
  var op = withTransition === false
    ? _.append
    : transition.append
  if (this._isBlock) {
    blockOp(this, target, op, cb)
  } else {
    op(this.$el, target, cb, this)
  }
  if (cb && !withTransition) {
    cb()
  }
}

/**
 * Prepend instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 */

exports.$prependTo = function (target, cb, withTransition) {
  target = query(target)
  if (target.hasChildNodes()) {
    this.$before(target.firstChild, cb, withTransition)
  } else {
    this.$appendTo(target, cb, withTransition)
  }
}

/**
 * Insert instance before target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 */

exports.$before = function (target, cb, withTransition) {
  target = query(target)
  var op = withTransition === false
    ? _.before
    : transition.before 
  if (this._isBlock) {
    blockOp(this, target, op, cb)
  } else {
    op(this.$el, target, cb, this)
  }
  if (cb && !withTransition) {
    cb()
  }
}

/**
 * Insert instance after target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 */

exports.$after = function (target, cb, withTransition) {
  target = query(target)
  if (target.nextSibling) {
    this.$before(target.nextSibling, cb, withTransition)
  } else {
    this.$appendTo(target.parentNode, cb, withTransition)
  }
}

/**
 * Remove instance from DOM
 *
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 */

exports.$remove = function (cb, withTransition) {
  var op
  if (
    this._isBlock &&
    !this._blockFragment.hasChildNodes()
  ) {
    op = withTransition === false
      ? _.append
      : transition.removeThenAppend 
    blockOp(this, this._blockFragment, op, cb)
  } else if (this.$el.parentNode) {
    op = withTransition === false
      ? _.remove
      : transition.remove
    op(this.$el, cb, this)
  }
}

/**
 * Execute a transition operation on a block instance,
 * iterating through all its block nodes.
 *
 * @param {Vue} vm
 * @param {Node} target
 * @param {Function} op
 * @param {Function} cb
 */

function blockOp (vm, target, op, cb) {
  var current = vm._blockStart
  var end = vm._blockEnd
  var next
  while (next !== end) {
    next = current.nextSibling
    op(current, target, null, vm)
    current = next
  }
  op(end, target, cb, vm)
}

/**
 * Check for selectors
 *
 * @param {String|Element} el
 */

function query (el) {
  return typeof el === 'string'
    ? document.querySelector(el)
    : el
}