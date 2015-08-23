var _ = require('../util')

/**
 * Exposed constructor that returns different fragment type
 * based on fragment childNodes length.
 *
 * @param {DocumentFragment} frag
 * @param {Function} unlink
 */

function Fragment (frag, unlink) {
  return frag.childNodes.length > 1
    ? new MultiFragment(frag, unlink)
    : new SingleFragment(frag.childNodes[0], unlink)
}

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
 * Shared destroy method
 */

MultiFragment.prototype.destroy =
SingleFragment.prototype.destroy = function () {
  this.remove()
  this.unlink()
}

module.exports = Fragment
