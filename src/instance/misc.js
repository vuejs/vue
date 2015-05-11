var _ = require('../util')

/**
 * Apply a filter to a list of arguments.
 * This is only used internally inside expressions with
 * inlined filters.
 *
 * @param {String} id
 * @param {Array} args
 * @return {*}
 */

exports._applyFilter = function (id, args) {
  var registry = this.$options.filters
  var filter = registry[id]
  _.assertAsset(filter, 'filter', id)
  return (filter.read || filter).apply(this, args)
}

/**
 * Resolve a component, depending on whether the component
 * is defined normally or using an async factory function.
 * Resolves synchronously if already resolved, otherwise
 * resolves asynchronously and replaces the factory with
 * the resolved component.
 *
 * @param {String} id
 * @param {Function} cb
 */

exports._resolveComponent = function (id, cb) {
  var registry = this.$options.components
  var raw = registry[id]
  _.assertAsset(raw, 'component', id)
  // async component factory
  if (!raw.options) {
    raw(function resolve (res) {
      if (_.isPlainObject(res)) {
        res = _.Vue.extend(res)
      }
      registry[id] = res
      cb(res)
    })
  } else {
    cb(raw)
  }
}