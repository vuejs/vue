var utils    = require('../utils')

module.exports = {

    isFn: true,

    bind: function () {
        this.context = this.binding.isExp
            ? this.vm
            : this.binding.compiler.vm
    },

    update: function (handler) {
        if (typeof handler !== 'function') {
            utils.warn('Directive "on" expects a function value.')
            return
        }
        this._unbind()
        var vm = this.vm,
            context = this.context
        this.handler = function (e) {
            e.targetVM = vm
            context.$event = e
            handler.call(context, e)
            context.$event = null
        }
        this.el.addEventListener(this.arg, this.handler)
    },

    unbind: function () {
        this.el.removeEventListener(this.arg, this.handler)
    }
}