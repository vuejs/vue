var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    this.listener = function () {
      self.set(el.checked, true)
    }
    _.on(el, 'click', this.listener)
    _.on(el, 'change', this.listener)
    if (el.checked) {
      this._initValue = el.checked
    }
  },

  update: function (value) {
    this.el.checked = !!value
  },

  unbind: function () {
    _.off(this.el, 'click', this.listener)
    _.off(this.el, 'change', this.listener)
  }

}
