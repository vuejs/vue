var config = require('../config')

/*
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var self = this
        m.args.forEach(function (data, i) {
            self.buildItem(self.ref, data, self.collection.length + i)
        })
    },

    pop: function (m) {
        m.result.$destroy()
    },

    unshift: function (m) {
        var self = this
        m.args.forEach(function (data, i) {
            var ref  = self.collection.length > m.args.length
                     ? self.collection[m.args.length].$el
                     : self.ref
            self.buildItem(ref, data, i)
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
                var pos  = index - removed + added + 1,
                    ref  = self.collection[pos]
                         ? self.collection[pos].$el
                         : self.ref
                self.buildItem(ref, index + i)
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
            self.buildItem(self.ref, data, i)
        })
    },

    buildItem: function (ref, data, index) {
        var node = this.el.cloneNode(true)
        this.container.insertBefore(node, ref)
        var Seed = require('../seed'),
            spore = new Seed(node, {
                each: true,
                eachPrefix: this.arg + '.',
                parentSeed: this.seed,
                index: index,
                data: data,
                delegator: this.container
            })
        this.collection[index] = spore.scope
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