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
  this.parents = null
  if (value) {
    _.define(value, '$observer', this)
    if (type === ARRAY) {
      _.augment(value, arrayAugmentations)
      this.link(value)
    } else if (type === OBJECT) {
      _.augment(value, objectAugmentations)
      this.walk(value)
    }
  }
}

var p = Observer.prototype = Object.create(Emitter.prototype)

/**
 * Simply concatenating the path segments with `.` cannot
 * deal with keys that happen to contain the dot.
 *
 * Instead of the dot, we use the backspace character
 * which is much less likely to appear in property keys.
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
 * Walk through each property, converting them and adding them as child.
 * This method should only be called when value type is Object.
 *
 * @param {Object} obj
 */

p.walk = function (obj) {
  var key, val
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) return
    val = obj[key]
    this.observe(key, val)
    this.convert(key, val)
  }
}

/**
 * Link a list of Array items to the observer.
 *
 * @param {Array} items
 */

p.link = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    this.observe(i, items[i])
  }
}

/**
 * Unlink a list of Array items from the observer.
 *
 * @param {Array} items
 */

p.unlink = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    this.unobserve(items[i], i)
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
    // register self as a parent of the child observer.
    (ob.parents || (ob.parents = [])).push({
      ob: this,
      key: key
    })
  }
}

/**
 * Unobserve a property.
 * If it has an observer, remove it from children.
 *
 * @param {*} val
 */

p.unobserve = function (val) {
  if (val && val.$observer) {
    var parents = val.$observer.parents
    var i = parents.length
    while (i--) {
      if (parents[i].ob === this) {
        parents.splice(i, 1)
        break
      }
    }
    if (!parents.length) {
      val.$observer.parents = null
    }
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
      ob.notify('get', key)
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      ob.unobserve(val)
      ob.observe(key, newVal)
      ob.notify('set', key, newVal)
      if (_.isArray(newVal)) {
        ob.notify('set', key + delimiter + 'length', newVal.length)
      }
      val = newVal
    }
  })
}

/**
 * Emit event on self and recursively notify all parents.
 *
 * @param {String} event
 * @param {String} path
 * @param {*} val
 * @param {Object|undefined} mutation
 */

p.notify = function (event, path, val, mutation) {
  this.emit(event, path, val, mutation)
  if (!this.parents) return
  for (var i = 0, l = this.parents.length; i < l; i++) {
    var parent = this.parents[i]
    var ob = parent.ob
    var key = parent.key
    var parentPath = path
      ? key + delimiter + path
      : key
    ob.notify(event, parentPath, val, mutation)
  }
}

module.exports = Observer