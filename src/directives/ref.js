var _ = require('../util')

module.exports = {

  isLiteral: true,

  bind: function () {
    if (this.el !== this.vm.$el) {
      _.warn(
        'v-ref should only be used on instance root nodes.'
      )
      return
    }
    this.owner = this.vm.$parent
    this.owner.$[this.expression] = this.vm
  },

  unbind: function () {
    if (this.owner.$[this.expression] === this.vm) {
      delete this.owner.$[this.expression]
    }
  }
  
}