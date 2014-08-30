var _ = require('./index')
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
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!childVal) return parentVal
  if (!parentVal || !vm) {
    return childVal
  }
  // instance option is a function, just call it here.
  if (typeof childVal === 'function') {
    childVal = childVal()
  }
  // the special case where parent data is a function,
  // and instance also has passed-in data. we need to mix
  // the default data returned from the function into the
  // passed-in one.
  if (typeof parentVal === 'function') {
    var defaultData = parentVal()
    for (var key in defaultData) {
      if (!childVal.hasOwnProperty(key)) {
        childVal[key] = defaultData[key]
      }
    }
  }
  return childVal
}

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.created =
strats.ready =
strats.attached =
strats.detached =
strats.beforeCompile =
strats.compiled =
strats.beforeDestroy =
strats.destroyed =
strats.paramAttributes = function (parentVal, childVal) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : [childVal]
    : parentVal
}

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

strats.directives =
strats.filters =
strats.partials =
strats.transitions =
strats.components = function (parentVal, childVal, vm, key) {
  var ret = Object.create(parentVal || null)
  extend(ret, childVal)
  if (vm && vm.$parent) {
    var scopeVal = vm.$parent.$options[key]
    var keys = Object.keys(scopeVal)
    var i = keys.length
    var field
    while (i--) {
      field = keys[i]
      ret[field] = scopeVal[field]
    }
  }
  return ret
}

/**
 * Events
 *
 * Events should not overwrite one another, so we merge
 * them as arrays.
 */

strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = {}
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
 */

strats.methods =
strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = Object.create(parentVal)
  extend(ret, childVal)
  return ret
}

/**
 * Default strategy.
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
      if (_.isPlainObject(def)) {
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

module.exports = function mergeOptions (parent, child, vm) {
  guardComponents(child.components)
  var options = {}
  var key
  for (key in parent) {
    merge(key)
  }
  for (key in child) {
    if (!(parent.hasOwnProperty(key))) {
      merge(key)
    }
  }
  function merge (key) {
    if (
      !vm &&
      (key === 'el' || key === 'data') &&
      typeof child[key] !== 'function') {
      _.warn(
        'The "' + key + '" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.'
      )
    } else {
      var strat = strats[key] || defaultStrat
      options[key] = strat(parent[key], child[key], vm, key)
    }
  }
  return options
}