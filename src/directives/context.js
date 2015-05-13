var _ = require('../util')

module.exports = {

  acceptStatement: true,

  bind: function () {
    var child = this.el.__vue__
    this.handlerSet = false
    if (!child || this.vm !== child.$parent) {
      _.warn(
        '`v-context` should only be used on a child component ' +
        'from the parent template.'
      )
      return
    }

    this.hasContext = !!child.$options.context
    this.contextIndex = -1
    if (this.hasContext) {
      var context = child.$options.context
      for (var i = 0, l = context.length; i < l; ++i) {
        if (context[i].name === this.arg) {
          this.contextIndex = i
          this.hasContext = true
          return
        }
      }
      this.hasContext = false
    }

    if (!this.hasContext) {
      _.warn(
        'Directive "v-context:' + this.arg +
        '" expects a context name declared in vm\'s options.'
      )
    }
  },

  update: function (handler) {
    if (typeof handler !== 'function') {
      _.warn(
        'Directive "v-context:' + this.expression + '" ' +
        'expects a function value.'
      )
      return
    }

    var child = this.el.__vue__
    var arg = this.arg
    if (!this.hasContext) {
      return
    }

    this.reset()
    this.oldHandler = child.$context[arg]
    child.$context[arg] = child.$options.context[this.contextIndex].set.call(child, handler, arg)
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