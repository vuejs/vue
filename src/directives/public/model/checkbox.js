var _ = require('../../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el

    this._matchValue = function (value) {
      if (el.hasOwnProperty('_trueValue')) {
        return _.looseEqual(value, el._trueValue)
      } else {
        return !!value
      }
    }

    function getValue () {
      var val = el.checked
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue
      }
      return val
    }

    this.on('change', function () {
      self.set(getValue())
    })

    if (el.checked) {
      this._initValue = getValue()
    }
  },

  update: function (value) {
    this.el.checked = this._matchValue(value)
  }
}
