import {
  addClass,
  removeClass,
  isArray,
  isPlainObject,
  hasOwn
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
    var keys = this.prevKeys = Object.keys(value)
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      if (value[key]) {
        addClass(this.el, key)
      } else {
        removeClass(this.el, key)
      }
    }
  },

  handleArray (value) {
    this.cleanup(value)
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        addClass(this.el, value[i])
      }
    }
    this.prevKeys = value.slice()
  },

  cleanup (value) {
    if (this.prevKeys) {
      var i = this.prevKeys.length
      while (i--) {
        var key = this.prevKeys[i]
        if (key && (!value || !contains(value, key))) {
          removeClass(this.el, key)
        }
      }
    }
  }
}

function stringToObject (value) {
  var res = {}
  var keys = value.trim().split(/\s+/)
  var i = keys.length
  while (i--) {
    res[keys[i]] = true
  }
  return res
}

function contains (value, key) {
  return isArray(value)
    ? value.indexOf(key) > -1
    : hasOwn(value, key)
}
