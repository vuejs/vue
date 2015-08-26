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

function Fragment (linker, vm, frag, host, scope, parentFrag) {
  this.children = []
  this.childFrags = []
  this.scope = scope
  this.inserted = false
  this.parentFrag = parentFrag
  if (parentFrag) {
    parentFrag.childFrags.push(this)
  }
  this.unlink = linker(vm, frag, host, scope, this)
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

Fragment.prototype.callHook = function (hook) {
  var i, l
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i])
  }
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook)
  }
}

Fragment.prototype.destroy = function () {
  if (this.parentFrag) {
    this.parentFrag.childFrags.$remove(this)
  }
  this.unlink()
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
  if (_.inDoc(this.node)) {
    this.callHook(attach)
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove () {
  var shouldCallRemove = _.inDoc(this.node)
  transition.remove(this.node, this.scope)
  this.inserted = false
  if (shouldCallRemove) {
    this.callHook(detach)
  }
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
  if (_.inDoc(this.node)) {
    this.callHook(attach)
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove () {
  var shouldCallRemove = _.inDoc(this.node)
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
  if (shouldCallRemove) {
    this.callHook(detach)
  }
}

function attach (child) {
  if (!child._isAttached) {
    child._callHook('attached')
  }
}

function detach (child) {
  if (child._isAttached) {
    child._callHook('detached')
  }
}

module.exports = Fragment
