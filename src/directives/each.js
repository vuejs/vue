var config = require('../config')

var mutationHandlers = {

    push: function (m) {
        var self = this
        m.args.forEach(function (data, i) {
            var seed = self.buildItem(data, self.collection.length + i)
            self.container.insertBefore(seed.el, self.marker)
        })
    },

    pop: function (m) {
        m.result.$destroy()
    },

    unshift: function (m) {
        var self = this
        m.args.forEach(function (data, i) {
            var seed = self.buildItem(data, i),
                ref  = self.collection.length > m.args.length
                     ? self.collection[m.args.length].$el
                     : self.marker
            self.container.insertBefore(seed.el, ref)
        })
        self.updateIndexes()
    },

    shift: function (m) {
        m.result.$destroy()
        var self = this
        self.updateIndexes()
    },

    splice: function (m) {
        var self    = this,
            index   = m.args[0],
            removed = m.args[1],
            added   = m.args.length - 2
        m.result.forEach(function (scope) {
            scope.$destroy()
        })
        if (added > 0) {
            m.args.slice(2).forEach(function (data, i) {
                var seed = self.buildItem(data, index + i),
                    pos  = index - removed + added + 1,
                    ref  = self.collection[pos]
                         ? self.collection[pos].$el
                         : self.marker
                self.container.insertBefore(seed.el, ref)
            })
        }
        if (removed !== added) {
            self.updateIndexes()
        }
    },

    sort: function () {
        var self = this
        self.collection.forEach(function (scope, i) {
            scope.$index = i
            self.container.insertBefore(scope.$el, self.marker)
        })
    }
}

mutationHandlers.reverse = mutationHandlers.sort

module.exports = {

    bind: function () {
        this.el.removeAttribute(config.prefix + '-each')
        var ctn = this.container = this.el.parentNode
        this.marker = document.createComment('sd-each-' + this.arg)
        ctn.insertBefore(this.marker, this.el)
        this.delegator = this.el.parentNode
        ctn.removeChild(this.el)
    },

    update: function (collection) {
        this.unbind(true)
        // for event delegation
        if (!Array.isArray(collection)) return
        this.collection = collection
        this.delegator.sdDelegationHandlers = {}
        var self = this
        collection.on('mutate', function (mutation) {
            mutationHandlers[mutation.method].call(self, mutation)
        })
        collection.forEach(function (data, i) {
            var seed = self.buildItem(data, i)
            self.container.insertBefore(seed.el, self.marker)
        })
    },

    buildItem: function (data, index) {
        var Seed = require('../seed'),
            node = this.el.cloneNode(true)
        var spore = new Seed(node, {
                each: true,
                eachPrefixRE: new RegExp('^' + this.arg + '.'),
                parentSeed: this.seed,
                index: index,
                data: data,
                delegator: this.delegator
            })
        this.collection[index] = spore.scope
        return spore
    },

    updateIndexes: function () {
        this.collection.forEach(function (scope, i) {
            scope.$index = i
        })
    },

    unbind: function (reset) {
        if (this.collection && this.collection.length) {
            var fn = reset ? '_destroy' : '_unbind'
            this.collection.forEach(function (scope) {
                scope.$seed[fn]()
            })
            this.collection = null
        }
        var delegator = this.delegator
        if (delegator) {
            var handlers = delegator.sdDelegationHandlers
            for (var key in handlers) {
                delegator.removeEventListener(handlers[key].event, handlers[key])
            }
            delete delegator.sdDelegationHandlers
        }
    }
}