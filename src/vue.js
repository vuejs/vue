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
  this._init(options)
}

var p = Vue.prototype

/**
 * Define prototype properties
 */

require('./internal/properties')(p)

/**
 * Mixin internal instance methods
 */

 _.mixin(p, require('./internal/init'))
 _.mixin(p, require('./internal/compile'))

/**
 * Mixin API instance methods
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