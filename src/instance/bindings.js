var Binding = require('../binding')
var Observer = require('../observe/observer')

/**
 * Setup the binding tree.
 *
 * Bindings form a tree-like structure that maps the Object structure
 * of observed data. However, only paths present in the templates are
 * created in the binding tree. When a change event from the data 
 * observer arrives on the instance, we traverse the binding tree
 * along the changed path, triggering binding updates along the way.
 * When we reach the path endpoint, if it has any children, we also
 * trigger updates on the entire sub-tree.
 *
 * Each instance has a root binding and it has three special children:
 * `$data`, `$parent` & `$root`. `$data` points to the root binding
 * itself. `$parent` and `$root` point to the instance's parent and
 * root's root bindings, respectively.
 */

exports._initBindings = function () {
  var root = this._rootBinding = new Binding()
  // the $data binding points to the root itself!
  root.children.$data = root
  // point $parent and $root bindings to their
  // repective owners.
  if (this.$parent) {
    root.children.$parent = this.$parent._rootBinding
    root.children.$root = this.$root._rootBinding
  }
  var self = this
  var updateBinding = function (path) {
    self._updateBinding(path)
  }
  this._observer
    .on('set', updateBinding)
    .on('add', updateBinding)
    .on('delete', updateBinding)
    .on('mutate', updateBinding)
}

/**
 * Create a binding for a given path, and create necessary
 * parent bindings along the path. Returns the binding at
 * the end of thep path.
 *
 * @param {Array} path - this should already be a parsed Array.
 * @return {Binding} - the binding created/retrieved at the destination.
 */

exports._createBindingAt = function (path) {
  var b = this._rootBinding
  var child, key
  for (var i = 0, l = path.length; i < l; i++) {
    key = path[i]
    child = b.children[key]
    if (!child) {
      child = new Binding()
      b.children[key] = child
    }
    b = child
  }
  return b
}

/**
 * Trigger a path update on the root binding.
 *
 * @param {String} path - this path comes directly from the
 *                        data observer, so it is a single string
 *                        delimited by "\b".
 */

exports._updateBinding = function (path) {
  path = path.split(Observer.pathDelimiter)
  this._rootBinding.updatePath(path)
}