var _ = require('../util')
var compile = require('../compile/compile')
var templateParser = require('../parse/template')

module.exports = {

  isLiteral: true,

  bind: function () {
    var id = this.expression
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
      compile(partial, vm.$options)(vm, partial)
      _.replace(el, partial)
    } else {
      // just set innerHTML...
      el.innerHTML = ''
      el.appendChild(partial)
      compile(el, vm.$options, true)(vm, el)
    }
  }

}