var _ = require('../util')
var transition = require('../transition')

/**
 * Abstraction for a partially-compiled fragment.
 * Can optionally compile content with a child scope.
 *
 * @param {Function} linker
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Vue} [host]
 * @param {Object} [scope]
 */

function Fragment (linker, vm, frag, host, scope) {
  this.unlink = linker(vm, frag, host, scope, this)
  this.scope = scope
  this.inserted = false
  this.children = []
  var single = this.single = frag.childNodes.length === 1
  if (single) {
    this.node = frag.childNodes[0]
    this.before = singleBefore
    this.remove = singleRemove
  } else {
    this.node = _.createAnchor('fragment-start')
    this.end = _.createAnchor('fragment-end')
    this.nodes = _.toArray(frag.childNodes)
    this.before = multiBefore
    this.remove = multiRemove
  }
  this.node.__vfrag__ = this
}

/**
 * Insert fragment before target, single node version
 *
 * @param {Node} target
 * @param {Boolean} trans
 */

function singleBefore (target, trans) {
  var method = trans !== false
    ? transition.before
    : _.before
  method(this.node, target, this.scope)
  this.inserted = true
}

/**
 * Remove fragment, single node version
 */

function singleRemove () {
  transition.remove(this.node, this.scope)
  this.inserted = false
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} trans
 */

function multiBefore (target, trans) {
  _.before(this.node, target)
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
 * Remove fragment, multi-nodes version
 */

function multiRemove () {
  var parent = this.node.parentNode
  var node = this.node.nextSibling
  var nodes = this.nodes = []
  var scope = this.scope
  var next
  while (node !== this.end) {
    nodes.push(node)
    next = node.nextSibling
    transition.remove(node, scope)
    node = next
  }
  parent.removeChild(this.node)
  parent.removeChild(this.end)
  this.inserted = false
}

module.exports = Fragment
