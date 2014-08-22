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
  var op = withTransition === false
    ? _.append
    : transition.append
  insert(this, target, op, cb, withTransition)
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
  var op = withTransition === false
    ? _.before
    : transition.before
  insert(this, target, op, cb, withTransition)
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
  var shouldCallHook = this._isAttached && _.inDoc(this.$el)
  var self = this
  var realCb = function () {
    if (shouldCallHook) {
      self._callHook('detached')
    }
    if (cb) cb()
  }
  if (
    this._isBlock &&
    !this._blockFragment.hasChildNodes()
  ) {
    op = withTransition === false
      ? _.append
      : transition.removeThenAppend 
    blockOp(this, this._blockFragment, op, realCb)
  } else if (this.$el.parentNode) {
    op = withTransition === false
      ? _.remove
      : transition.remove
    op(this.$el, realCb, this)
  }
}

/**
 * Shared DOM insertion function.
 *
 * @param {Vue} vm
 * @param {Element} target
 * @param {Function} op
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 */

function insert (vm, target, op, cb, withTransition) {
  target = query(target)
  var shouldCallHook =
    !vm._isAttached &&
    !_.inDoc(vm.$el) &&
    _.inDoc(target)
  var realCb = function () {
    if (shouldCallHook) {
      vm._callHook('attached')
    }
    if (cb) cb()
  }
  if (vm._isBlock) {
    blockOp(vm, target, op, realCb)
  } else {
    op(vm.$el, target, realCb, vm)
  }
  if (withTransition === false) {
    realCb()
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