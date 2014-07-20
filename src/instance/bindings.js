var Binding = require('../binding')
var Observer = require('../observe/observer')
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
  var self = this
  var updateBindings = function (path) {
    self._updateBindings(path)
  }
  this._observer
    .on('set', updateBindings)
    .on('add', updateBindings)
    .on('delete', updateBindings)
    .on('mutate', updateBindings)
}

/**
 * Create bindings along a path
 *
 * @param {String|Array} path
 */

exports._createBindings = function (path) {
  
}

/**
 * Traverse the binding tree
 *
 * @param {String} path
 */

exports._updateBindings = function (path) {
  path = path.split(Observer.pathDelimiter)
  this._rootBinding.updatePath(path)
}