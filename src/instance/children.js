var _ = require('../util')

/**
 * Create a child instance that prototypally inehrits
 * data on parent. To achieve that we create an intermediate
 * constructor with its prototype pointing to parent.
 *
 * @param {Object} opts
 * @param {Function} [BaseCtor]
 * @return {Vue}
 * @public
 */

exports.$addChild = function (opts, BaseCtor) {
  BaseCtor = BaseCtor || _.Vue
  var ChildVue
  if (BaseCtor.options.isolated) {
    ChildVue = BaseCtor
  } else {
    var parent = this
    var ctors = parent._childCtors
    if (!ctors) {
      ctors = parent._childCtors = {}
    }
    ChildVue = ctors[BaseCtor.cid]
    if (!ChildVue) {
      ChildVue = function (options) {
        this.$parent = parent
        this.$root = parent.$root || parent
        this.constructor = ChildVue
        _.Vue.call(this, options)
      }
      ChildVue.options = BaseCtor.options
      ChildVue.prototype = this
      ctors[BaseCtor.cid] = ChildVue
    }
  }
  var child = new ChildVue(opts)
  if (!this._children) {
    this._children = []
  }
  this._children.push(child)
  return child
}

/**
 * Propagate a path update down the scope chain, notifying
 * all non-isolated child instances.
 *
 * @param {String} path
 */

exports._notifyChildren = function (path) {
  var children = this._children
  if (children) {
    var i = children.length
    var child
    while (i--) {
      child = children[i]
      if (!child.$options.isolated) {
        child._updateBindingAt(path, null, null, true)
      }
    }
  }
}