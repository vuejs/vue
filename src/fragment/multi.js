var _ = require('../util')

/**
 * Multi-node fragment that has a start and an end node.
 *
 * @param {Node} node
 * @param {Function} unlink
 */

function MultiFragment (frag, unlink) {
  this.start = _.createAnchor('fragment')
  this.end = _.createAnchor('fragment')
  this.frag = frag
  this.unlink = unlink
}

/**
 * Insert fragment before target.
 *
 * @param {Node} target
 */

MultiFragment.prototype.before = function (target) {
  _.before(this.start, target)
  _.before(this.frag, target)
  _.before(this.end, target)
}

/**
 * Remove fragment.
 */

MultiFragment.prototype.remove = function () {
  var parent = this.start.parentNode
  var node = this.start.nextSibling
  while (node !== this.end) {
    this.frag.appendChild(node)
  }
  parent.removeChild(this.start)
  parent.removeChild(this.end)
}

/**
 * Destroy fragment.
 */

MultiFragment.prototype.destroy = function () {
  this.remove()
  this.unlink()
}

module.exports = MultiFragment
