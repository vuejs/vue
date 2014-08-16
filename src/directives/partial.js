var _ = require('../util')
var templateParser = require('../parse/template')

module.exports = {

  isLiteral: true,

  bind: function () {
    var id = this.expression
    var partial = this.vm.$options.partials[id]
    if (!partial) {
      return
    }
    partial = templateParser.parse(partial, true)
    // comment ref node means inline partial
    if (el.nodeType === 8) {
      var el = this.el
      var vm = this.vm
      // keep a ref for the partial's content nodes
      var nodes = _.toArray(partial.childNodes)
      _.before(partial, el)
      _.remove(el)
      // compile partial after appending, because its
      // children's parentNode will change from the fragment
      // to the correct parentNode. This could affect
      // directives that need access to its element's
      // parentNode.
      nodes.forEach(vm._compileNode, vm)
    } else {
      // just set innerHTML...
      el.innerHTML = ''
      el.appendChild(partial)
    }
  }

}