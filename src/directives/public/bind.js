var _ = require('../../util')

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

// check for attributes that prohibit interpolations
var disallowedInterpAttrRE = /^v-|^:|^@|^(is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/

module.exports = {

  priority: 850,

  bind: function () {
    var attr = this.arg
    var tag = this.el.tagName
    // should be deep watch on object mode
    if (!attr) {
      this.deep = true
    }
    // handle interpolation bindings
    if (this.descriptor.interp) {
      // only allow binding on native attributes
      if (
        disallowedInterpAttrRE.test(attr) ||
        (attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT'))
      ) {
        process.env.NODE_ENV !== 'production' && _.warn(
          attr + '="' + this.descriptor.raw + '": ' +
          'attribute interpolation is not allowed in Vue.js ' +
          'directives and special attributes.'
        )
        this.el.removeAttribute(attr)
        this.invalid = true
      }

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production') {
        var raw = attr + '="' + this.descriptor.raw + '": '
        // warn src
        if (attr === 'src') {
          _.warn(
            raw + 'interpolation in "src" attribute will cause ' +
            'a 404 request. Use v-bind:src instead.'
          )
        }

        // warn style
        if (attr === 'style') {
          _.warn(
            raw + 'interpolation in "style" attribute will cause ' +
            'the attribute to be discarded in Internet Explorer. ' +
            'Use v-bind:style instead.'
          )
        }
      }
    }
  },

  update: function (value) {
    if (this.invalid) {
      return
    }
    var attr = this.arg
    if (this.arg) {
      this.handleSingle(attr, value)
    } else {
      this.handleObject(value || {})
    }
  },

  // share object handler with v-bind:class
  handleObject: require('../internal/style').handleObject,

  handleSingle: function (attr, value) {
    if (inputProps[attr] && attr in this.el) {
      this.el[attr] = attr === 'value'
        ? (value || '') // IE9 will set input.value to "null" for null...
        : value
    }
    // set model props
    var modelProp = modelProps[attr]
    if (modelProp) {
      this.el[modelProp] = value
      // update v-model if present
      var model = this.el.__v_model
      if (model) {
        model.listener()
      }
    }
    // do not set value attribute for textarea
    if (attr === 'value' && this.el.tagName === 'TEXTAREA') {
      this.el.removeAttribute(attr)
      return
    }
    // update attribute
    if (value != null && value !== false) {
      if (xlinkRE.test(attr)) {
        this.el.setAttributeNS(xlinkNS, attr, value)
      } else {
        this.el.setAttribute(attr, value)
      }
    } else {
      this.el.removeAttribute(attr)
    }
  }
}
