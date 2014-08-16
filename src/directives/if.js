var _ = require('../util')

module.exports = {

  bind: function () {
    // resolve component
    var registry = this.vm.$options.components
    var el = this.el
    this.Ctor =
      registry[el.tagName.toLowerCase()] ||
      registry[_.attr(el, 'component')] ||
      _.Vue
    this.isAnonymous = this.Ctor === _.Vue
    // insert ref
    this.ref = document.createComment('v-if')
    _.before(this.ref, el)
    _.remove(el)
    // warn conflicts
    if (_.attr(el, 'view')) {
      _.warn(
        'Conflict: v-if cannot be used together with ' +
        'v-view. Just set v-view\'s binding value to ' +
        'empty string to empty it.'
      )
    }
    if (_.attr(el, 'repeat')) {
      _.warn(
        'Conflict: v-if cannot be used together with ' +
        'v-repeat. Use `v-show` or the `filterBy` filter ' +
        'instead.'
      )
    }
  },

  update: function (value) {
    if (!value) {
      this.unbind()
    } else if (!this.childVM) {
      this.childVM = new this.Ctor({
        el: this.el.cloneNode(true),
        parent: this.vm,
        anonymous: this.isAnonymous
      })
      this.childVM.$before(this.ref)
    }
  },

  unbind: function () {
    if (this.childVM) {
      this.childVM.$destroy()
    }
  }
}