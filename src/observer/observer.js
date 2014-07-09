var _ = require('../util')
var Emitter = require('../emitter')
var arrayAugmentations = require('./array-augmentations')
var objectAugmentations = require('./object-augmentations')

// Type enums

var ARRAY  = 0
var OBJECT = 1

/**
 * Observer class that are attached to each observed
 * object. They are essentially event emitters, but can
 * connect to each other like nodes to map the hierarchy
 * of data objects. Once connected, detected change events
 * can propagate up the nested object chain.
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
  this.children = Object.create(null)
  if (value) {
    _.define(value, '$observer', this)
  }
}

var p = Observer.prototype = Object.create(Emitter.prototype)

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
  var key, val, ob
  for (key in obj) {
    val = obj[key]
    ob = Observer.create(val)
    if (ob) {
      this.add(key, ob)
      if (ob.initiated) {
        this.deliver(key, val)
      } else {
        ob.init()
      }
    } else {
      this.convert(key, val)
    }
  }
}

/**
 * Link a list of items to the observer's value Array.
 * When any of these items emit change event, the Array will be notified.
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
 * Convert a tip value into getter/setter so we can emit the events
 * when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

p.convert = function (key, val) {
  
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

}

/**
 * Remove a child observer.
 *
 * @param {String} key
 * @param {Observer} ob
 */

p.remove = function (key, ob) {
  
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @return {Observer}
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

module.exports = Observer