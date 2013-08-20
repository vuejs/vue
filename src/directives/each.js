var config = require('../config'),
    utils  = require('../utils'),
    ViewModel // lazy def to avoid circular dependency

/*
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var i, l = m.args.length,
            baseIndex = this.collection.length - l
        for (i = 0; i < l; i++) {
            this.buildItem(this.ref, m.args[i], baseIndex + i)
        }
    },

    pop: function (m) {
        m.result.$destroy()
    },

    unshift: function (m) {
        var i, l = m.args.length, ref
        for (i = 0; i < l; i++) {
            ref = this.collection.length > l
                ? this.collection[l].$el
                : this.ref
            this.buildItem(ref, m.args[i], i)
        }
        this.updateIndexes()
    },

    shift: function (m) {
        m.result.$destroy()
        this.updateIndexes()
    },

    splice: function (m) {
        var i, pos, ref,
            l = m.args.length,
            k = m.result.length,
            index   = m.args[0],
            removed = m.args[1],
            added   = l - 2
        for (i = 0; i < k; i++) {
            m.result[i].$destroy()
        }
        if (added > 0) {
            for (i = 2; i < l; i++) {
                pos  = index - removed + added + 1
                ref  = this.collection[pos]
                     ? this.collection[pos].$el
                     : this.ref
                this.buildItem(ref, m.args[i], index + i)
            }
        }
        if (removed !== added) {
            this.updateIndexes()
        }
    },

    sort: function () {
        var i, l = this.collection.length, viewmodel
        for (i = 0; i < l; i++) {
            viewmodel = this.collection[i]
            viewmodel.$index = i
            this.container.insertBefore(viewmodel.$el, this.ref)
        }
    }
}

//mutationHandlers.reverse = mutationHandlers.sort

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
        this.mutationListener = (function (mutation) {
            mutationHandlers[mutation.method].call(this, mutation)
        }).bind(this)
    },

    update: function (collection) {

        this.unbind(true)
        // attach an object to container to hold handlers
        this.container.sd_dHandlers = {}
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.collection && !collection.length) {
            this.buildItem(this.ref, null, null)
        }
        this.collection = collection
        this.vms = []

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        collection.__observer__.on('mutate', this.mutationListener)

        // create child-seeds and append to DOM
        for (var i = 0, l = collection.length; i < l; i++) {
            this.buildItem(this.ref, collection[i], i)
        }
    },

    buildItem: function (ref, data, index) {
        var node = this.el.cloneNode(true)
        this.container.insertBefore(node, ref)
        ViewModel = ViewModel || require('../viewmodel')
        var vmID = node.getAttribute(config.prefix + '-viewmodel'),
            ChildVM = utils.getVM(vmID) || ViewModel
        var item = new ChildVM({
            el: node,
            each: true,
            eachPrefix: this.arg + '.',
            parentCompiler: this.compiler,
            index: index,
            delegator: this.container,
            data: {
                todo: data
            }
        })
        if (index) {
            this.vms[index] = item
        } else {
            item.$destroy()
        }
    },

    updateIndexes: function () {
        var i = this.collection.length
        while (i--) {
            this.collection[i].$index = i
        }
    },

    unbind: function () {
        if (this.collection) {
            this.collection.off('mutate', this.mutationListener)
            var i = this.collection.length
            while (i--) {
                this.collection[i].$destroy()
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