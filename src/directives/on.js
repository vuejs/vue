var utils    = require('../utils'),
    noBubble = ['blur', 'focus', 'load']

module.exports = {

    isFn: true,

    bind: function () {
        // blur and focus events do not bubble
        // so they can't be delegated
        this.bubbles = noBubble.indexOf(this.arg) === -1
        if (this.bubbles) {
            this.binding.compiler.addListener(this)
        }
    },

    update: function (handler) {
        if (typeof handler !== 'function') {
            utils.warn('Directive "on" expects a function value.')
            return
        }
        var el       = this.el,
            targetVM = this.vm,
            context  = this.binding.isExp
                ? targetVM
                : this.binding.compiler.vm,
            newHandler = function (e) {
                e.targetEl = el
                e.targetVM = targetVM
                context.$event = e
                handler.call(context, e)
                context.$event = null
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
            this.binding.compiler.removeListener(this)
        } else {
            this.reset()
        }
    }
}