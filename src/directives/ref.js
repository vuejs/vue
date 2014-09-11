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
    var id = this.expression
    if (id) {
      var owner = this.vm.$parent
      // find the first parent vm that is not an
      // anonymous instance.
      while (owner._isAnonymous) {
        owner = owner.$parent
      }
      owner.$[id] = this.vm
      this.owner = owner
    }
  },

  unbind: function () {
    var id = this.expression
    if (id) {
      delete this.owner.$[id]
    }
  }
  
}