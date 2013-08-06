// sniff matchesSelector() method name.

var matches = 'atchesSelector',
    prefixes = ['m', 'webkitM', 'mozM', 'msM']

prefixes.some(function (prefix) {
    var match = prefix + matches
    if (document.body[match]) {
        matches = match
        return true
    }
})

function delegateCheck (current, top, selector) {
    if (current.webkitMatchesSelector(selector)) {
        return current
    } else if (current === top) {
        return false
    } else {
        return delegateCheck(current.parentNode, top, selector)
    }
}

module.exports = {

    fn : true,

    bind: function () {
        if (this.seed.each) {
            this.selector = '[' + this.directiveName + '*="' + this.expression + '"]'
            this.delegator = this.seed.el.parentNode
        }
    },

    update: function (handler) {
        this.unbind()
        if (!handler) return
        var self  = this,
            event = this.arg,
            selector  = this.selector,
            delegator = this.delegator
        if (delegator) {

            // for each blocks, delegate for better performance
            if (!delegator[selector]) {
                console.log('binding listener')
                delegator[selector] = function (e) {
                    var target = delegateCheck(e.target, delegator, selector)
                    if (target) {
                        handler.call(self.seed.scope, {
                            originalEvent : e,
                            el            : target,
                            scope         : target.seed.scope
                        })
                    }
                }
                delegator.addEventListener(event, delegator[selector])
            }

        } else {

            // a normal handler
            this.handler = function (e) {
                handler.call(self.seed.scope, {
                    originalEvent : e,
                    el            : e.currentTarget,
                    scope         : self.seed.scope
                })
            }
            this.el.addEventListener(event, this.handler)

        }
    },

    unbind: function () {
        var event = this.arg,
            selector  = this.selector,
            delegator = this.delegator
        if (delegator && delegator[selector]) {
            delegator.removeEventListener(event, delegator[selector])
            delete delegator[selector]
        } else if (this.handler) {
            this.el.removeEventListener(event, this.handler)
        }
    }
}