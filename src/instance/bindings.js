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
  this._bindings = Object.create(null)
  this._bindings.$data = new Binding()
  // setup observer events
  var update = this._updateBindingAt
  this.$observer
    // simple updates
    .on('set', update)
    .on('mutate', update)
    .on('delete', update)
    // adding properties is a bit different
    .on('add', updateAdd)
    // collect dependency
    .on('get', collectDep)
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
  this._notifyChildren(path)
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
  this._updateBindingAt(path)
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