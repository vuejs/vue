var _ = require('../../util')
var FragmentFactory = require('../../fragment/factory')

module.exports = {

  priority: 2000,

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling
      if (next && _.attr(next, 'v-else') !== null) {
        _.remove(next)
        this.elseFactory = new FragmentFactory(this.vm, next)
      }
      // check main block
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
    if (this.elseFrag) {
      this.elseFrag.remove()
      this.elseFrag = null
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag)
    this.frag.before(this.anchor)
  },

  remove: function () {
    if (this.frag) {
      this.frag.remove()
      this.frag = null
    }
    if (this.elseFactory && !this.elseFrag) {
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag)
      this.elseFrag.before(this.anchor)
    }
  },

  unbind: function () {
    if (this.frag) {
      this.frag.destroy()
    }
  }
}
