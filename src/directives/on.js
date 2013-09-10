var utils = require('../utils')

function delegateCheck (current, top, identifier) {
    if (current[identifier]) {
        return current
    } else if (current === top) {
        return false
    } else {
        return delegateCheck(current.parentNode, top, identifier)
    }
}

module.exports = {

    expectFunction : true,

    bind: function () {
        if (this.compiler.each) {
            // attach an identifier to the el
            // so it can be matched during event delegation
            this.el[this.expression] = true
            // attach the owner viewmodel of this directive
            this.el.sd_viewmodel = this.vm
        }
    },

    update: function (handler) {

        this.unbind(true)
        if (!handler) return
        if (typeof handler !== 'function') {
            utils.warn('Expression is not allowed where a handler is expected.')
            return
        }

        var compiler = this.compiler,
            event    = this.arg,
            ownerVM  = this.binding.compiler.vm

        if (compiler.each && event !== 'blur' && event !== 'blur') {

            // for each blocks, delegate for better performance
            // focus and blur events dont bubble so exclude them
            var delegator  = compiler.delegator,
                identifier = this.expression,
                dHandler   = delegator.sd_dHandlers[identifier]

            if (dHandler) return

            // the following only gets run once for the entire each block
            dHandler = delegator.sd_dHandlers[identifier] = function (e) {
                var target = delegateCheck(e.target, delegator, identifier)
                if (target) {
                    e.el = target
                    e.vm = target.sd_viewmodel
                    e.item = e.vm[compiler.eachPrefix]
                    handler.call(ownerVM, e)
                }
            }
            dHandler.event = event
            delegator.addEventListener(event, dHandler)

        } else {

            // a normal, single element handler
            var vm = this.vm
            this.handler = function (e) {
                e.el = e.currentTarget
                e.vm = vm
                if (compiler.each) {
                    e.item = vm[compiler.eachPrefix]
                }
                handler.call(ownerVM, e)
            }
            this.el.addEventListener(event, this.handler)

        }
    },

    unbind: function (update) {
        this.el.removeEventListener(this.arg, this.handler)
        this.handler = null
        if (!update) this.el.sd_viewmodel = null
    }
}