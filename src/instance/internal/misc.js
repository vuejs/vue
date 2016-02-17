import {
  resolveAsset,
  assertAsset,
  isPlainObject,
  warn
} from '../../util/index'

export default function (Vue) {
  /**
   * Apply a list of filter (descriptors) to a value.
   * Using plain for loops here because this will be called in
   * the getter of any watcher with filters so it is very
   * performance sensitive.
   *
   * @param {*} value
   * @param {*} [oldValue]
   * @param {Array} filters
   * @param {Boolean} write
   * @return {*}
   */

  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
    var filter, fn, args, arg, offset, i, l, j, k
    for (i = 0, l = filters.length; i < l; i++) {
      filter = filters[i]
      fn = resolveAsset(this.$options, 'filters', filter.name)
      if (process.env.NODE_ENV !== 'production') {
        assertAsset(fn, 'filter', filter.name)
      }
      if (!fn) continue
      fn = write ? fn.write : (fn.read || fn)
      if (typeof fn !== 'function') continue
      args = write ? [value, oldValue] : [value]
      offset = write ? 2 : 1
      if (filter.args) {
        for (j = 0, k = filter.args.length; j < k; j++) {
          arg = filter.args[j]
          args[j + offset] = arg.dynamic
            ? this.$get(arg.value)
            : arg.value
        }
      }
      value = fn.apply(this, args)
    }
    return value
  }

  /**
   * Resolve a component, depending on whether the component
   * is defined normally or using an async factory function.
   * Resolves synchronously if already resolved, otherwise
   * resolves asynchronously and caches the resolved
   * constructor on the factory.
   *
   * @param {String} id
   * @param {Function} cb
   */

  Vue.prototype._resolveComponent = function (id, cb) {
    var factory = resolveAsset(this.$options, 'components', id)
    if (process.env.NODE_ENV !== 'production') {
      assertAsset(factory, 'component', id)
    }
    if (!factory) {
      return
    }
    // async component factory
    if (!factory.options) {
      if (factory.resolved) {
        // cached
        cb(factory.resolved)
      } else if (factory.requested) {
        // pool callbacks
        factory.pendingCallbacks.push(cb)
      } else {
        factory.requested = true
        var cbs = factory.pendingCallbacks = [cb]
        factory.call(this, function resolve (res) {
          if (isPlainObject(res)) {
            res = Vue.extend(res)
          }
          // cache resolved
          factory.resolved = res
          // invoke callbacks
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res)
          }
        }, function reject (reason) {
          process.env.NODE_ENV !== 'production' && warn(
            'Failed to resolve async component: ' + id + '. ' +
            (reason ? '\nReason: ' + reason : '')
          )
        })
      }
    } else {
      // normal component
      cb(factory)
    }
  }
}
