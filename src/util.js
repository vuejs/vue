/**
 * Mix properties into target object.
 *
 * @param {Object} target
 * @param {Object} mixin
 */

exports.mixin = function (target, mixin) {
  for (var key in mixin) {
    if (target[key] !== mixin[key]) {
      target[key] = mixin[key]
    }
  }
}

/**
 * Object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isObject = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
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
 */

exports.define = function (obj, key, val) {
  Object.defineProperty(obj, key, {
    value        : val,
    enumerable   : false,
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

if ('__proto__' in {}) {
  exports.augment = function (target, proto) {
    target.__proto__ = proto
  }
} else {
  exports.augment = function (target, proto) {
    Object.getOwnPropertyNames(proto).forEach(function (key) {
      var descriptor = Object.getOwnPropertyDescriptor(proto, key)
      Object.defineProperty(target, key, descriptor)
    })
  }
}