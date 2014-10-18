var _ = require('../util')
var templateParser = require('../parse/template')

module.exports = {

  isLiteral: true,

  bind: function () {
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
    if (el.nodeType === 8) {
      // comment ref node means inline partial
      // which can only be static
      vm.$compile(partial)
      _.replace(el, partial)
    } else {
      // just set innerHTML...
      el.innerHTML = ''
      el.appendChild(partial)
      this.decompile = vm.$compile(el)
    }
  },

  unbind: function () {
    if (this.decompile) {
      this.decompile()
      this.decompile = null
    }
  }

}