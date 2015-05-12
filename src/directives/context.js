var _ = require('../util')

module.exports = {

  acceptStatement: true,

  bind: function () {
    var child = this.el.__vue__
    if (!child || this.vm !== child.$parent) {
      _.warn(
        '`v-events` should only be used on a child component ' +
        'from the parent template.'
      )
      return
    }
    this.handlerSet = false
  },

  update: function (handler) {
    if (typeof handler !== 'function') {
      _.warn(
        'Directive "v-context:' + this.expression + '" ' +
        'expects a function value.'
      )
      return
    }

    this.reset()
    var child = this.el.__vue__
    this.oldHandler = child.$context[this.arg]
    child.$context[this.arg] = handler
    this.handlerSet = true
  },

  reset: function () {
    var child = this.el.__vue__
    if (this.handlerSet) {
      child.$context[this.arg] = this.oldHandler
    }
    child.$context = child.$context || {}
  },

  unbind: function () {
    this.reset()
  }
}