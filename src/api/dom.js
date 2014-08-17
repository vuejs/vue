var transition = require('../transition')

/**
 * Append instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 */

exports.$appendTo = function (target, cb) {
  target = query(target)
  if (this._isBlock) {
    blockOp(this, target, transition.append, cb)
  } else {
    transition.append(this.$el, target, cb, this)
  }
}

/**
 * Prepend instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 */

exports.$prependTo = function (target, cb) {
  target = query(target)
  if (target.hasChildNodes()) {
    this.$before(target.firstChild, cb)
  } else {
    this.$appendTo(target, cb)
  }
}

/**
 * Insert instance before target
 *
 * @param {Node} target
 * @param {Function} [cb]
 */

exports.$before = function (target, cb) {
  target = query(target)
  if (this._isBlock) {
    blockOp(this, target, transition.before, cb)
  } else {
    transition.before(this.$el, target, cb, this)
  }
}

/**
 * Insert instance after target
 *
 * @param {Node} target
 * @param {Function} [cb]
 */

exports.$after = function (target, cb) {
  target = query(target)
  if (target.nextSibling) {
    this.$before(target.nextSibling, cb)
  } else {
    this.$appendTo(target.parentNode, cb)
  }
}

/**
 * Remove instance from DOM
 *
 * @param {Function} [cb]
 */

exports.$remove = function (cb) {
  if (
    this._isBlock &&
    !this._blockFragment.hasChildNodes()
  ) {
    blockOp(
      this,
      this._blockFragment,
      transition.removeThenAppend,
      cb
    )
  } else if (this.$el.parentNode) {
    transition.remove(this.$el, cb, this)
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