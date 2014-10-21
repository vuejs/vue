var _ = require('../util')
var compile = require('../compile/compile')
var templateParser = require('../parse/template')
var transition = require('../transition')

module.exports = {

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      this.ref = document.createComment('v-if')
      _.replace(el, this.ref)
      this.isBlock = el.tagName === 'TEMPLATE'
      this.template = this.isBlock
        ? templateParser.parse(el, true)
        : el
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

  update: function (value) {
    if (this.invalid) return
    if (value) {
      this.insert()
    } else {
      this.teardown()
    }
  },

  insert: function () {
    var vm = this.vm
    var el = templateParser.clone(this.template)
    var ref = this.ref
    var decompile = this.linker(vm, el)
    if (this.isBlock) {
      var blockStart = el.firstChild
      this.decompile = function () {
        decompile()
        var node = blockStart
        var next
        while (node !== ref) {
          next = node.nextSibling
          transition.remove(node, vm)
          node = next
        }
      }
    } else {
      this.decompile = function () {
        decompile()
        transition.remove(el, vm)
      }
    }
    transition.before(el, ref, vm)
  },

  teardown: function () {
    if (this.decompile) {
      this.decompile()
      this.decompile = null
    }
  }

}