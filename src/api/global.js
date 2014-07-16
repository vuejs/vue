var _ = require('../util')
var config = require('../config')

/**
 * Vue and every constructor that extends Vue has an associated
 * options object, which can be accessed during compilation steps
 * as `this.constructor.options`.
 */

exports.options = {
  directives : require('../directives'),
  filters    : require('../filters'),
  partials   : {},
  effects    : {},
  components : {}
}

/**
 * Expose useful internals
 */

exports.util = _
exports.config = config
exports.nextTick = _.nextTick
exports.transition = require('../transition/transition')

/**
 * Class inehritance
 *
 * @param {Object} extendOptions
 */

exports.extend = function (extendOptions) {
  var Super = this
  var Sub = function (instanceOptions) {
    var mergedOptions = _.mergeOptions(Sub.options, instanceOptions)
    Super.call(this, mergedOptions)
  }
  Sub.prototype = Object.create(Super.prototype)
  _.define(Sub.prototype, 'constructor', Sub)
  Sub.options = _.mergeOptions(Super.options, extendOptions)
  Sub.super = Super
  // allow further extension
  Sub.extend = Super.extend
  // create asset registers, so extended classes
  // can have their private assets too.
  createAssetRegisters(Sub)
}

/**
 * Plugin system
 *
 * @param {String|Object} plugin
 */

exports.use = function (plugin) {
  if (typeof plugin === 'string') {
    try {
      plugin = require(plugin)
    } catch (e) {
      _.warn('Cannot load plugin: ' + plugin)
    }
  }
  // additional parameters
  var args = [].slice.call(arguments, 1)
  args.unshift(this)
  if (typeof plugin.install === 'function') {
    plugin.install.apply(plugin, args)
  } else {
    plugin.apply(null, args)
  }
  return this
}

/**
 * Define asset registration methods on a constructor.
 *
 * @param {Function} Ctor
 */

createAssetRegisters(exports)
function createAssetRegisters (Ctor) {
  config.assetTypes.forEach(function (type) {

    /**
     * Asset registration method.
     *
     * @param {String} id
     * @param {*} definition
     */

    Ctor[type] = function (id, definition) {
      this.options[type + 's'][id] = definition
    }
  })
}