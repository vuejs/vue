import {
  addClass,
  removeClass,
  isArray,
  isObject
} from '../../util/index'

export default {

  deep: true,

  update (value) {
    if (!value) {
      this.cleanup()
    } else if (typeof value === 'string') {
      this.setClass(value.trim().split(/\s+/))
    } else {
      this.setClass(normalize(value))
    }
  },

  setClass (value) {
    this.cleanup(value)
    for (var i = 0, l = value.length; i < l; i++) {
      var val = value[i]
      if (val) {
        apply(this.el, val, addClass)
      }
    }
    this.prevKeys = value
  },

  cleanup (value) {
    const prevKeys = this.prevKeys
    if (!prevKeys) return
    var i = prevKeys.length
    while (i--) {
      var key = prevKeys[i]
      if (!value || value.indexOf(key) < 0) {
        apply(this.el, key, removeClass)
      }
    }
  }
}

/**
 * Normalize objects and arrays (potentially containing objects)
 * into array of strings.
 *
 * @param {Object|Array<String|Object>} value
 * @return {Array<String>}
 */

function normalize (value) {
  const res = []
  if (isArray(value)) {
    for (var i = 0, l = value.length; i < l; i++) {
      const key = value[i]
      if (key) {
        if (typeof key === 'string') {
          res.push(key)
        } else {
          for (var k in key) {
            if (key[k]) res.push(k)
          }
        }
      }
    }
  } else if (isObject(value)) {
    for (var key in value) {
      if (value[key]) res.push(key)
    }
  }
  return res
}

/**
 * Add or remove a class/classes on an element
 *
 * @param {Element} el
 * @param {String} key The class name. This may or may not
 *                     contain a space character, in such a
 *                     case we'll deal with multiple class
 *                     names at once.
 * @param {Function} fn
 */

function apply (el, key, fn) {
  key = key.trim()
  if (key.indexOf(' ') === -1) {
    fn(el, key)
    return
  }
  // The key contains one or more space characters.
  // Since a class name doesn't accept such characters, we
  // treat it as multiple classes.
  var keys = key.split(/\s+/)
  for (var i = 0, l = keys.length; i < l; i++) {
    fn(el, keys[i])
  }
}
