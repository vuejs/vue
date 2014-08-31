var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    this.multiple = el.hasAttribute('multiple')
    this.listener = function () {
      var value = self.multiple
        ? getMultiValue(el)
        : el.value
      self.set(value, true)
    }
    _.on(el, 'change', this.listener)
    checkInitialValue.call(this)
  },

  update: function (value) {
    /* jshint eqeqeq: false */
    var el = this.el
    el.selectedIndex = -1
    var multi = this.multiple && _.isArray(value)
    var options = el.options
    var i = options.length
    var option
    while (i--) {
      option = options[i]
      option.selected = multi
        ? value.indexOf(option.value) > -1
        : value == option.value
    }
  },

  unbind: function () {
    _.off(this.el, 'change', this.listener)
  }

}

/**
 * Check the initial value for selected options.
 */

function checkInitialValue () {
  var initValue
  var options = this.el.options
  var i = options.length
  while (i--) {
    if (options[i].selected) {
      if (this.multiple) {
        (initValue || (initValue = []))
          .push(options[i].value)
      } else {
        initValue = options[i].value
      }
    }
  }
  if (initValue) {
    this.vm.$set(this.expression, initValue)
  }
}

/**
 * Helper to extract a value array for select[multiple]
 *
 * @param {SelectElement} el
 * @return {Array}
 */

function getMultiValue (el) {
  return Array.prototype.filter
    .call(el.options, filterSelected)
    .map(getOptionValue)
}

function filterSelected (op) {
  return op.selected
}

function getOptionValue (op) {
  return op.value || op.text
}