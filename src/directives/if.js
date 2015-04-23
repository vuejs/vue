var _ = require('../util')
var compile = require('../compiler/compile')
var templateParser = require('../parsers/template')
var transition = require('../transition')

module.exports = {

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      this.start = document.createComment('v-if-start')
      this.end = document.createComment('v-if-end')
      _.replace(el, this.end)
      _.before(this.start, this.end)

      // Note: content transclusion is not available for
      // <template> blocks
      if (el.tagName === 'TEMPLATE') {
        this.template = templateParser.parse(el, true)
      } else {
        this.template = document.createDocumentFragment()
        this.template.appendChild(templateParser.clone(el))
        this.checkContent()
      }
      // compile the nested partial
      this.linker = compile(
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

  // check if there are any content nodes from parent.
  // these nodes are compiled by the parent and should
  // not be cloned during a re-compilation - otherwise the
  // parent directives bound to them will no longer work.
  // (see #736)
  checkContent: function () {
    var el = this.el
    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i]
      // _isContent is a flag set in instance/compile
      // after the raw content has been compiled by parent
      if (node._isContent) {
        ;(this.contentNodes = this.contentNodes || []).push(node)
        ;(this.contentPositions = this.contentPositions || []).push(i)
      }
    }
    // keep track of any transcluded components contained within
    // the conditional block. we need to call attach/detach hooks
    // for them.
    this.transCpnts =
      this.vm._transCpnts &&
      this.vm._transCpnts.filter(function (c) {
        return el.contains(c.$el)
      })
  },

  update: function (value) {
    if (this.invalid) return
    if (value) {
      // avoid duplicate compiles, since update() can be
      // called with different truthy values
      if (!this.unlink) {
        var frag = templateParser.clone(this.template)
        // persist content nodes from parent.
        if (this.contentNodes) {
          var el = frag.childNodes[0]
          for (var i = 0, l = this.contentNodes.length; i < l; i++) {
            var node = this.contentNodes[i]
            var j = this.contentPositions[i]
            el.replaceChild(node, el.childNodes[j])
          }
        }
        this.compile(frag)
      }
    } else {
      this.teardown()
    }
  },

  // NOTE: this function is shared in v-partial
  compile: function (frag) {
    var vm = this.vm
    var originalChildLength = vm._children.length
    this.unlink = this.linker
      ? this.linker(vm, frag)
      : vm.$compile(frag)
    transition.blockAppend(frag, this.end, vm)
    this.children = vm._children.slice(originalChildLength)
    if (this.transCpnts) {
      this.children = this.children.concat(this.transCpnts)
    }
    if (this.children.length && _.inDoc(vm.$el)) {
      this.children.forEach(function (child) {
        child._callHook('attached')
      })
    }
  },

  // NOTE: this function is shared in v-partial
  teardown: function () {
    if (!this.unlink) return
    transition.blockRemove(this.start, this.end, this.vm)
    if (this.children && _.inDoc(this.vm.$el)) {
      this.children.forEach(function (child) {
        if (!child._isDestroyed) {
          child._callHook('detached')
        }
      })
    }
    this.unlink()
    this.unlink = null
  },

  // NOTE: this function is shared in v-partial
  unbind: function () {
    if (this.unlink) this.unlink()
  }

}