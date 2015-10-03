var _ = require('../util')
var objProto = Object.prototype

/**
 * $add deprecation warning
 */

_.define(
  objProto,
  '$add',
  function (key, val) {
    if (process.env.NODE_ENV !== 'production') {
      _.deprecation.ADD()
    }
    if (!this.hasOwnProperty(key)) {
      _.set(this, key, val)
    }
  }
)

/**
 * Set a property on an observed object, calling add to
 * ensure the property is observed.
 *
 * @param {String} key
 * @param {*} val
 * @public
 */

_.define(
  objProto,
  '$set',
  function $set (key, val) {
    if (process.env.NODE_ENV !== 'production') {
      _.deprecation.SET()
    }
    _.set(this, key, val)
  }
)

/**
 * Deletes a property from an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @public
 */

_.define(
  objProto,
  '$delete',
  function $delete (key) {
    if (process.env.NODE_ENV !== 'production') {
      _.deprecation.DELETE()
    }
    _.delete(this, key)
  }
)
