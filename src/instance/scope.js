var _ = require('../util')
var Emitter = require('../emitter')
var Observer = require('../observe/observer')
var dataEvents = [
  'get',
  'set',
  'mutate',
  'add',
  'delete',
  'add:self',
  'delete:self'
]

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
  this._initObserver()
  this._initData()
  this._initComputed()
  this._initMethods()
  this._initMeta()
}

/**
 * Teardown the scope.
 */

exports._teardownScope = function () {
  // turn of instance observer
  this.$observer.off()
  // stop relaying data events
  var dataOb = this._data.__ob__
  var proxies = this._dataProxies
  var i = dataEvents.length
  var event
  while (i--) {
    event = dataEvents[i]
    dataOb.off(event, proxies[event])
  }
  dataOb.vmOwnerCount--
  dataOb.tryRelease()
  // unset data reference
  this._data = this._dataProxies = null
}

/**
 * Setup the observer and data proxy handlers.
 */

exports._initObserver = function () {
  // create observer
  var ob = this.$observer = new Emitter(this)
  // setup data proxy handlers
  var proxies = this._dataProxies = {}
  dataEvents.forEach(function (event) {
    proxies[event] = function (a, b, c) {
      ob.emit(event, a, b, c)
    }
  })
  var self = this
  proxies['add:self'] = function (key) {
    self._proxy(key)
  }
  proxies['delete:self'] = function (key) {
    self._unproxy(key)
  }
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
  // relay data changes
  var ob = Observer.create(data)
  ob.vmOwnerCount++
  var proxies = this._dataProxies
  var event
  i = dataEvents.length
  while (i--) {
    event = dataEvents[i]
    ob.on(event, proxies[event])
  }
}

/**
 * Swap the isntance's $data. Called in $data's setter.
 *
 * @param {Object} newData
 */

exports._setData = function (newData) {
  var ob = this.$observer
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
      ob.emit('delete', key)
    }
  }
  // proxy keys not already proxied,
  // and trigger change for changed values
  keys = Object.keys(newData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (this.hasOwnProperty(key)) {
      // existing property, emit set if different
      if (newData[key] !== oldData[key]) {
        ob.emit('set', key, newData[key])
      }
    } else {
      // new property
      this._proxy(key)
      ob.emit('add', key, newData[key])
    }
  }
  // teardown/setup data proxies
  var newOb = Observer.create(newData)
  var oldOb = oldData.__ob__
  var proxies = this._dataProxies
  var event, proxy
  i = dataEvents.length
  while (i--) {
    event = dataEvents[i]
    proxy = proxies[event]
    newOb.on(event, proxy)
    oldOb.off(event, proxy)
  }
  newOb.vmOwnerCount++
  oldOb.vmOwnerCount--
  // memory managment, important!
  oldOb.tryRelease()
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
      get: function () {
        return self._data[key]
      },
      set: function (val) {
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
  var ob = this.$observer
  Object.defineProperty(this, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      if (Observer.emitGet) {
        ob.emit('get', key)
      }
      return value
    },
    set: function (val) {
      if (val !== value) {
        value = val
        ob.emit('set', key, val)
      }
    }
  })
  ob.emit('add', key, value)
}