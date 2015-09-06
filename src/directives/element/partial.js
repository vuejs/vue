var _ = require('../../util')
var FragmentFactory = require('../../fragment/factory')
var vIf = require('../public/if')

module.exports = {

  priority: 1750,

  bind: function () {
    var el = this.el
    this.anchor = _.createAnchor('v-partial')
    _.replace(el, this.anchor)
    var id = el.getAttribute('name')
    if (id != null) {
      // static partial
      this.insert(id)
    } else {
      id = _.getBindAttr(el, 'name')
      if (id) {
        this.setupDynamic(id)
      }
    }
  },

  setupDynamic: function (exp) {
    var self = this
    this.unwatch = this.vm.$watch(exp, function (value) {
      vIf.remove.call(self)
      self.insert(value)
    }, {
      immediate: true,
      user: false,
      scope: this._scope
    })
  },

  insert: function (id) {
    var partial = _.resolveAsset(this.vm.$options, 'partials', id)
    if (process.env.NODE_ENV !== 'production') {
      _.assertAsset(partial, 'partial', id)
    }
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial)
      vIf.insert.call(this)
    }
  },

  unbind: function () {
    if (this.frag) this.frag.destroy()
    if (this.unwatch) this.unwatch()
  }
}
