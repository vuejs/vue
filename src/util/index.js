var _ = exports
var env = require('./env')
var lang = require('./lang')
var dom = require('./dom')

var mixin = lang.mixin

mixin(_, env)
mixin(_, lang)
mixin(_, dom)

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */

var strats = {}

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.created =
strats.ready =
strats.attached =
strats.detached =
strats.beforeDestroy =
strats.afterDestroy =
strats.paramAttributes = function (parentVal, childVal) {
  return (parentVal || []).concat(childVal || [])
}

/**
 * Assets, methods and computed properties are hash objects,
 * and are merged with prototypal inheritance.
 */

strats.directives =
strats.filters =
strats.partials =
strats.effects =
strats.components = 
strats.methods =
strats.computed = function (parentVal, childVal) {
  var ret = Object.create(parentVal || null)
  for (var key in childVal) {
    ret[key] = childVal[key]
  }
  return ret
}

/**
 * Default strategy - overwrite if child value is not undefined.
 */

var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Boolean} inheriting
 */

exports.mergeOptions = function (parent, child, inheriting) {
  var options = {}
  var key
  for (key in parent) {
    merge(key)
  }
  for (key in child) {
    if (!(key in parent)) {
      merge(key)
    }
  }
  function merge (key) {
    if (inheriting && (key === 'el' || key === 'data')) {
      _.warn(
        'The "' + key + '" option can only be used as an instantiation ' +
        'option and will be ignored in Vue.extend().'
      )
      return
    }
    var strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key])
  }
  return options
}

/**
 * Enable debug utilities. The enableDebug() function and all
 * _.log() & _.warn() calls will be dropped in the minified
 * production build.
 */

enableDebug()

function enableDebug () {

  var hasConsole = typeof console !== 'undefined'
  
  /**
   * Log a message.
   *
   * @param {String} msg
   */

  exports.log = function (msg) {
    if (hasConsole && config.debug) {
      console.log(msg)
    }
  }

  /**
   * We've got a problem here.
   *
   * @param {String} msg
   */

  exports.warn = function (msg) {
    if (hasConsole && !config.silent) {
      console.warn(msg)
      if (config.debug && console.trace) {
        console.trace(msg)
      }
    }
  }

}