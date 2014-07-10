var _ = require('../util')
var Emitter = require('../emitter')
var arrayAugmentations = require('./array-augmentations')
var objectAugmentations = require('./object-augmentations')

/**
 * Type enums
 */

var ARRAY  = 0
var OBJECT = 1

/**
 * Observer class that are attached to each observed
 * object. Observers can connect to each other like nodes
 * to map the hierarchy of data objects. Once connected,
 * detected change events can propagate up the nested chain.
 *
 * The constructor can be invoked without arguments to
 * create a value-less observer that simply listens to
 * other observers.
 *
 * @constructor
 * @extends Emitter
 * @param {Array|Object} [value]
 * @param {Number} [type]
 */

function Observer (value, type) {
  Emitter.call(this)
  this.value = value
  this.type = type
  this.initiated = false
  this.adaptors = Object.create(null)
  if (value) {
    _.define(value, '$observer', this)
  }
}

var p = Observer.prototype = Object.create(Emitter.prototype)

/**
 * Instead of the dot, we use the backspace character
 * which is much less likely to appear as property keys
 * in JavaScript.
 */

var delimiter = Observer.pathDelimiter = '\b'

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @return {Observer|undefined}
 * @static
 */

Observer.create = function (value) {
  if (value && value.$observer) {
    return value.$observer
  } if (_.isArray(value)) {
    return new Observer(value, ARRAY)
  } else if (_.isObject(value)) {
    return new Observer(value, OBJECT)
  }
}

/**
 * Initialize the observation based on value type.
 * Should only be called once.
 */

p.init = function () {
  var value = this.value
  if (this.type === ARRAY) {
    _.augment(value, arrayAugmentations)
    this.link(value)
  } else if (this.type === OBJECT) {
    _.augment(value, objectAugmentations)
    this.walk(value)
  }
  this.initiated = true
}

/**
 * Walk through each property, converting them and adding them as child.
 * This method should only be called when value type is Object.
 *
 * @param {Object} obj
 */

p.walk = function (obj) {
  var key, val
  for (key in obj) {
    val = obj[key]
    this.observe(key, val)
    this.convert(key, val)
  }
}

/**
 * If a property is observable,
 * create an Observer for it and add it as a child.
 * This method is called only on properties observed
 * for the first time.
 *
 * @param {String} key
 * @param {*} val
 */

p.observe = function (key, val) {
  var ob = Observer.create(val)
  if (ob) {
    this.add(key, ob)
    if (ob.initiated) {
      this.deliver(key, val)
    } else {
      ob.init()
    }
  }
  // emit an initial set event
  this.emit('set', key, val)
  if (_.isArray(val)) {
    this.emit('set', key + delimiter + 'length', val.length)
  }
}

/**
 * Unobserve a property.
 * If it has an observer, remove it from children.
 *
 * @param {String} key
 * @param {*} val
 */

p.unobserve = function (key, val) {
  if (val && val.$observer) {
    this.remove(key, val.$observer)
  }
}

/**
 * Convert a tip value into getter/setter so we can emit
 * the events when the property is accessed/changed.
 * Properties prefixed with `$` or `_` are ignored.
 *
 * @param {String} key
 * @param {*} val
 */

p.convert = function (key, val) {
  var prefix = key.charAt(0)
  if (prefix === '$' || prefix === '_') {
    return
  }
  var ob = this
  Object.defineProperty(this.value, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      ob.emit('get', key)
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      ob.unobserve(key, val)
      ob.observe(key, newVal)
      val = newVal
    }
  })
}

/**
 * Link a list of items to the observer's value Array.
 * When any of these items emit change event, the Array will be notified.
 * This method should only be called when value type is Array.
 *
 * @param {Array} items
 */

p.link = function (items) {
  
}

/**
 * Unlink the items from the observer's value Array.
 *
 * @param {Array} items
 */

p.unlink = function (items) {
  
}

/**
 * Walk through an already observed object and emit its tip values.
 * This is necessary because newly observed objects emit their values
 * during init; for already observed ones we can skip the initialization,
 * but still need to emit the values.
 *
 * @param {String} key
 * @param {*} val
 */

p.deliver = function (key, val) {
  
}

/**
 * Add a child observer for a property key,
 * capture its get/set/mutate events and relay the events
 * while prepending a key segment to the path.
 *
 * @param {String} key
 * @param {Observer} ob
 */

p.add = function (key, ob) {
  var self = this
  var base = key + delimiter
  var adaptors = this.adaptors[key] = {}

  adaptors.get = function (path) {
    path = base + path
    self.emit('get', path)
  }

  adaptors.set = function (path, val) {
    path = base + path
    self.emit('set', path, val)
  }

  adaptors.mutate = function (path, val, mutation) {
    // if path is empty string, the mutation
    // comes directly from an Array
    path = path
      ? base + path
      : key
    self.emit('mutate', path, val, mutation)
    // also emit for length
    self.emit('set', path + delimiter + 'length', val.length)
  }

  ob.on('get', adaptors.get)
    .on('set', adaptors.set)
    .on('mutate', adaptors.mutate)
}

/**
 * Remove a child observer.
 *
 * @param {String} key
 * @param {Observer} ob
 */

p.remove = function (key, ob) {
  var adaptors = this.adaptors[key]
  this.adaptors[key] = null
  ob.off('get', adaptors.get)
    .off('set', adaptors.set)
    .off('mutate', adaptors.mutate)
}

module.exports = Observer