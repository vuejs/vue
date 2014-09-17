var _ = require('../util')
var templateParser = require('../parse/template')

module.exports = {

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      this.ref = document.createComment('v-if')
      _.replace(el, this.ref)
      this.inserted = false
      if (el.tagName === 'TEMPLATE') {
        this.el = templateParser.parse(el, true)
      }
    } else {
      this.invalid = true
      _.warn(
        'v-if="' + this.expression + '" cannot be ' +
        'used on an already mounted instance.'
      )
    }
  },

  update: function (value) {
    if (this.invalid) return
    if (value) {
      if (!this.inserted) {
        if (!this.childVM) {
          this.childVM = this.vm.$addChild({
            el: this.el,
            inherit: true,
            _anonymous: true
          })
        }
        this.childVM.$before(this.ref)
        this.inserted = true
      }
    } else {
      if (this.inserted) {
        this.childVM.$remove()
        this.inserted = false
      }
    }
  },

  unbind: function () {
    if (this.childVM) {
      this.childVM.$destroy()
    }
  }

}