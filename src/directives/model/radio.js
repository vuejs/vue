var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var number = this._checkParam('number') != null
    function getValue () {
      return number
        ? _.toNumber(el.value)
        : el.value
    }
    this.listener = function () {
      self.set(getValue())
    }
    _.on(el, 'change', this.listener)
    if (el.checked) {
      this._initValue = getValue()
    }
  },

  update: function (value) {
    /* eslint-disable eqeqeq */
    this.el.checked = value == this.el.value
    /* eslint-enable eqeqeq */
  },

  unbind: function () {
    _.off(this.el, 'change', this.listener)
  }
}
