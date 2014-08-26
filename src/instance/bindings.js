var Binding = require('../binding')
var Path = require('../parse/path')
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
  this._bindings = Object.create(null)
  this._createBindingAt('$data')
  // setup observer events
  this.$observer
    // simple updates
    .on('set', updateBindingAt)
    .on('mutate', updateBindingAt)
    .on('delete', updateBindingAt)
    // adding properties is a bit different
    .on('add', updateAdd)
    // collect dependency
    .on('get', collectDep)
}

/**
 * Create a binding at a given path. Will also create
 * all bindings that do not exist yet along the way.
 *
 * @param {String} path
 * @return {Binding}
 */

exports._createBindingAt = function (path) {
  return this._bindings[path] = new Binding()
}

/**
 * Trigger update for the binding at given path.
 *
 * @param {String} path
 * @param {String} k - unused
 * @param {*} v - unused
 * @param {Boolean} fromScope
 */

function updateBindingAt (path, k, v, fromScope) {
  // the '$data' binding updates on any change,
  // but only if the change is not from parent scopes
  if (!fromScope) {
    this._bindings.$data._notify()
  }
  var binding = this._bindings[path]
  if (binding) {
    binding._notify()
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

function updateAdd (path) {
  var index = path.lastIndexOf(Observer.pathDelimiter)
  if (index > -1) path = path.slice(0, index)
  updateBindingAt.call(this, path)
}

/**
 * Collect dependency for the target directive being
 * evaluated.
 *
 * @param {String} path
 */

function collectDep (path) {
  var watcher = this._activeWatcher
  // the get event might have come from a child vm's watcher
  // so this._activeWatcher is not guarunteed to be defined
  if (watcher) {
    watcher.addDep(path)
  }
}