import { def, toArray } from '../util/index'

const arrayProto = Array.prototype
const mutationMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

/**
 * Intercept mutating methods and notify change
 */

mutationMethods.forEach(function (method) {
  // cache original method
  var original = arrayProto[method]

  var interceptor = function arrayMutationInterceptor () {
    var args = toArray(arguments)
    var result = original.apply(this, args)
    var ob = this.__ob__
    var inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  }

  arrayProto[method] = function () {
    let fn = this && this.__ob__ ? interceptor : original
    return fn.apply(this, arguments)
  }
})

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

def(
  arrayProto,
  '$set',
  function $set (index, val) {
    if (index >= this.length) {
      this.length = Number(index) + 1
    }
    return this.splice(index, 1, val)[0]
  }
)

/**
 * Convenience method to remove the element at given index or target element reference.
 *
 * @param {*} item
 */

def(
  arrayProto,
  '$remove',
  function $remove (item) {
    /* istanbul ignore if */
    if (!this.length) return
    var index = this.indexOf(item)
    if (index > -1) {
      return this.splice(index, 1)
    }
  }
)
