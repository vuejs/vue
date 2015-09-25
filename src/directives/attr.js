var _ = require('../util')

// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink'
var xlinkRE = /^xlink:/

// these input element attributes should also set their
// corresponding properties
var inputProps = {
  value: 1,
  checked: 1,
  selected: 1
}

// these attributes should set a hidden property for
// binding v-model to object values
var modelProps = {
  value: '_value',
  'true-value': '_trueValue',
  'false-value': '_falseValue'
}

module.exports = {

  priority: 850,

  update: function (value) {
    if (this.arg) {

      if (process.env.NODE_ENV !== 'production') {
        var attr = this.arg
        if (!(
          attr === 'class' ||
          /^data-/.test(attr) ||
          (attr === 'for' && 'htmlFor' in this.el) ||
          _.camelize(attr) in this.el
        )) {
          _.deprecation.ATTR_INVALID(attr)
        }
      }

      this.setAttr(this.arg, value)
    } else if (typeof value === 'object') {
      // TODO no longer need to support object in 1.0.0
      this.objectHandler(value)
    }
  },

  objectHandler: function (value) {
    // cache object attrs so that only changed attrs
    // are actually updated.
    var cache = this.cache || (this.cache = {})
    var attr, val
    for (attr in cache) {
      if (!(attr in value)) {
        this.setAttr(attr, null)
        delete cache[attr]
      }
    }
    for (attr in value) {
      val = value[attr]
      if (val !== cache[attr]) {
        cache[attr] = val
        this.setAttr(attr, val)
      }
    }
  },

  setAttr: function (attr, value) {
    if (inputProps[attr] && attr in this.el) {
      if (!this.valueRemoved) {
        this.el.removeAttribute(attr)
        this.valueRemoved = true
      }
      this.el[attr] = value
    } else if (value != null && value !== false) {
      if (xlinkRE.test(attr)) {
        this.el.setAttributeNS(xlinkNS, attr, value)
      } else {
        this.el.setAttribute(attr, value)
      }
    } else {
      this.el.removeAttribute(attr)
    }
    // set model props
    var modelProp = modelProps[attr]
    if (modelProp) {
      this.el[modelProp] = value
    }
  }
}
