var _ = require('../util')
var objectAgumentations = Object.create(Object.prototype)

/**
 * Add a new property to an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @param {*} val
 * @public
 */

function $add (key, val) {
  if (this.hasOwnProperty(key)) return
  this.__ob__.convert(key, val)
}

/**
 * Deletes a property from an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @public
 */

function $delete (key) {
  if (!this.hasOwnProperty(key)) return
  this.__ob__.unobserve(this[key])
  delete this[key]
}

if (_.hasProto) {
  _.define(objectAgumentations, '$add', $add)
  _.define(objectAgumentations, '$delete', $delete)
} else {
  objectAgumentations.$add = $add
  objectAgumentations.$delete = $delete
}

module.exports = objectAgumentations