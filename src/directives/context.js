var _ = require('../util')

module.exports = {

  acceptStatement: true,

  bind: function () {
    var child = this.el.__vue__
    if (!child || this.vm !== child.$parent) {
      _.warn(
        '`v-context` should only be used on a child component ' +
        'from the parent template.'
      )
      return
    }

    if (!child.$context) {
      _.warn(
        '`v-context` should only be used on a component whose declared context.'
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
    if (!child.$options.context || -1 === child.$options.context.indexOf(arg)) {
      _.warn(
        'update failed due to no declared context `' + arg +
        '` found in `' + child.constructor.name + '`.'
      )
      return
    }

    child.$context[arg] = handler
  }

  // when child is destroyed, `$context` are set to null,
  // so no need for unbind here.
}