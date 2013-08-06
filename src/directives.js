var config = require('./config'),
    watchArray = require('./watch-array')

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

    text: function (value) {
        this.el.textContent = value === null ?
            '' : value.toString()
    },

    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },

    class: function (value) {
        if (this.arg) {
            this.el.classList[value ? 'add' : 'remove'](this.arg)
        } else {
            this.el.classList.remove(this.lastVal)
            this.el.classList.add(value)
            this.lastVal = value
        }
    },

    checked: {
        bind: function () {
            var el = this.el,
                self = this
            this.change = function () {
                self.seed.scope[self.key] = el.checked
            }
            el.addEventListener('change', this.change)
        },
        update: function (value) {
            this.el.checked = value
        },
        unbind: function () {
            this.el.removeEventListener('change', this.change)
        }
    },

    on: {
        fn : true,
        bind: function (handler) {
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
                            handler({
                                el            : target,
                                originalEvent : e,
                                directive     : self,
                                seed          : target.seed
                            })
                        }
                    }
                    delegator.addEventListener(event, delegator[selector])
                }

            } else {

                // a normal handler
                this.handler = function (e) {
                    handler({
                        el            : e.currentTarget,
                        originalEvent : e,
                        directive     : self,
                        seed          : self.seed
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
    },

    each: {
        bind: function () {
            this.el.removeAttribute(config.prefix + '-each')
            var ctn = this.container = this.el.parentNode
            this.marker = document.createComment('sd-each-' + this.arg)
            ctn.insertBefore(this.marker, this.el)
            ctn.removeChild(this.el)
            this.childSeeds = []
        },
        update: function (collection) {
            this.unbind(true)
            this.childSeeds = []
            if (!Array.isArray(collection)) return
            watchArray(collection, this.mutate.bind(this))
            var self = this
            collection.forEach(function (item, i) {
                self.childSeeds.push(self.buildItem(item, i, collection))
            })
        },
        buildItem: function (data, index, collection) {
            var Seed = require('./seed'),
                node = this.el.cloneNode(true)
            var spore = new Seed(node, {
                    each: true,
                    eachPrefixRE: new RegExp('^' + this.arg + '.'),
                    parentSeed: this.seed,
                    index: index,
                    data: data
                })
            this.container.insertBefore(node, this.marker)
            collection[index] = spore.scope
            return spore
        },
        mutate: function (mutation) {
            console.log(mutation)
        },
        unbind: function (rm) {
            if (this.childSeeds.length) {
                var fn = rm ? '_destroy' : '_unbind'
                this.childSeeds.forEach(function (child) {
                    child[fn]()
                })
            }
        }
    }

}