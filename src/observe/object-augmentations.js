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

_.define(objectAgumentations, '$add', function (key, val) {
  if (this.hasOwnProperty(key)) return
  // make sure it's defined on itself.
  _.define(this, key, val, true)
  var ob = this.$observer
  ob.observe(key, val)
  ob.convert(key, val)
  ob.emit('added:self', key, val)
  ob.propagate('added', key, val)
})

/**
 * Deletes a property from an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @public
 */

_.define(objectAgumentations, '$delete', function (key) {
  if (!this.hasOwnProperty(key)) return
  delete this[key]
  var ob = this.$observer
  ob.emit('deleted:self', key)
  ob.propagate('deleted', key)
})

module.exports = objectAgumentations