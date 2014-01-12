var Observer   = require('../observer'),
    Emitter    = require('../emitter'),
    utils      = require('../utils'),
    config     = require('../config'),
    transition = require('../transition'),
    ViewModel // lazy def to avoid circular dependency

/**
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
        var vm = this.vms.pop()
        if (vm) vm.$destroy()
    },

    unshift: function (m) {
        var i, l = m.args.length
        for (i = 0; i < l; i++) {
            this.buildItem(m.args[i], i)
        }
    },

    shift: function () {
        var vm = this.vms.shift()
        if (vm) vm.$destroy()
    },

    splice: function (m) {
        var i, l,
            index = m.args[0],
            removed = m.args[1],
            added = m.args.length - 2,
            removedVMs = this.vms.splice(index, removed)
        for (i = 0, l = removedVMs.length; i < l; i++) {
            removedVMs[i].$destroy()
        }
        for (i = 0; i < added; i++) {
            this.buildItem(m.args[i + 2], index + i)
        }
    },

    sort: function () {
        var vms = this.vms,
            col = this.collection,
            l = col.length,
            sorted = new Array(l),
            i, j, vm, data
        for (i = 0; i < l; i++) {
            data = col[i]
            for (j = 0; j < l; j++) {
                vm = vms[j]
                if (vm.$data === data) {
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

        var self = this,
            el   = self.el,
            ctn  = self.container = el.parentNode

        // extract child VM information, if any
        ViewModel = ViewModel || require('../viewmodel')
        self.Ctor = self.Ctor || ViewModel

        // extract transition information
        self.hasTrans   = el.hasAttribute(config.attrs.transition)

        // create a comment node as a reference node for DOM insertions
        self.ref = document.createComment(config.prefix + '-repeat-' + self.key)
        ctn.insertBefore(self.ref, el)
        ctn.removeChild(el)

        self.initiated = false
        self.collection = null
        self.vms = null
        self.mutationListener = function (path, arr, mutation) {
            var method = mutation.method
            mutationHandlers[method].call(self, mutation)
            if (method !== 'push' && method !== 'pop') {
                self.updateIndexes()
            }
        }

    },

    update: function (collection) {

        this.unbind(true)
        // attach an object to container to hold handlers
        this.container.vue_dHandlers = utils.hash()
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.initiated && (!collection || !collection.length)) {
            this.buildItem()
            this.initiated = true
        }
        collection = this.collection = collection || []
        this.vms = []

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        if (!collection.__observer__) Observer.watchArray(collection, null, new Emitter())
        collection.__observer__.on('mutate', this.mutationListener)

        // create child-vms and append to DOM
        if (collection.length) {
            for (var i = 0, l = collection.length; i < l; i++) {
                this.buildItem(collection[i], i)
            }
        }
    },

    /**
     *  Create a new child VM from a data object
     *  passing along compiler options indicating this
     *  is a v-repeat item.
     */
    buildItem: function (data, index) {

        var node    = this.el.cloneNode(true),
            ctn     = this.container,
            ref, item

        // append node into DOM first
        // so v-if can get access to parentNode
        if (data) {
            ref = this.vms.length > index
                ? this.vms[index].$el
                : this.ref
            // make sure it works with v-if
            if (!ref.parentNode) ref = ref.vue_ref
            // process transition info before appending
            node.vue_trans = utils.attr(node, 'transition', true)
            transition(node, 1, function () {
                ctn.insertBefore(node, ref)
            }, this.compiler)
        }

        item = new this.Ctor({
            el: node,
            data: data,
            compilerOptions: {
                repeat: true,
                repeatIndex: index,
                repeatCollection: this.collection,
                parentCompiler: this.compiler,
                delegator: ctn
            }
        })

        if (!data) {
            // this is a forced compile for an empty collection.
            // let's remove it...
            item.$destroy()
        } else {
            this.vms.splice(index, 0, item)
        }
    },

    /**
     *  Update index of each item after a mutation
     */
    updateIndexes: function () {
        var i = this.vms.length
        while (i--) {
            this.vms[i].$data.$index = i
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
            handlers = ctn.vue_dHandlers
        for (var key in handlers) {
            ctn.removeEventListener(handlers[key].event, handlers[key])
        }
        ctn.vue_dHandlers = null
    }
}