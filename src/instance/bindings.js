var Binding = require('../binding')
var Observer = require('../observe/observer')

/**
 * Setup the bindings.
 *
 * Each accessed path in templates have a correspinding
 * binding object. When a change is detected and emitted
 * from the $observer, the corresponding binding notifies
 * all its subscribing watchers to trigger updates.
 */

exports._initBindings = function () {
  this._bindings.$data = new Binding()
  // setup observer events
  var update = this._updateBindingAt
  this.$observer
    // simple updates
    .on('set', update)
    .on('mutate', update)
    .on('delete', update)
    // adding properties is a bit different
    .on('add', this._updateAdd)
    .on('get', this._collectDep)
}

/**
 * Trigger update for the binding at given path.
 *
 * @param {String} path
 * @param {*} v - unused value
 * @param {*} m - unused mutation
 * @param {Boolean} fromScope
 */

exports._updateBindingAt = function (path, v, m, fromScope) {
  if (!fromScope) {
    // the '$data' binding updates on any change,
    // but only if the change is not from parent scopes
    this._bindings.$data._notify()
  }
  var binding = this._bindings[path]
  if (binding) {
    if (fromScope) {
      // changes coming from scope upstream, only update
      // if we don't have a property shadowing it.
      var i = path.indexOf(Observer.pathDelimiter)
      var baseKey = i > 0
        ? path.slice(0, i)
        : path
      if (!this.hasOwnProperty(baseKey)) {
        binding._notify()
      }
    } else {
      binding._notify()
    }
  }
  // only broadcast if there are children actually listening
  // on this path
  if (this._childBindingCount[path]) {
    this._notifyChildren(path)
  }
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

/**
 * Create a binding at a given path, and goes up the scope
 * chain to increase each parent's binding count at this
 * path by 1. This allows us to easily determine whether we
 * need to traverse down the scope to broadcast a data
 * change. A similar technique is used in Angular's
 * $broadcast implementation.
 *
 * @param {String} path
 * @return {Binding}
 */

exports._createBindingAt = function (path) {
  var binding = this._bindings[path] = new Binding()
  var parent = this.$parent
  var count
  while (parent) {
    count = parent._childBindingCount
    count[path] = (count[path] || 0) + 1
    parent = parent.$parent
  }
  return binding
}

/**
 * Teardown a binding.
 *
 * @param {String} path
 */

exports._teardownBindingAt = function (path) {
  this._bindings[path]._subs.length = 0
  var parent = this.$parent
  while (parent) {
    parent._childBindingCount[path]--
    parent = parent.$parent
  }
}

/**
 * For newly added properties, since its binding has not
 * been created yet, directives will not have it as a
 * dependency yet. However, they will have its parent as a
 * dependency. Therefore here we remove the last segment
 * from the path and notify the added property's parent
 * instead.
 *
 * @param {String} path
 */

exports._updateAdd = function (path) {
  var index = path.lastIndexOf(Observer.pathDelimiter)
  if (index > -1) path = path.slice(0, index)
  this._updateBindingAt(path)
}

/**
 * Collect a path as a dependency, adding it to the current
 * active watcher whose getter is being evaluated.
 *
 * @param {String} path
 */

exports._collectDep = function(path) {
  var watcher = this._activeWatcher
  if (watcher) {
    watcher.addDep(path)
  }
}