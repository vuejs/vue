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
  // make sure it's defined on itself.
  _.define(this, key, val, true)
  var ob = this.$observer
  ob.observe(key, val)
  ob.convert(key, val)
  ob.emit('add:self', key, val)
  ob.propagate('add', key, val)
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
  delete this[key]
  var ob = this.$observer
  ob.emit('delete:self', key)
  ob.propagate('delete', key)
}

if (_.hasProto) {
  _.define(objectAgumentations, '$add', $add)
  _.define(objectAgumentations, '$delete', $delete)
} else {
  objectAgumentations.$add = $add
  objectAgumentations.$delete = $delete
}

module.exports = objectAgumentations