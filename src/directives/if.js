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
        this.el = templateParser.parse(el)
      }
    } else {
      _.warn(
        'v-if ' + this.expression + ' cannot be ' +
        'used on an already mounted instance.'
      )
    }
  },

  update: function (value) {
    if (value) {
      if (!this.inserted) {
        if (!this.childVM) {
          this.build()
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

  build: function () {
    this.childVM = new _.Vue({
      el: this.el,
      parent: this.vm,
      anonymous: true,
      _noSync: true
    })
  },

  unbind: function () {
    if (this.childVM) {
      this.childVM.$destroy()
    }
  }

}