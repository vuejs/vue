module.exports = {

  isLiteral: true,

  bind: function () {
    this.owner = this.vm._owner || this.vm
    this.owner.$$[this.expression] = this.el
  },

  unbind: function () {
    this.owner.$$[this.expression] = null
  }
  
}