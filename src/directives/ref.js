var _ = require('../util')

module.exports = {

  isLiteral: true,

  bind: function () {
    var child = this.el.__vue__
    if (!child) {
      _.warn(
        'v-ref should only be used on instance root nodes.'
      )
      return
    }
    if (this.vm !== child.$parent) {
      _.warn(
        'v-ref should be used from the parent template,' +
        ' not the component\'s.'
      )
      return
    }
    this.vm.$[this.expression] = child
  },

  unbind: function () {
    if (this.vm.$[this.expression] === this.el.__vue__) {
      delete this.vm.$[this.expression]
    }
  }
  
}