var _ = require('../util')

/**
 * Single-node fragment, optimize insertion/removal for
 * single-node repeats.
 *
 * @param {Node} node
 * @param {Function} unlink
 */

function SingleFragment (node, unlink) {
  this.node = node
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
