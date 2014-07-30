var extend = require('./util').extend

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefiexed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue (options) {
  this._init(options)
}

/**
 * Build up the prototype
 */

var p = Vue.prototype

/**
 * The $root recursively points to the root instance.
 *
 * @readonly
 */

Object.defineProperty(p, '$root', {
  get: function () {
    return this.$parent
      ? this.$parent.$root
      : this
  }
})

/**
 * $data has a setter which does a bunch of teardown/setup work
 */

Object.defineProperty(p, '$data', {
  get: function () {
    return this._data
  },
  set: function (newData) {
    this._initData(newData)
  }
})

/**
 * Mixin internal instance methods
 */

extend(p, require('./instance/init'))
extend(p, require('./instance/scope'))
extend(p, require('./instance/data'))
extend(p, require('./instance/proxy'))
extend(p, require('./instance/bindings'))
extend(p, require('./instance/element'))
extend(p, require('./instance/compile'))

/**
 * Mixin public API methods
 */

extend(p, require('./api/data'))
extend(p, require('./api/dom'))
extend(p, require('./api/events'))
extend(p, require('./api/lifecycle'))

/**
 * Mixin global API
 */

extend(Vue, require('./api/global'))

module.exports = Vue