var config = require('../config')

var proto = Array.prototype,
    slice = proto.slice,
    mutatorMethods = [
        'pop',
        'push',
        'reverse',
        'shift',
        'unshift',
        'splice',
        'sort'
    ]

function watchArray (arr, callback) {
    mutatorMethods.forEach(function (method) {
        arr[method] = function () {
            proto[method].apply(this, arguments)
            callback({
                event: method,
                args: slice.call(arguments),
                array: arr
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
        var Seed = require('../seed'),
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