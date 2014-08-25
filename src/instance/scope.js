var _ = require('../util')
var Emitter = require('../emitter')
var Observer = require('../observe/observer')
var scopeEvents = ['set', 'mutate', 'add', 'delete']
var allEvents = ['get', 'set', 'mutate', 'add', 'delete', 'add:self', 'delete:self']

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
  this._children = null
  this._childCtors = null
  this._initObserver()
  this._initData()
  this._initComputed()
  this._initMethods()
  // listen to parent scope events
  if (this.$parent && !this.$options.isolated) {
    this._linkScope()
  }
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
  var i = allEvents.length
  var event
  while (i--) {
    event = allEvents[i]
    dataOb.off(event, proxies[event])
  }
  // unset data reference
  this._data = null
  // stop propagating parent scope changes
  if (this._scopeListeners) {
    this._unlinkScope()
  }
}

/**
 * Setup the observer and data proxy handlers.
 */

exports._initObserver = function () {
  // create observer
  var ob = this.$observer = new Emitter(this)
  // setup data proxy handlers
  var proxies = this._dataProxies = {}
  allEvents.forEach(function (event) {
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
  var proxies = this._dataProxies
  var event
  i = allEvents.length
  while (i--) {
    event = allEvents[i]
    ob.on(event, proxies[event])
  }
}

/**
 * Listen to parent scope's events
 */

exports._linkScope = function () {
  var self = this
  var ob = this.$observer
  var pob = this.$parent.$observer
  var listeners = this._scopeListeners = {}
  scopeEvents.forEach(function (event) {
    var cb = listeners[event] = function (key, a, b) {
      // since these events come from upstream,
      // we only emit them if we don't have the same keys
      // shadowing them in current scope.
      if (!self.hasOwnProperty(key)) {
        ob.emit(event, key, a, b, true)
      }
    }
    pob.on(event, cb)
  })
}

/**
 * Stop listening to parent scope events
 */

exports._unlinkScope = function () {
  var pob = this.$parent.$observer
  var listeners = this._scopeListeners
  var i = scopeEvents.length
  var event
  while (i--) {
    event = scopeEvents[i]
    pob.off(event, listeners[event])
  }
  this._scopeListeners = null
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
  i = allEvents.length
  while (i--) {
    event = allEvents[i]
    proxy = proxies[event]
    newOb.on(event, proxy)
    oldOb.off(event, proxy)
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
 * Create a child instance that prototypally inehrits
 * data on parent. To achieve that we create an intermediate
 * constructor with its prototype pointing to parent.
 *
 * @param {Object} opts
 * @param {Function} [BaseCtor]
 */

exports._addChild = function (opts, BaseCtor) {
  BaseCtor = BaseCtor || _.Vue
  var ChildVue
  if (BaseCtor.options.isolated) {
    ChildVue = BaseCtor
  } else {
    var parent = this
    var ctors = parent._childCtors
    if (!ctors) {
      ctors = parent._childCtors = {}
    }
    ChildVue = ctors[BaseCtor.cid]
    if (!ChildVue) {
      ChildVue = function (options) {
        this.$parent = parent
        this.$root = parent.$root || parent
        this.constructor = ChildVue
        _.Vue.call(this, options)
      }
      ChildVue.options = BaseCtor.options
      ChildVue.prototype = this
      ctors[BaseCtor.cid] = ChildVue
    }
  }
  var child = new ChildVue(opts)
  if (!this._children) {
    this._children = []
  }
  this._children.push(child)
  return child
}

/**
 * Define a meta property, e.g $index, $key, $value
 * which only exists on the vm instance but not in $data.
 *
 * @param {String} key
 * @param {*} value
 */

exports._defineMeta = function (key, value) {
  if (this.hasOwnProperty('key')) {
    this[key] = value
    return
  }
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