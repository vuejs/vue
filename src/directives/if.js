var _ = require('../util')
var compiler = require('../compiler')
var templateParser = require('../parsers/template')
var transition = require('../transition')

module.exports = {

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      this.start = _.createAnchor('v-if-start')
      this.end = _.createAnchor('v-if-end')
      _.replace(el, this.end)
      _.before(this.start, this.end)
      if (_.isTemplate(el)) {
        this.template = templateParser.parse(el, true)
      } else {
        this.template = document.createDocumentFragment()
        this.template.appendChild(templateParser.clone(el))
      }
      // compile the nested partial
      this.linker = compiler.compile(
        this.template,
        this.vm.$options,
        true
      )
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
      // avoid duplicate compiles, since update() can be
      // called with different truthy values
      if (!this.unlink) {
        this.compile()
      }
    } else {
      this.teardown()
    }
  },

  compile: function () {
    var vm = this.vm
    var frag = templateParser.clone(this.template)
    // the linker is not guaranteed to be present because
    // this function might get called by v-partial 
    this.unlink = this.linker(vm, frag)
    transition.blockAppend(frag, this.end, vm)
    // call attached for all the child components created
    // during the compilation
    if (_.inDoc(vm.$el)) {
      var children = this.getContainedComponents()
      if (children) children.forEach(callAttach)
    }
  },

  teardown: function () {
    if (!this.unlink) return
    // collect children beforehand
    var children
    if (_.inDoc(this.vm.$el)) {
      children = this.getContainedComponents()
    }
    transition.blockRemove(this.start, this.end, this.vm)
    if (children) children.forEach(callDetach)
    this.unlink()
    this.unlink = null
  },

  getContainedComponents: function () {
    var vm = this.vm
    var start = this.start.nextSibling
    var end = this.end
    var selfCompoents =
      vm._children.length &&
      vm._children.filter(contains)
    var transComponents =
      vm._transCpnts &&
      vm._transCpnts.filter(contains)

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

    return selfCompoents
      ? transComponents
        ? selfCompoents.concat(transComponents)
        : selfCompoents
      : transComponents
  },

  unbind: function () {
    if (this.unlink) this.unlink()
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