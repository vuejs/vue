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
    var inserted, removed, index

    switch (method) {
      case 'push':
        inserted = args
        index = this.length - args.length
        break
      case 'unshift':
        inserted = args
        index = 0
        break
      case 'pop':
        removed = [result]
        index = this.length
        break
      case 'shift':
        removed = [result]
        index = 0
        break
      case 'splice':
        inserted = args.slice(2)
        removed = result
        index = args[0]
        break
    }

    // link/unlink added/removed elements
    if (inserted) ob.link(inserted, index)
    if (removed) ob.unlink(removed)

    // update indices
    if (method !== 'push' && method !== 'pop') {
      ob.updateIndices()
    }

    // emit length change
    if (inserted || removed) {
      ob.notify('set', 'length', this.length)
    }

    // empty path, value is the Array itself
    ob.notify('mutate', '', this, {
      method   : method,
      args     : args,
      result   : result,
      index    : index,
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

module.exports = arrayAugmentations