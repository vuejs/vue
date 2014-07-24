var Observer = require('../observe/observer')

/**
 * Setup the instances data object.
 *
 * Properties are copied into the scope object to take advantage of
 * prototypal inheritance.
 *
 * If the `syncData` option is true, Vue will maintain property
 * syncing between the scope and the original data object, so that
 * any changes to the scope are synced back to the passed in object.
 * This is useful internally when e.g. creating v-repeat instances
 * with no alias.
 *
 * If swapping data object with the `$data` accessor, teardown
 * previous sync listeners and delete keys not present in new data.
 *
 * @param {Object} data
 * @param {Boolean} init - if not ture, indicates its a `$data` swap.
 */

exports._initData = function (data, init) {
  var scope = this.$scope
  var options = this.$options
  var key

  if (!init) {
    // teardown old sync listeners
    if (options.syncData) {
      this._unsync()
    }
    // delete keys not present in the new data
    for (key in scope) {
      if (scope.hasOwnProperty(key) && !(key in data)) {
        scope.$delete(key)
      }
    }
  }

  // copy properties into scope
  for (key in data) {
    if (scope.hasOwnProperty(key)) {
      // existing property, trigger set
      scope[key] = data[key]
    } else {
      // new property
      scope.$add(key, data[key])
    }
  }

  // setup sync between scope and new data
  this._data = data
  if (options.syncData) {
    this._dataObserver = Observer.create(data)
    this._sync()
  }
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
      add: guard(function (key, val) {
        data.$add(key, val)
      }),
      delete: guard(function (key) {
        data.$delete(key)
      })
    },
    scope: {
      set: guard(function (key, val) {
        scope[key] = val
      }),
      add: guard(function (key, val) {
        scope.$add(key, val)
      }),
      delete: guard(function (key) {
        scope.$delete(key)
      })
    }
  }

  // sync scope and original data.
  this._observer
    .on('set:self', listeners.data.set)
    .on('add:self', listeners.data.add)
    .on('delete:self', listeners.data.delete)

  this._dataObserver
    .on('set:self', listeners.scope.set)
    .on('add:self', listeners.scope.add)
    .on('delete:self', listeners.scope.delete)

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
    .off('add:self', listeners.data.add)
    .off('delete:self', listeners.data.delete)

  this._dataObserver
    .off('set:self', listeners.scope.set)
    .off('add:self', listeners.scope.add)
    .off('delete:self', listeners.scope.delete)
}