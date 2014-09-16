module.exports = {

  isLiteral: true,

  bind: function () {
    this.vm._owner.$$[this.expression] = this.el
  },

  unbind: function () {
    this.vm._owner.$$[this.expression] = null
  }
  
}