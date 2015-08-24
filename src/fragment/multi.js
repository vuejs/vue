var _ = require('../util')
var transition = require('../transition')

/**
 * Multi-node fragment that has a start and an end node.
 *
 * @param {Node} node
 * @param {Function} unlink
 * @param {Object} [scope]
 */

function MultiFragment (frag, unlink, scope) {
  this.start = this.node = _.createAnchor('fragment-start')
  this.end = _.createAnchor('fragment-end')
  this.node.__vfrag__ = this
  this.reused = false
  this.inserted = false
  this.nodes = _.toArray(frag.childNodes)
  this.scope = scope
  this.unlink = unlink
}

/**
 * Insert fragment before target.
 *
 * @param {Node} target
 * @param {Boolean} trans
 */

MultiFragment.prototype.before = function (target, trans) {
  _.before(this.start, target)
  var nodes = this.nodes
  var scope = this.scope
  var method = trans !== false
    ? transition.before
    : _.before
  for (var i = 0, l = nodes.length; i < l; i++) {
    method(nodes[i], target, scope)
  }
  _.before(this.end, target)
  this.inserted = true
}

/**
 * Remove fragment.
 */

MultiFragment.prototype.remove = function () {
  var parent = this.start.parentNode
  var node = this.start.nextSibling
  var nodes = this.nodes = []
  var scope = this.scope
  var next
  while (node !== this.end) {
    nodes.push(node)
    next = node.nextSibling
    transition.remove(node, scope)
    node = next
  }
  parent.removeChild(this.start)
  parent.removeChild(this.end)
  this.inserted = false
}

/**
 * Destroy fragment.
 */

MultiFragment.prototype.destroy = function () {
  this.remove()
  this.unlink()
}

module.exports = MultiFragment
