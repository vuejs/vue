var _ = require('../util')
var Observer = require('../observe/observer')
var scopeEvents = ['set', 'mutate', 'add', 'delete']

/**
 * Setup instance scope.
 * The scope is reponsible for prototypal inheritance of
 * parent instance propertiesm abd all binding paths and
 * expressions of the current instance are evaluated against its scope.
 *
 * This should only be called once during _init().
 */

exports._initScope = function () {
  var parent = this.$parent
  var scope = this.$scope = parent
    ? Object.create(parent.$scope)
    : {}
  // create scope observer
  this._observer = Observer.create(scope, {
    callbackContext: this,
    doNotAlterProto: true
  })

  if (!parent) return

  // relay change events that sent down from
  // the scope prototype chain.
  var ob = this._observer
  var pob = parent._observer
  var listeners = this._scopeListeners = {}
  scopeEvents.forEach(function (event) {
    var cb = listeners[event] = function (key, a, b) {
      // since these events come from upstream,
      // we only emit them if we don't have the same keys
      // shadowing them in current scope.
      if (!scope.hasOwnProperty(key)) {
        ob.emit(event, key, a, b)
      }
    }
    pob.on(event, cb)
  })
}

/**
 * Teardown scope and remove listeners attached to parent scope.
 * Only called once during $destroy().
 */

exports._teardownScope = function () {
  this.$scope = null
  if (!this.$parent) return
  var pob = this.$parent._observer
  var listeners = this._scopeListeners
  scopeEvents.forEach(function (event) {
    pob.off(event, listeners[event])
  })
}

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
  var key

  if (!init) {
    // teardown old sync listeners
    this._teardownData()
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
  if (this.$options.syncData) {
    this._dataObserver = Observer.create(data)
    this._sync()
  }
}

/**
 * Stop data-syncing.
 */

exports._teardownData = function () {
  if (this.$options.syncData) {
    this._unsync()
  }
}

/**
 * Proxy the scope properties on the instance itself,
 * so that vm.a === vm.$scope.a.
 *
 * Note this only proxies *local* scope properties. We want to
 * prevent child instances accidentally modifying properties
 * with the same name up in the scope chain because scope
 * perperties are all getter/setters.
 *
 * To access parent properties through prototypal fall through,
 * access it on the instance's $scope.
 *
 * This should only be called once during _init().
 */

exports._initProxy = function () {
  var options = this.$options
  var scope = this.$scope

  // scope --> vm

  // proxy scope data on vm
  for (var key in scope) {
    if (scope.hasOwnProperty(key)) {
      _.proxy(this, scope, key)
    }
  }
  // keep proxying up-to-date with added/deleted keys.
  this._observer
    .on('add:self', function (key) {
      _.proxy(this, scope, key)
    })
    .on('delete:self', function (key) {
      delete this[key]
    })

  // vm --> scope

  // proxy vm parent & root on scope
  _.proxy(scope, this, '$parent')
  _.proxy(scope, this, '$root')
}

/**
 * Setup computed properties.
 * All computed properties are proxied onto the scope.
 * Because they are accessors their `this` context will
 * be the instance instead of the scope.
 */

function noop () {}

exports._initComputed = function () {
  var computed = this.$options.computed
  var scope = this.$scope
  if (computed) {
    for (var key in computed) {
      var def = computed[key]
      if (typeof def === 'function') {
        def = {
          get: def,
          set: noop
        }
      }
      def.enumerable = true
      def.configurable = true
      Object.defineProperty(this, key, def)
      _.proxy(scope, this, key)
    }
  }
}

/**
 * Setup instance methods.
 * Methods are also copied into scope, but they must
 * be bound to the instance.
 */

exports._initMethods = function () {
  var methods = this.$options.methods
  var scope = this.$scope
  if (methods) {
    for (var key in methods) {
      var method = methods[key]
      this[key] = method
      scope[key] = _.bind(method, this)
    }
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