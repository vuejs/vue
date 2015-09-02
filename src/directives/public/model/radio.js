var _ = require('../../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var number = this.param('number') != null

    this.getValue = function () {
      // value overwrite via bind-value
      if (el.hasOwnProperty('_value')) {
        return el._value
      }
      var val = el.value
      if (number) {
        val = _.toNumber(val)
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
