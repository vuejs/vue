module.exports = {

  priority: 1000,
  isLiteral: true,

  bind: function () {
    this.el.__v_trans = {
      id: this.expression
    }
  }

}