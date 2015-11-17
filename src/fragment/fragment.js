import {
  createAnchor,
  before,
  prepend,
  inDoc,
  mapNodeRange,
  removeNodeRange
} from '../util/index'

import {
  beforeWithTransition,
  removeWithTransition
} from '../transition/index'

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

export default function Fragment (linker, vm, frag, host, scope, parentFrag) {
  this.children = []
  this.childFrags = []
  this.vm = vm
  this.scope = scope
  this.inserted = false
  this.parentFrag = parentFrag
  if (parentFrag) {
    parentFrag.childFrags.push(this)
  }
  this.unlink = linker(vm, frag, host, scope, this)
  var single = this.single =
    frag.childNodes.length === 1 &&
    // do not go single mode if the only node is an anchor
    !(frag.childNodes[0].__vue_anchor)
  if (single) {
    this.node = frag.childNodes[0]
    this.before = singleBefore
    this.remove = singleRemove
  } else {
    this.node = createAnchor('fragment-start')
    this.end = createAnchor('fragment-end')
    this.frag = frag
    prepend(this.node, frag)
    frag.appendChild(this.end)
    this.before = multiBefore
    this.remove = multiRemove
  }
  this.node.__vfrag__ = this
}

/**
 * Call attach/detach for all components contained within
 * this fragment. Also do so recursively for all child
 * fragments.
 *
 * @param {Function} hook
 */

Fragment.prototype.callHook = function (hook) {
  var i, l
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i])
  }
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook)
  }
}

/**
 * Destroy the fragment.
 */

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
 * @param {Boolean} withTransition
 */

function singleBefore (target, withTransition) {
  this.inserted = true
  var method = withTransition !== false
    ? beforeWithTransition
    : before
  method(this.node, target, this.vm)
  if (inDoc(this.node)) {
    this.callHook(attach)
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove () {
  this.inserted = false
  var shouldCallRemove = inDoc(this.node)
  var self = this
  self.callHook(destroyChild)
  removeWithTransition(this.node, this.vm, function () {
    if (shouldCallRemove) {
      self.callHook(detach)
    }
    self.destroy()
  })
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function multiBefore (target, withTransition) {
  this.inserted = true
  var vm = this.vm
  var method = withTransition !== false
    ? beforeWithTransition
    : before
  mapNodeRange(this.node, this.end, function (node) {
    method(node, target, vm)
  })
  if (inDoc(this.node)) {
    this.callHook(attach)
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove () {
  this.inserted = false
  var self = this
  var shouldCallRemove = inDoc(this.node)
  self.callHook(destroyChild)
  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
    if (shouldCallRemove) {
      self.callHook(detach)
    }
    self.destroy()
  })
}

/**
 * Call attach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function attach (child) {
  if (!child._isAttached) {
    child._callHook('attached')
  }
}

/**
 * Call destroy for all contained instances,
 * with remove:false and defer:true.
 * Defer is necessary because we need to
 * keep the children to call detach hooks
 * on them.
 *
 * @param {Vue} child
 */

function destroyChild (child) {
  child.$destroy(false, true)
}

/**
 * Call detach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function detach (child) {
  if (child._isAttached) {
    child._callHook('detached')
  }
}
