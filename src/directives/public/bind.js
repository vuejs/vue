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

// regex to test for globally allowed attributes.
// we only need to include ones that:
// - do not have a corresponding property, e.g. role, dropzone;
// - cannot be camelized into the corresponding property, .e.g class, accesskey, contenteditable;
var globalAllowedAttrRE = /^(class|role|accesskey|contenteditable|contextmenu|dropzone|hidden|tabindex)$|^data-|^aria-/

module.exports = {

  priority: 850,

  bind: function () {
    var attr = this.arg
    // handle interpolation bindings
    if (this.descriptor.interp) {
      // only allow binding on native attributes
      if (!(
        // globally allowed attributes
        globalAllowedAttrRE.test(attr) ||
        // check if "for" is available on current element.
        // the corresponding property is a special case.
        (attr === 'for' && 'htmlFor' in this.el) ||
        // other attributes: check if a camelized property
        // is available on the element
        _.camelize(attr) in this.el
      )) {
        process.env.NODE_ENV !== 'production' && _.warn(
          attr + '="' + this.descriptor.raw + '": ' +
          'attribute interpolation is allowed only ' +
          'in valid native attributes. "' + attr + '" ' +
          'is not a valid attribute on <' + this.el.tagName.toLowerCase() + '>.'
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
            raw + 'interpolation in "style" attribtue will cause ' +
            'the attribtue to be discarded in Internet Explorer. ' +
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
      // update v-model if present
      var model = this.el.__v_model
      if (model) {
        model.listener()
      }
    }
  }
}
