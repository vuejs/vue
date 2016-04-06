import {
  addClass,
  removeClass,
  isArray,
  isPlainObject
} from '../../util/index'

export default {

  deep: true,

  update (value) {
    if (value && typeof value === 'string') {
      this.handleObject(stringToObject(value))
    } else if (isPlainObject(value)) {
      this.handleObject(value)
    } else if (isArray(value)) {
      this.handleArray(value)
    } else {
      this.cleanup()
    }
  },

  handleObject (value) {
    this.cleanup(value)
    this.prevKeys = Object.keys(value)
    setObjectClasses(this.el, value)
  },

  handleArray (value) {
    this.cleanup(value)
    for (var i = 0, l = value.length; i < l; i++) {
      var val = value[i]
      if (val && isPlainObject(val)) {
        setObjectClasses(this.el, val)
      } else if (val && typeof val === 'string') {
        addClass(this.el, val)
      }
    }
    this.prevKeys = value.slice()
  },

  cleanup (value) {
    if (!this.prevKeys) return

    var i = this.prevKeys.length
    while (i--) {
      var key = this.prevKeys[i]
      if (!key) continue

      var keys = isPlainObject(key) ? Object.keys(key) : [key]
      for (var j = 0, l = keys.length; j < l; j++) {
        toggleClasses(this.el, keys[j], removeClass)
      }
    }
  }
}

function setObjectClasses (el, obj) {
  var keys = Object.keys(obj)
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    if (!obj[key]) continue
    toggleClasses(el, key, addClass)
  }
}

function stringToObject (value) {
  var res = {}
  var keys = value.trim().split(/\s+/)
  for (var i = 0, l = keys.length; i < l; i++) {
    res[keys[i]] = true
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

function toggleClasses (el, key, fn) {
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
