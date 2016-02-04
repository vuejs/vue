import {
  setClass,
  isArray,
  hasOwn,
  forEach
} from '../../util/index'

export default {

  deep: true,

  update (value) {
    if (typeof value === 'string') {
      value = stringToObject(value)
    }
    this.processHandle(value)
  },

  processHandle (value) {
    var prevKeys = this.prevKeys
    var classes = ' ' + (this.el.getAttribute('class') || '') + ' '

    // cleanup
    if (prevKeys) {
      prevKeys.forEach(function (clazz) {
        if (clazz && (!value || !contains(value, clazz))) {
          classes = removeClass(classes, clazz)
        }
      })
    }

    // init prevKeys
    prevKeys = this.prevKeys = []

    if (!value) {
      setClass(this.el, classes.trim())
      return
    }

    // array or like array
    var isArray = 'length' in value

    // enumerate value
    forEach(value, function (value, key) {
      if (isArray) {
        classes = addClass(classes, value)
        prevKeys.push(value)
      } else {
        if (value) {
          classes = addClass(classes, key)
          prevKeys.push(key)
        } else {
          classes = removeClass(classes, key)
        }
      }
    })

    // apply
    setClass(this.el, classes.trim())
  }
}

function addClass (classes, clazz) {
  if (clazz && classes.indexOf(clazz) < 0) {
    classes += clazz + ' '
  }
  return classes
}

function removeClass (classes, clazz) {
  if (clazz && classes.indexOf(clazz) >= 0) {
    classes = classes.replace(' ' + clazz + ' ', ' ')
  }
  return classes
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
