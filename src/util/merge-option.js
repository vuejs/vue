var _ = require('./')
var extend = _.extend

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
strats.beforeMount =
strats.beforeDestroy =
strats.afterDestroy =
strats.paramAttributes = function (parentVal, childVal) {
  return (parentVal || []).concat(childVal || [])
}

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do a
 * 3-way merge for assets: constructor assets, instance
 * assets, and instance scope assets.
 */

strats.directives =
strats.filters =
strats.partials =
strats.transitions =
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
 * Events
 *
 * Events should not overwrite one another, so we merge
 * them as arrays.
 */

strats.events = function (parentVal, childVal) {
  var ret = Object.create(null)
  extend(ret, parentVal)
  for (var key in childVal) {
    var parent = ret[key]
    var child = childVal[key]
    ret[key] = parent
      ? parent.concat(child)
      : [child]
  }
  return ret
}

/**
 * Other object hashes.
 * These are instance-specific and do not inehrit from
 * nested parents.
 */

strats.methods =
strats.computed = function (parentVal, childVal) {
  var ret = Object.create(null)
  extend(ret, parentVal)
  extend(ret, childVal)
  return ret
}

/**
 * Default strategy.
 * Applies to:
 * - data
 * - el
 * - parent
 * - replace
 */

var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} components
 */

function guardComponents (components) {
  if (components) {
    var def
    for (var key in components) {
      def = components[key]
      if (_.isObject(def)) {
        components[key] = _.Vue.extend(def)
      }
    }
  }
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

module.exports = function (parent, child, vm) {
  guardComponents(child.components)
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
    if (
      !vm &&
      (key === 'el' || key === 'data' || key === 'parent')
    ) {
      _.warn(
        'The "' + key + '" option can only be used as an' +
        'instantiation option and will be ignored in' +
        'Vue.extend().'
      )
      return
    }
    var strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], key, vm)
  }
  return options
}