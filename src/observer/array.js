var _ = require('../util')
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

  function mutator () {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length
    var args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
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
    ob.binding.notify()
    return result
  }
  // define wrapped method
  if (_.hasProto) {
    _.define(arrayAugmentations, method, mutator)
  } else {
    arrayAugmentations[method] = mutator
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

function $set (index, val) {
  if (index >= this.length) {
    this.length = index + 1
  }
  return this.splice(index, 1, val)[0]
}

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

function $remove (index) {
  if (typeof index !== 'number') {
    index = this.indexOf(index)
  }
  if (index > -1) {
    return this.splice(index, 1)[0]
  }
}

if (_.hasProto) {
  _.define(arrayAugmentations, '$set', $set)
  _.define(arrayAugmentations, '$remove', $remove)
} else {
  arrayAugmentations.$set = $set
  arrayAugmentations.$remove = $remove
}

module.exports = arrayAugmentations