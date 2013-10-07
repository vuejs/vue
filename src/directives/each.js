var config   = require('../config'),
    utils    = require('../utils'),
    Observer = require('../observer'),
    Emitter  = require('../emitter'),
    ViewModel // lazy def to avoid circular dependency

/*
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var i, l = m.args.length,
            base = this.collection.length - l
        for (i = 0; i < l; i++) {
            this.buildItem(m.args[i], base + i)
        }
    },

    pop: function () {
        this.vms.pop().$destroy()
    },

    unshift: function (m) {
        var i, l = m.args.length
        for (i = 0; i < l; i++) {
            this.buildItem(m.args[i], i)
        }
    },

    shift: function () {
        this.vms.shift().$destroy()
    },

    splice: function (m) {
        var i,
            index = m.args[0],
            removed = m.args[1],
            added = m.args.length - 2,
            removedVMs = this.vms.splice(index, removed)
        for (i = 0; i < removed; i++) {
            removedVMs[i].$destroy()
        }
        for (i = 0; i < added; i++) {
            this.buildItem(m.args[i + 2], index + i)
        }
    },

    sort: function () {
        var key = this.arg,
            vms = this.vms,
            col = this.collection,
            l = col.length,
            sorted = new Array(l),
            i, j, vm, data
        for (i = 0; i < l; i++) {
            data = col[i]
            for (j = 0; j < l; j++) {
                vm = vms[j]
                if (vm[key] === data) {
                    sorted[i] = vm
                    break
                }
            }
        }
        for (i = 0; i < l; i++) {
            this.container.insertBefore(sorted[i].$el, this.ref)
        }
        this.vms = sorted
    },

    reverse: function () {
        var vms = this.vms
        vms.reverse()
        for (var i = 0, l = vms.length; i < l; i++) {
            this.container.insertBefore(vms[i].$el, this.ref)
        }
    }
}

module.exports = {

    bind: function () {
        this.el.removeAttribute(config.prefix + '-each')
        var ctn = this.container = this.el.parentNode
        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment('sd-each-' + this.arg)
        ctn.insertBefore(this.ref, this.el)
        ctn.removeChild(this.el)
        this.collection = null
        this.vms = null
        var self = this
        this.mutationListener = function (path, arr, mutation) {
            mutationHandlers[mutation.method].call(self, mutation)
        }
    },

    update: function (collection) {

        this.unbind(true)
        // attach an object to container to hold handlers
        this.container.sd_dHandlers = {}
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.collection && !collection.length) {
            this.buildItem()
        }
        this.collection = collection
        this.vms = []

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        if (!collection.__observer__) Observer.watchArray(collection, null, new Emitter())
        collection.__observer__.on('mutate', this.mutationListener)

        // create child-seeds and append to DOM
        for (var i = 0, l = collection.length; i < l; i++) {
            this.buildItem(collection[i], i)
        }
    },

    buildItem: function (data, index) {
        ViewModel = ViewModel || require('../viewmodel')
        var node = this.el.cloneNode(true),
            ctn  = this.container,
            vmID = node.getAttribute(config.prefix + '-viewmodel'),
            opts = this.compiler.options,
            ChildVM =
                (opts.vms && opts.vms[vmID]) ||
                utils.vms[vmID] ||
                ViewModel,
            wrappedData = {}
        wrappedData[this.arg] = data || {}
        var item = new ChildVM({
            el: node,
            data: wrappedData,
            eachOptions: {
                each: true,
                eachPrefix: this.arg,
                parentCompiler: this.compiler,
                delegator: ctn
            }
        })
        if (!data) {
            item.$destroy()
        } else {
            var ref = this.vms.length > index
                ? this.vms[index].$el
                : this.ref
            ctn.insertBefore(node, ref)
            this.vms.splice(index, 0, item)
        }
    },

    unbind: function () {
        if (this.collection) {
            this.collection.__observer__.off('mutate', this.mutationListener)
            var i = this.vms.length
            while (i--) {
                this.vms[i].$destroy()
            }
        }
        var ctn = this.container,
            handlers = ctn.sd_dHandlers
        for (var key in handlers) {
            ctn.removeEventListener(handlers[key].event, handlers[key])
        }
        ctn.sd_dHandlers = null
    }
}