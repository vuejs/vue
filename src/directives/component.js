var _ = require('../util')

module.exports = {

  literal: true,

  bind: function () {
    if (!this.el.__vue__) {
      var registry = this.vm.$options.components
      var Ctor = registry[this.expression]
      if (Ctor) {
        this.childVM = new Ctor({
          el: this.el,
          parent: this.vm
        })
      } else {
        _.warn(
          'Failed to resolve component: ' +
          this.expression
        )
      }
    }
  },

  unbind: function () {
    if (this.childVM) {
      this.childVM.$destroy()
    }
  }

}