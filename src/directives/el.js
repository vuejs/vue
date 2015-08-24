module.exports = {

  isLiteral: true,

  bind: function () {
    if (process.env.NODE_ENV !== 'production') {
      require('../util').deprecation.V_EL()
    }
    this.vm.$$[this.expression] = this.el
  },

  unbind: function () {
    delete this.vm.$$[this.expression]
  }
}
