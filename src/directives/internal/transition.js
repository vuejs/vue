var _ = require('../../util')
var Transition = require('../../transition/transition')

module.exports = {

  priority: 1100,

  update: function (id, oldId) {
    var el = this.el
    // resolve on owner vm
    var hooks = _.resolveAsset(this.vm.$options, 'transitions', id)
    id = id || 'v'
    // apply on closest vm
    el.__v_trans = new Transition(el, id, hooks, this.el.__vue__ || this.vm)
    if (oldId) {
      _.removeClass(el, oldId + '-transition')
    }
    _.addClass(el, id + '-transition')
  }
}
