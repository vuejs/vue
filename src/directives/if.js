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
        this.create()
      }
    } else {
      this.teardown()
    }
  },

  create: function () {
    this.frag = this.factory.create(this._host, this._scope)
    this.frag.before(this.anchor)
    // call attached for all the child components created
    // during the compilation
    if (_.inDoc(this.vm.$el)) {
      var children = this.getContainedComponents()
      if (children) children.forEach(callAttach)
    }
  },

  teardown: function () {
    if (!this.frag) return
    // collect children beforehand
    var children
    if (_.inDoc(this.vm.$el)) {
      children = this.getContainedComponents()
    }
    this.frag.remove()
    if (children) children.forEach(callDetach)
    this.frag.unlink()
    this.frag = null
  },

  getContainedComponents: function () {
    var vm = this.vm
    var start = this.frag.node
    var end = this.anchor

    function contains (c) {
      var cur = start
      var next
      while (next !== end) {
        next = cur.nextSibling
        if (
          cur === c.$el ||
          cur.contains && cur.contains(c.$el)
        ) {
          return true
        }
        cur = next
      }
      return false
    }

    return vm.$children.length &&
      vm.$children.filter(contains)
  },

  unbind: function () {
    if (this.frag) {
      this.frag.unlink()
    }
  }
}

function callAttach (child) {
  if (!child._isAttached) {
    child._callHook('attached')
  }
}

function callDetach (child) {
  if (child._isAttached) {
    child._callHook('detached')
  }
}
