var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var trueExp = this._checkParam('true-exp')
    var falseExp = this._checkParam('false-exp')

    this._matchValue = function (value) {
      if (trueExp !== null) {
        return _.looseEqual(value, self.vm.$eval(trueExp))
      } else {
        return !!value
      }
    }

    function getValue () {
      var val = el.checked
      if (val && trueExp !== null) {
        val = self.vm.$eval(trueExp)
      }
      if (!val && falseExp !== null) {
        val = self.vm.$eval(falseExp)
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
