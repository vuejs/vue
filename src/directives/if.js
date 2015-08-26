var _ = require('../util')
var FragmentFactory = require('../fragment/factory')

module.exports = {

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      this.anchor = _.createAnchor('v-if')
      _.replace(el, this.anchor)
      this.factory = new FragmentFactory(this.vm, el)
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'v-if="' + this.expression + '" cannot be ' +
        'used on an instance root element.'
      )
      this.invalid = true
    }
  },

  update: function (value) {
    if (this.invalid) return
    if (value) {
      if (!this.frag) {
        this.insert()
      }
    } else {
      this.remove()
    }
  },

  insert: function () {
    this.frag = this.factory.create(this._host, this._scope, this._frag)
    this.frag.before(this.anchor)
  },

  remove: function () {
    if (!this.frag) return
    this.frag.remove()
    this.frag.destroy()
    this.frag = null
  },

  unbind: function () {
    if (this.frag) {
      this.frag.destroy()
    }
  }
}
