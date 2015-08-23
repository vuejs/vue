var _ = require('../util')

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
}

/**
 * Insert fragment before target.
 *
 * @param {Node} target
 */

SingleFragment.prototype.before = function (target) {
  _.before(this.node, target)
}

/**
 * Remove fragment.
 */

SingleFragment.prototype.remove = function () {
  _.remove(this.node)
}

/**
 * Destroy fragment.
 */

SingleFragment.prototype.destroy = function () {
  this.remove()
  this.unlink()
}

module.exports = SingleFragment
