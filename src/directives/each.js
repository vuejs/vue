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
            var seed = self.buildItem(data, i)
            self.container.insertBefore(seed.el, self.collection[m.args.length].$seed.el)
        })
        self.reorder()
    },
    shift: function (m) {
        m.result.$destroy()
        var self = this
        self.reorder()
    },
    splice: function (m) {
        var self = this
        m.result.forEach(function (scope) {
            scope.$destroy()
        })
        if (m.args.length > 2) {
            m.args.slice(2).forEach(function (data, i) {
                var seed  = self.buildItem(data, i),
                    index = m.args[0] - m.args[1] + (m.args.length - 1),
                    ref   = self.collection[index]
                          ? self.collection[index].$seed.el
                          : self.marker
                self.container.insertBefore(seed.el, ref)
            })
        }
        self.reorder()
    },
    sort: function () {
        var self = this
        self.collection.forEach(function (scope, i) {
            scope.$index = i
            self.container.insertBefore(scope.$seed.el, self.marker)
        })
    }
}
mutationHandlers.reverse = mutationHandlers.sort

function watchArray (arr, callback) {
    Object.keys(mutationHandlers).forEach(function (method) {
        arr[method] = function () {
            var result = Array.prototype[method].apply(this, arguments)
            callback({
                method: method,
                args: Array.prototype.slice.call(arguments),
                result: result
            })
        }
    })
}

module.exports = {

    bind: function () {
        this.el.removeAttribute(config.prefix + '-each')
        var ctn = this.container = this.el.parentNode
        this.marker = document.createComment('sd-each-' + this.arg)
        ctn.insertBefore(this.marker, this.el)
        ctn.removeChild(this.el)
    },

    update: function (collection) {
        this.unbind(true)
        if (!Array.isArray(collection)) return
        this.collection = collection
        var self = this
        watchArray(collection, function (mutation) {
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
                data: data
            })
        this.collection[index] = spore.scope
        return spore
    },

    reorder: function () {
        this.collection.forEach(function (scope, i) {
            scope.$index = i
        })
    },

    unbind: function (rm) {
        if (this.collection && this.collection.length) {
            var fn = rm ? '_destroy' : '_unbind'
            this.collection.forEach(function (scope) {
                scope.$seed[fn]()
            })
            this.collection = null
        }
    }
}