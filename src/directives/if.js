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
    this.frag = this.factory.create(this._host, this._scope)
    this.frag.before(this.anchor)
    // call attached for all the child components created
    // during the compilation
    if (_.inDoc(this.vm.$el)) {
      var children = getContainedComponents(this.vm, this.frag.node, this.anchor)
      if (children) children.forEach(callAttach)
    }
  },

  remove: function () {
    if (!this.frag) return
    // collect children beforehand
    var children
    if (_.inDoc(this.vm.$el)) {
      children = getContainedComponents(this.vm, this.frag.node, this.anchor)
    }
    this.frag.remove()
    if (children) children.forEach(callDetach)
    this.frag.unlink()
    this.frag = null
  },

  unbind: function () {
    if (this.frag) {
      this.frag.unlink()
    }
  }
}

function getContainedComponents (vm, start, end) {
  return vm.$children.length && vm.$children.filter(function (c) {
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
  })
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
