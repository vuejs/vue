var _ = require('../util')
var slice = [].slice
var arrayAugmentations = Object.create(Array.prototype)

/**
 * Intercept mutating methods and emit events
 */

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = Array.prototype[method]
  // define wrapped method
  _.define(arrayAugmentations, method, function () {
    
    var args = slice.call(arguments)
    var result = original.apply(this, args)
    var ob = this.$observer
    var inserted, removed

    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'pop':
      case 'shift':
        removed = [result]
        break
      case 'splice':
        inserted = args.slice(2)
        removed = result
        break
    }

    // link/unlink added/removed elements
    if (inserted) ob.link(inserted)
    if (removed) ob.unlink(removed)

    // emit length change
    if (inserted || removed) {
      ob.notify('set', 'length', this.length)
    }

    // empty path, value is the Array itself
    ob.notify('mutate', '', this, {
      method   : method,
      args     : args,
      result   : result,
      inserted : inserted,
      removed  : removed
    })
  })
})

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

_.define(arrayAugmentations, '$set', function (index, val) {
  if (index >= this.length) {
    this.length = index + 1
  }
  return this.splice(index, 1, val)[0]
})

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

_.define(arrayAugmentations, '$remove', function (index) {
  if (index > -1) {
    return this.splice(index, 1)[0]
  }
})