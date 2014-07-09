var _ = require('../util')
var Emitter = require('../emitter')

/**
 * Observer class that are attached to each observed
 * object. They are essentially event emitters, but can
 * connect to each other and relay the events up the nested
 * object chain.
 *
 * @constructor
 * @extends Emitter
 * @private
 */

function Observer () {
  Emitter.call(this)
  this.connections = Object.create(null)
}

var p = Observer.prototype = Object.create(Emitter.prototype)

/**
 * Observe an object of unkown type.
 *
 * @param {*} obj
 * @return {Boolean} - returns true if successfully observed.
 */

p.observe = function (obj) {
  if (obj && obj.$observer) {
    // already observed
    return
  }
  if (_.isArray(obj)) {
    this.observeArray(obj)
    return true
  }
  if (_.isObject(obj)) {
    this.observeObject(obj)
    return true
  }
}

/**
 * Connect to another Observer instance,
 * capture its get/set/mutate events and relay the events
 * while prepending a key segment to the path.
 *
 * @param {Observer} target
 * @param {String} key
 */

p.connect = function (target, key) {

}

/**
 * Disconnect from a connected target Observer.
 *
 * @param {Observer} target
 * @param {String} key
 */

p.disconnect = function (target, key) {
  
}

/**
 * Mixin Array and Object observe methods
 */

_.mixin(p, require('./array'))
_.mixin(p, require('./object'))

module.exports = Observer