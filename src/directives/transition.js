module.exports = {

  priority: 1000,

  bind: function () {
    this.el.__vueTransition = this.expression
  }

}