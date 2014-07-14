var _ = require('./util')

/**
 * The exposed Vue constructor.
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