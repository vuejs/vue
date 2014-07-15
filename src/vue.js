var _ = require('./util')

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
  this.$options = options = options || {}
  // create scope
  this._initScope()
  // setup initial data.
  this._initData(options.data || {}, true)
  // setup property proxying
  this._initProxy()
  // setup root binding
  this._initBindings()
}

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

_.mixin(p, require('./instance/scope'))
_.mixin(p, require('./instance/data'))
_.mixin(p, require('./instance/proxy'))
_.mixin(p, require('./instance/bindings'))
_.mixin(p, require('./instance/compile'))

/**
 * Mixin public API methods
 */

_.mixin(p, require('./api/data'))
_.mixin(p, require('./api/dom'))
_.mixin(p, require('./api/events'))
_.mixin(p, require('./api/lifecycle'))

/**
 * Mixin global API
 */

_.mixin(Vue, require('./api/global'))

module.exports = Vue