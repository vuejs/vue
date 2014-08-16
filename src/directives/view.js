var _ = require('../util')

module.exports = {

  bind: function () {
    // track position in DOM with a ref node
    var el = this.el
    var ref = this.ref = document.createComment('v-view')
    _.before(ref, el)
    _.remove(el)
  },

  update: function(value) {
    this.unbind()
    if (!value) {
      return
    }
    var Ctor  = this.vm.$options.components[value]
    if (!Ctor) {
      _.warn('Failed to resolve component: ' + value)
      return
    }
    this.childVM = new Ctor({
      el: this.el.cloneNode(true),
      parent: this.vm
    })
    this.childVM.$before(this.ref)
  },

  unbind: function() {
    if (this.childVM) {
      this.childVM.$destroy()
    }
  }

}