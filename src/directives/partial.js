var _ = require('../util')
var templateParser = require('../parse/template')

module.exports = {

  isLiteral: true,

  bind: function () {
    var el = this.el
    if (el.nodeType !== 8) {
      el.innerHTML = ''
    }
    if (el.tagName === 'TEMPLATE') {
      this.el = document.createComment('v-partial')
      _.replace(el, this.el)
    }
    if (!this._isDynamicLiteral) {
      this.compile(this.expression)
    } 
  },

  update: function (id) {
    this.unbind()
    this.compile(id)
  },

  compile: function (id) {
    var partial = this.vm.$options.partials[id]
    _.assertAsset(partial, 'partial', id)
    if (!partial) {
      return
    }
    partial = templateParser.parse(partial, true)
    var el = this.el
    var vm = this.vm
    var decompile = vm.$compile(partial)
    if (el.nodeType === 8) {
      // comment ref node means inline partial
      var blockStart = partial.firstChild
      this.decompile = function () {
        decompile()
        var node = blockStart
        var next
        while (node !== el) {
          next = node.nextSibling
          _.remove(node)
          node = next
        }
      }
      _.before(partial, el)
    } else {
      // just append to container
      this.decompile = function () {
        decompile()
        el.innerHTML = ''
      }
      el.appendChild(partial)
    }
  },

  unbind: function () {
    if (this.decompile) {
      this.decompile()
      this.decompile = null
    }
  }

}