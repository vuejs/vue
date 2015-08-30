var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var trueExp = this.param('true-exp')
    var falseExp = this.param('false-exp')
    var scope = this._scope || this.vm

    if (process.env.NODE_ENV !== 'production' && (trueExp || falseExp)) {
      _.deprecation.MODEL_EXP(this.expression)
    }

    this._matchValue = function (value) {
      if (el.hasOwnProperty('_trueValue')) {
        return _.looseEqual(value, el._trueValue)
      } else if (trueExp !== null) {
        return _.looseEqual(value, scope.$eval(trueExp))
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
      if (val && trueExp !== null) {
        val = scope.$eval(trueExp)
      }
      if (!val && falseExp !== null) {
        val = scope.$eval(falseExp)
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
