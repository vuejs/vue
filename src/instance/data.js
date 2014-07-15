var Observer = require('../observe/observer')

/**
 * Set the instances data object. Teasdown previous data
 * object if necessary, and setup syncing between the scope
 * and the data object.
 *
 * @param {Object} data
 * @param {Boolean} init
 */

exports._initData = function (data, init) {
  var scope = this.$scope
  var key

  if (!init) {
    // teardown old sync listeners
    this._unsync()
    // delete keys not present in the new data
    for (key in scope) {
      if (scope.hasOwnProperty(key) && !(key in data)) {
        scope.$delete(key)
      }
    }
  }

  // copy instantiation data into scope
  for (key in data) {
    if (scope.hasOwnProperty(key)) {
      // existing property, trigger set
      scope[key] = data[key]
    } else {
      // new property
      scope.$add(key, data[key])
    }
  }

  // sync scope and new data
  this._data = data
  this._dataObserver = Observer.create(data)
  this._sync()
}

/**
 * Setup two-way sync between the instance scope and
 * the original data. Requires teardown.
 */

exports._sync = function () {
  var data = this._data
  var scope = this.$scope
  var locked = false

  var listeners = this._syncListeners = {
    data: {
      set: guard(function (key, val) {
        data[key] = val
      }),
      added: guard(function (key, val) {
        data.$add(key, val)
      }),
      deleted: guard(function (key) {
        data.$delete(key)
      })
    },
    scope: {
      set: guard(function (key, val) {
        scope[key] = val
      }),
      added: guard(function (key, val) {
        scope.$add(key, val)
      }),
      deleted: guard(function (key) {
        scope.$delete(key)
      })
    }
  }

  // sync scope and original data.
  this._observer
    .on('set:self', listeners.data.set)
    .on('added:self', listeners.data.added)
    .on('deleted:self', listeners.data.deleted)

  this._dataObserver
    .on('set:self', listeners.scope.set)
    .on('added:self', listeners.scope.added)
    .on('deleted:self', listeners.scope.delted)

  /**
   * The guard function prevents infinite loop
   * when syncing between two observers.
   */

  function guard (fn) {
    return function (key, val) {
      if (locked) return
      locked = true
      fn(key, val)
      locked = false
    }
  }
}

/**
 * Teardown the sync between scope and previous data object.
 */

exports._unsync = function () {
  var listeners = this._syncListeners

  this._observer
    .off('set:self', listeners.data.set)
    .off('added:self', listeners.data.added)
    .off('deleted:self', listeners.data.deleted)

  this._dataObserver
    .off('set:self', listeners.scope.set)
    .off('added:self', listeners.scope.added)
    .off('deleted:self', listeners.scope.delted)
}