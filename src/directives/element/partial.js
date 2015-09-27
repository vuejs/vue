var _ = require('../../util')
var FragmentFactory = require('../../fragment/factory')
var vIf = require('../public/if')
var Watcher = require('../../watcher')

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
    var onNameChange = function (value) {
      vIf.remove.call(self)
      if (value) {
        self.insert(value)
      }
    }
    this.nameWatcher = new Watcher(this.vm, exp, onNameChange, {
      scope: this._scope
    })
    onNameChange(this.nameWatcher.value)
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
    if (this.nameWatcher) {
      this.nameWatcher.teardown()
    }
  }
}
