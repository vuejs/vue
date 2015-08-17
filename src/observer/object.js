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
    add(this, key, val)
  }
)

/**
 * Add a new property to an observed object
 * and emits corresponding event. This is internal and
 * no longer exposed as of 1.0.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @public
 */

var add = exports.add = function (obj, key, val) {
  if (obj.hasOwnProperty(key)) {
    return
  }
  if (obj._isVue) {
    add(obj._data, key, val)
    return
  }
  var ob = obj.__ob__
  if (!ob || _.isReserved(key)) {
    obj[key] = val
    return
  }
  ob.convert(key, val)
  ob.dep.notify()
  if (ob.vms) {
    var i = ob.vms.length
    while (i--) {
      var vm = ob.vms[i]
      vm._proxy(key)
      vm._digest()
    }
  }
}

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
    add(this, key, val)
    this[key] = val
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
    if (!this.hasOwnProperty(key)) return
    delete this[key]
    var ob = this.__ob__
    if (!ob || _.isReserved(key)) {
      return
    }
    ob.dep.notify()
    if (ob.vms) {
      var i = ob.vms.length
      while (i--) {
        var vm = ob.vms[i]
        vm._unproxy(key)
        vm._digest()
      }
    }
  }
)
