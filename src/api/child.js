var _ = require('../util')

/**
 * Create a child instance.
 *
 * @param {Object} opts
 * @param {Function} [BaseCtor]
 * @return {Vue}
 * @public
 */

exports.$addChild = function (opts, BaseCtor) {
  var ChildVue = BaseCtor || _.Vue
  var parent = this
  opts = opts || {}
  opts._parent = parent
  opts._root = parent.$root
  var child = new ChildVue(opts)
  return child
}
