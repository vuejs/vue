var _ = require('../util')

/**
 * Retrive an asset by type and id.
 * Search order:
 *   -> instance options
 *   -> constructor options
 *   -> recursive parent search
 *
 * @param {String} type
 * @param {String} id
 * @return {*}
 */

exports._asset = function (type, id) {
  var own = this.$options[type]
  var ctor = this.constructor.options[type]
  var parent = this.$parent
  var asset =
    (own && own[id]) ||
    (ctor && ctor[id]) ||
    (parent && parent._asset(type, id))
  if (!asset) {
    _.warn(
      'Failed to locate ' +
      type.slice(0, -1) + ': ' + id
    )
  }
  return asset
}