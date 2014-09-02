var _ = require('../util')
var Observer = require('../observer')
var Binding = require('../binding')

/**
 * Setup the data scope of an instance.
 *
 * We need to setup the instance $observer, which emits
 * data change events. The $observer relays events from
 * the $data's observer, because $data might be swapped
 * and the data observer might change.
 *
 * If the instance has a parent and is not isolated, we
 * also need to listen to parent scope events and propagate
 * changes down here.
 */

exports._initScope = function () {
  // this._initObserver()
  this._initData()
  this._initComputed()
  this._initMethods()
  this._initMeta()
}

/**
 * Teardown the scope.
 */

exports._teardownScope = function () {
  var dataOb = this._data.__ob__
  dataOb.vmCount--
  dataOb.tryRelease()
  // unset data reference
  this._data = null
}

/**
 * Initialize the data. 
 */

exports._initData = function () {
  // proxy data on instance
  var data = this._data
  var keys = Object.keys(data)
  var i = keys.length
  while (i--) {
    this._proxy(keys[i])
  }
  // observe data
  var ob = Observer.create(data)
  ob.vmCount++
}

/**
 * Swap the isntance's $data. Called in $data's setter.
 *
 * @param {Object} newData
 */

exports._setData = function (newData) {
  var oldData = this._data
  this._data = newData
  var keys, key, i
  // unproxy keys not present in new data
  keys = Object.keys(oldData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!_.isReserved(key) && !(key in newData)) {
      this._unproxy(key)
    }
  }
  // proxy keys not already proxied,
  // and trigger change for changed values
  keys = Object.keys(newData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!this.hasOwnProperty(key) && !_.isReserved(key)) {
      // new property
      this._proxy(key)
    }
  }
  // observe new / teardown old
  var newOb = Observer.create(newData)
  var oldOb = oldData.__ob__
  newOb.vmCount++
  oldOb.vmCount--
  // memory managment, important!
  oldOb.tryRelease()
  // update ALL watchers
  for (key in this._watchers) {
    this._watchers[key].update()
  }
  for (key in this._userWatchers) {
    this._userWatchers[key].update()
  }
}

/**
 * Proxy a property, so that
 * vm.prop === vm._data.prop
 *
 * @param {String} key
 */

exports._proxy = function (key) {
  if (!_.isReserved(key)) {
    // need to store ref to self here
    // because these getter/setters might
    // be called by child instances!
    var self = this
    Object.defineProperty(self, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return self._data[key]
      },
      set: function proxySetter (val) {
        self._data[key] = val
      }
    })
  }
}

/**
 * Unproxy a property.
 *
 * @param {String} key
 */

exports._unproxy = function (key) {
  delete this[key]
}

/**
 * Setup computed properties. They are essentially
 * special getter/setters
 */

function noop () {}
exports._initComputed = function () {
  var computed = this.$options.computed
  if (computed) {
    for (var key in computed) {
      var def = computed[key]
      if (typeof def === 'function') {
        def = {
          get: _.bind(def, this),
          set: noop
        }
      } else {
        def.get = def.get
          ? _.bind(def.get, this)
          : noop
        def.set = def.set
          ? _.bind(def.set, this)
          : noop
      }
      def.enumerable = true
      def.configurable = true
      Object.defineProperty(this, key, def)
    }
  }
}

/**
 * Setup instance methods. Methods must be bound to the
 * instance since they might be called by children
 * inheriting them.
 */

exports._initMethods = function () {
  var methods = this.$options.methods
  if (methods) {
    for (var key in methods) {
      this[key] = _.bind(methods[key], this)
    }
  }
}

/**
 * Initialize meta information like $index, $key & $value.
 */

exports._initMeta = function () {
  var metas = this.$options._meta
  if (metas) {
    for (var key in metas) {
      this._defineMeta(key, metas[key])
    }
  }
}

/**
 * Define a meta property, e.g $index, $key, $value
 * which only exists on the vm instance but not in $data.
 *
 * @param {String} key
 * @param {*} value
 */

exports._defineMeta = function (key, value) {
  var binding = new Binding()
  Object.defineProperty(this, key, {
    enumerable: true,
    configurable: true,
    get: function metaGetter () {
      if (Observer.target) {
        Observer.target.addDep(binding)
      }
      return value
    },
    set: function metaSetter (val) {
      if (val !== value) {
        value = val
        binding.notify()
      }
    }
  })
}