module.exports = {

  priority: 1000,
  isLiteral: true,

  bind: function () {
    this.el.__v_trans = {
      id: this.expression,
      // resolve the custom transition functions now
      fns: this.vm.$options.transitions[this.expression]
    }
  }

}