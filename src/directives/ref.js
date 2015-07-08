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
    // `v-component` already. So we just record our own ref
    // here - it will overwrite parent ref in `v-component`,
    // if any.
    vm._refID = this.expression
  }
}
