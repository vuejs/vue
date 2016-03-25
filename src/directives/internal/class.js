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
    if (this.prevKeys) {
      var i = this.prevKeys.length
      while (i--) {
        var key = this.prevKeys[i]
        if (!key) continue
        if (isPlainObject(key)) {
          var keys = Object.keys(key)
          for (var k = 0; k < keys.length; k++) {
            removeClass(this.el, keys[k])
          }
        } else {
          removeClass(this.el, key)
        }
      }
    }
  }
}

function setObjectClasses (el, obj) {
  var keys = Object.keys(obj)
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    if (obj[key]) {
      addClass(el, key)
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
