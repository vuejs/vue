var config = require('../config')

var augmentations = {
    remove: function (scope) {
        this.splice(scope.$index, 1)
    },
    replace: function (index, data) {
        if (typeof index !== 'number') {
            index = index.$index
        }
        this.splice(index, 1, data)
    }
}

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
        var self    = this,
            index   = m.args[0],
            removed = m.args[1],
            added   = m.args.length - 2
        m.result.forEach(function (scope) {
            scope.$destroy()
        })
        if (added > 0) {
            m.args.slice(2).forEach(function (data, i) {
                var seed  = self.buildItem(data, index + i),
                    pos   = index - removed + added + 1,
                    ref   = self.collection[pos]
                          ? self.collection[pos].$seed.el
                          : self.marker
                self.container.insertBefore(seed.el, ref)
            })
        }
        if (removed !== added) {
            self.reorder()
        }
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

function watchArray (collection, callback) {

    Object.keys(mutationHandlers).forEach(function (method) {
        collection[method] = function () {
            var result = Array.prototype[method].apply(this, arguments)
            callback({
                method: method,
                args: Array.prototype.slice.call(arguments),
                result: result
            })
        }
    })

    for (var method in augmentations) {
        collection[method] = augmentations[method]
    }
}

module.exports = {

    mutationHandlers: mutationHandlers,

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
            if (self.mutationHandlers) {
                self.mutationHandlers[mutation.method].call(self, mutation)
            }
            if (self.binding.refreshDependents) {
                self.binding.refreshDependents()
            }
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
        console.log('reorder')
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