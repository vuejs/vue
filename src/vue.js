var _        = require('./util'),
    Compiler = require('./compiler/compiler')

/**
 *  The exposed Vue constructor.
 */
function Vue (options) {
    this._compiler = new Compiler(this, options)
}

// mixin instance methods
var p = Vue.prototype
_.mixin(p, require('./instance/lifecycle'))
_.mixin(p, require('./instance/data'))
_.mixin(p, require('./instance/dom'))
_.mixin(p, require('./instance/events'))

// mixin asset registers
_.mixin(Vue, require('./api/asset-register'))

// static methods
Vue.config    = require('./api/config')
Vue.use       = require('./api/use')
Vue.require   = require('./api/require')
Vue.extend    = require('./api/extend')
Vue.nextTick  = require('./util').nextTick

module.exports = Vue