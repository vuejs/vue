var config = require('../config')

/*
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var self = this
        m.args.forEach(function (data, i) {
            var seed = self.buildItem(data, self.collection.length + i)
            self.container.insertBefore(seed.el, self.ref)
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
                     : self.ref
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
                         : self.ref
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
            self.container.insertBefore(scope.$el, self.ref)
        })
    }
}

mutationHandlers.reverse = mutationHandlers.sort

module.exports = {

    bind: function () {
        this.el.removeAttribute(config.prefix + '-each')
        var ctn = this.container = this.el.parentNode
        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment('sd-each-' + this.arg)
        ctn.insertBefore(this.ref, this.el)
        ctn.removeChild(this.el)
    },

    update: function (collection) {

        this.unbind(true)
        if (!Array.isArray(collection)) return
        this.collection = collection

        // attach an object to container to hold handlers
        this.container.sd_dHandlers = {}

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        var self = this
        collection.on('mutate', function (mutation) {
            mutationHandlers[mutation.method].call(self, mutation)
        })

        // create child-seeds and append to DOM
        collection.forEach(function (data, i) {
            var seed = self.buildItem(data, i)
            self.container.insertBefore(seed.el, self.ref)
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
                delegator: this.container
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
        var ctn = this.container,
            handlers = ctn.sd_dHandlers
        for (var key in handlers) {
            ctn.removeEventListener(handlers[key].event, handlers[key])
        }
        delete ctn.sd_dHandlers
    }
}