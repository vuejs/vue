// alias debug as _ so we can drop _.warn during uglification
var _ = require('./debug')
var extend = require('./lang').extend

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
  var ret = Object.create(
    vm && vm.$parent
      ? vm.$parent.$options[key]
      : null
  )
  extend(ret, parentVal) 
  extend(ret, childVal)
  return ret
}

/**
 * Other object hashes.
 * These are instance-specific and do not inehrit from nested parents.
 */

strats.methods =
strats.computed =
strats.events = function (parentVal, childVal) {
  var ret = Object.create(null)
  extend(ret, parentVal)
  extend(ret, childVal)
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

exports.mergeOptions = function (parent, child, vm) {
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