var _ = require('../../util')
var vIf = require('../public/if')
var FragmentFactory = require('../../fragment/factory')

module.exports = {

  priority: 1750,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function (value) {
      vIf.remove.call(this)
      if (value) {
        this.insert(value)
      }
    }
  },

  bind: function () {
    this.anchor = _.createAnchor('v-partial')
    _.replace(this.el, this.anchor)
    this.insert(this.params.name)
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
    if (this.frag) {
      this.frag.destroy()
    }
  }
}
