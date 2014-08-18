/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

exports.guard = function (value) {
  return value === undefined
    ? ''
    : value
}

/**
 * Check and convert possible numeric numbers before
 * setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

exports.guardNumber = function (value) {
  return (
    isNaN(value) ||
    value === null ||
    typeof value === 'boolean'
  ) ? value
    : Number(value)
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

exports.stripQuotes = function (str) {
  var a = str.charCodeAt(0)
  var b = str.charCodeAt(str.length - 1)
  return a === b && (a === 0x22 || a === 0x27)
    ? str.slice(1, -1)
    : false
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

exports.bind = function (fn, ctx) {
  return function () {
    return fn.apply(ctx, arguments)
  }
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [i] - start index
 * @return {Array}
 */

var slice = [].slice
exports.toArray = function (list, i) {
  return slice.call(list, i || 0)
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

exports.extend = function (to, from) {
  for (var key in from) {
    to[key] = from[key]
  }
}

/**
 * Mixin including non-enumerables, and copy property
 * descriptors.
 *
 * @param {Object} to
 * @param {Object} from
 */

exports.deepMixin = function (to, from) {
  Object.getOwnPropertyNames(from).forEach(function (key) {
    var desc =Object.getOwnPropertyDescriptor(from, key)
    Object.defineProperty(to, key, desc)
  })
}

/**
 * Proxy a property on one object to another.
 *
 * @param {Object} to
 * @param {Object} from
 * @param {String} key
 */

exports.proxy = function (to, from, key) {
  if (to.hasOwnProperty(key)) return
  Object.defineProperty(to, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      return from[key]
    },
    set: function (val) {
      from[key] = val
    }
  })
}

/**
 * Object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString
exports.isObject = function (obj) {
  return toString.call(obj) === '[object Object]'
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isArray = function (obj) {
  return Array.isArray(obj)
}

/**
 * Define a non-enumerable property
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

exports.define = function (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value        : val,
    enumerable   : !!enumerable,
    writable     : true,
    configurable : true
  })
}

/**
 * Augment an target Object or Array by either
 * intercepting the prototype chain using __proto__,
 * or copy over property descriptors
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

exports.augment = '__proto__' in {}
  ? function (target, proto) {
      target.__proto__ = proto
    }
  : exports.deepMixin