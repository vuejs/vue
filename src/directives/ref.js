var _ = require('../util')

module.exports = {

  isLiteral: true,

  bind: function () {
    var vm = this.el.__vue__
    if (!vm) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'v-ref should only be used on a component root element.'
      )
      return
    }
    // If we get here, it means this is a `v-ref` on a
    // child, because parent scope `v-ref` is stripped in
    // `v-component` already.
    var ref = this.arg || this.expression
    var context = this.vm._scope || this.vm._context
    context.$[ref] = this.vm

    if (process.env.NODE_ENV !== 'production') {
      _.deprecation.REF_IN_CHILD()
    }
  },

  unbind: function () {
    var ref = this.expression
    var context = this.vm._scope || this.vm._context
    if (context.$[ref] === this.vm) {
      context.$[ref] = null
    }
  }
}
