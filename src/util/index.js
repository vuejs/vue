var _ = exports
var config = require('../config')
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
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
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
 * Assets
 *
 * When a vm is present (instance creation), we need to do a
 * 3-way merge for assets: constructor assets, instance assets,
 * and instance scope assets.
 */

strats.directives =
strats.filters =
strats.partials =
strats.effects =
strats.components = function (parentVal, childVal, key, vm) {
  var ret = Object.create(vm.$parent
    ? vm.$parent.$options[key]
    : null)
  mixin(ret, parentVal) 
  mixin(ret, childVal)
  return ret
}

/**
 * Methods and computed properties
 */

strats.methods =
strats.computed = function (parentVal, childVal) {
  var ret = Object.create(parentVal || null)
  mixin(ret, childVal)
  return ret
}

/**
 * Default strategy
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
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

_.mergeOptions = function (parent, child, vm) {
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
    if (!vm && (key === 'el' || key === 'data' || key === 'parent')) {
      _.warn(
        'The "' + key + '" option can only be used as an instantiation ' +
        'option and will be ignored in Vue.extend().'
      )
      return
    }
    var strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], key, vm)
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

  _.log = function (msg) {
    if (hasConsole && config.debug) {
      console.log(msg)
    }
  }

  /**
   * We've got a problem here.
   *
   * @param {String} msg
   */

  _.warn = function (msg) {
    if (hasConsole && !config.silent) {
      console.warn(msg)
      if (config.debug && console.trace) {
        console.trace(msg)
      }
    }
  }

}