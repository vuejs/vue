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
        if (this.seed.each) {
            // attach an identifier to the el
            // so it can be matched during event delegation
            this.el[this.expression] = true
            // attach the owner scope of this directive
            this.el.sd_scope = this.seed.scope
        }
    },

    update: function (handler) {

        this.unbind()
        if (!handler) return

        var seed  = this.seed,
            event = this.arg

        if (seed.each && event !== 'blur' && event !== 'blur') {

            // for each blocks, delegate for better performance
            // focus and blur events dont bubble so exclude them
            var delegator  = seed.delegator,
                identifier = this.expression,
                dHandler   = delegator.sd_dHandlers[identifier]

            if (dHandler) return

            // the following only gets run once for the entire each block
            dHandler = delegator.sd_dHandlers[identifier] = function (e) {
                var target = delegateCheck(e.target, delegator, identifier)
                if (target) {
                    handler({
                        el: target,
                        scope: target.sd_scope,
                        originalEvent: e
                    })
                }
            }
            dHandler.event = event
            delegator.addEventListener(event, dHandler)

        } else {

            // a normal, single element handler
            this.handler = function (e) {
                handler({
                    el: e.currentTarget,
                    scope: seed.scope,
                    originalEvent: e
                })
            }
            this.el.addEventListener(event, this.handler)

        }
    },

    unbind: function () {
        this.el.removeEventListener(this.arg, this.handler)
    }
}