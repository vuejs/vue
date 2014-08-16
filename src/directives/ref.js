module.exports = {

  literal: true,

  bind: function () {
    var id = this.expression
    if (id) {
      this.vm.$parent.$[id] = this.vm
    }
  },

  unbind: function () {
    var id = this.expression
    if (id) {
      delete this.vm.$parent.$[id]
    }
  }
  
}