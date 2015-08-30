var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var number = this.param('number') != null
    var expression = this.param('exp')
    var scope = this._scope || this.vm

    if (process.env.NODE_ENV !== 'production' && expression) {
      _.deprecation.MODEL_EXP(this.expression)
    }

    this.getValue = function () {
      // value overwrite via bind-value
      if (el.hasOwnProperty('_value')) {
        return el._value
      }
      var val = el.value
      if (number) {
        val = _.toNumber(val)
      } else if (expression !== null) {
        val = scope.$eval(expression)
      }
      return val
    }

    this.on('change', function () {
      self.set(self.getValue())
    })

    if (el.checked) {
      this._initValue = this.getValue()
    }
  },

  update: function (value) {
    this.el.checked = _.looseEqual(value, this.getValue())
  }
}
