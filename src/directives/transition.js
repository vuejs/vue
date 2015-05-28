var _ = require('../util')

module.exports = {

  priority: 1000,
  isLiteral: true,

  bind: function () {
    if (!this._isDynamicLiteral) {
      this.update(this.expression)
    }
  },

  update: function (id, oldId) {
    var vm = this.el.__vue__ || this.vm
    this.el.__v_trans = {
      id: id,
      // resolve the custom transition functions now
      // so the transition module knows this is a
      // javascript transition without having to check
      // computed CSS.
      hooks: _.resolveAsset(vm.$options, 'transitions', id)
    }
    if (oldId) {
      _.removeClass(this.el, oldId + '-transition')
    }
    _.addClass(this.el, (id || 'v') + '-transition')
  }

}