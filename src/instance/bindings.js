var Binding = require('../binding')
var Path = require('../parse/path')

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
  root.addChild('$data', root)
  // point $parent and $root bindings to their
  // repective owners.
  if (this.$parent) {
    root.addChild('$parent', this.$parent._rootBinding)
    root.addChild('$root', this.$root._rootBinding)
  }
  // observer already has callback context set to `this`
  var update = this._updateBindingAt
  this._observer
    .on('set', update)
    .on('add', update)
    .on('delete', update)
    .on('mutate', update)
}

/**
 * Retrive a binding at a given path.
 * If `create` is true, create all bindings that do not
 * exist yet along the way.
 *
 * @param {String} path
 * @param {Boolean} fromObserver
 * @return {Binding|undefined}
 */

exports._getBindingAt = function (path, fromObserver) {
  return fromObserver
    ? Path.getFromObserver(this._rootBinding, path)
    : Path.get(this._rootBinding, path)
}

/**
 * Create a binding at a given path. Will also create
 * all bindings that do not exist yet along the way.
 *
 * @param {Array} path
 * @return {Binding}
 */

exports._createBindingAt = function (path) {
  var b = this._rootBinding
  var child, key
  for (var i = 0, l = path.length; i < l; i++) {
    key = path[i]
    child = b.children[key] || b.addChild(key)
    b = child
  }
  return b
}

/**
 * Trigger update for the binding at given path.
 *
 * @param {String} path - this path comes directly from the
 *                        data observer, so it is a single string
 *                        delimited by "\b".
 */

exports._updateBindingAt = function (path) {
  var binding = this._getBindingAt(path, true)
  if (binding) {
    binding.notify()
  }
}