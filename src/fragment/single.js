var _ = require('../util')
var transition = require('../transition')

/**
 * Single-node fragment, optimize insertion/removal for
 * single-node repeats.
 *
 * @param {Node} node
 * @param {Function} unlink
 * @param {Object} [scope]
 * @param {String} [id] - v-for id
 */

function SingleFragment (node, unlink, scope, id) {
  this.reused = false
  this.node = node
  node.__vfrag__ = this
  this.id = id
  this.scope = scope
  this.unlink = unlink
  this.inserted = false
}

/**
 * Insert fragment before target.
 *
 * @param {Node} target
 * @param {Boolean} trans
 */

SingleFragment.prototype.before = function (target, trans) {
  var method = trans !== false
    ? transition.before
    : _.before
  method(this.node, target, this.scope)
  this.inserted = true
}

/**
 * Remove fragment.
 */

SingleFragment.prototype.remove = function () {
  transition.remove(this.node, this.scope)
  this.inserted = false
}

/**
 * Destroy fragment.
 */

SingleFragment.prototype.destroy = function () {
  this.remove()
  this.unlink()
}

module.exports = SingleFragment
