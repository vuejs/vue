var warn = require('../utils').warn

module.exports = {

    isFn: true,

    bind: function () {
        // blur and focus events do not bubble
        // so they can't be delegated
        this.bubbles = this.arg !== 'blur' && this.arg !== 'focus'
        if (this.bubbles) {
            this.compiler.addListener(this)
        }
    },

    update: function (handler) {
        if (typeof handler !== 'function') {
            return warn('Directive "on" expects a function value.')
        }
        var targetVM = this.vm,
            ownerVM  = this.binding.compiler.vm,
            isExp    = this.binding.isExp,
            newHandler = function (e) {
                e.targetVM = targetVM
                handler.call(isExp ? targetVM : ownerVM, e)
            }
        if (!this.bubbles) {
            this.reset()
            this.el.addEventListener(this.arg, newHandler)
        }
        this.handler = newHandler
    },

    reset: function () {
        this.el.removeEventListener(this.arg, this.handler)
    },
    
    unbind: function () {
        if (this.bubbles) {
            this.compiler.removeListener(this)
        } else {
            this.reset()
        }
    }
}