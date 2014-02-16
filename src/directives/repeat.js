var Observer   = require('../observer'),
    utils      = require('../utils'),
    config     = require('../config'),
    transition = require('../transition'),
    def        = utils.defProtected,
    ViewModel // lazy def to avoid circular dependency

/**
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var l = m.args.length,
            base = this.collection.length - l
        for (var i = 0; i < l; i++) {
            this.buildItem(m.args[i], base + i)
            this.updateObject(m.args[i], 1)
        }
    },

    pop: function () {
        var vm = this.vms.pop()
        if (vm) {
            vm.$destroy()
            this.updateObject(vm.$data, -1)
        }
    },

    unshift: function (m) {
        for (var i = 0, l = m.args.length; i < l; i++) {
            this.buildItem(m.args[i], i)
            this.updateObject(m.args[i], 1)
        }
    },

    shift: function () {
        var vm = this.vms.shift()
        if (vm) {
            vm.$destroy()
            this.updateObject(vm.$data, -1)
        }
    },

    splice: function (m) {
        var i, l,
            index = m.args[0],
            removed = m.args[1],
            added = m.args.length - 2,
            removedVMs = this.vms.splice(index, removed)
        for (i = 0, l = removedVMs.length; i < l; i++) {
            removedVMs[i].$destroy()
            this.updateObject(removedVMs[i].$data, -1)
        }
        for (i = 0; i < added; i++) {
            this.buildItem(m.args[i + 2], index + i)
            this.updateObject(m.args[i + 2], 1)
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

/**
 *  Convert an Object to a v-repeat friendly Array
 */
function objectToArray (obj) {
    var res = [], val, data
    for (var key in obj) {
        val = obj[key]
        data = utils.typeOf(val) === 'Object'
            ? val
            : { $value: val }
        def(data, '$key', key, false, true)
        res.push(data)
    }
    return res
}

/**
 *  Find an object or a wrapped data object
 *  from an Array
 */
function indexOf (arr, obj) {
    for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] === obj || (obj.$value && arr[i].$value === obj.$value)) {
            return i
        }
    }
    return -1
}

module.exports = {

    bind: function () {

        var el   = this.el,
            ctn  = this.container = el.parentNode

        // extract child VM information, if any
        ViewModel = ViewModel || require('../viewmodel')
        this.Ctor = this.Ctor || ViewModel
        // extract transition information
        this.hasTrans = el.hasAttribute(config.attrs.transition)
        // extract child Id, if any
        this.childId = utils.attr(el, 'ref')

        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment(config.prefix + '-repeat-' + this.key)
        ctn.insertBefore(this.ref, el)
        ctn.removeChild(el)

        this.initiated = false
        this.collection = null
        this.vms = null

        var self = this
        this.mutationListener = function (path, arr, mutation) {
            var method = mutation.method
            mutationHandlers[method].call(self, mutation)
            if (method !== 'push' && method !== 'pop') {
                // update index
                var i = arr.length
                while (i--) {
                    arr[i].$index = i
                }
            }
            if (method === 'push' || method === 'unshift' || method === 'splice') {
                // recalculate dependency
                self.changed()
            }
        }

    },

    update: function (collection, init) {

        if (
            collection === this.collection ||
            collection === this.object
        ) return

        if (utils.typeOf(collection) === 'Object') {
            if (this.object) {
                delete this.object.$repeater
            }
            this.object = collection
            collection = objectToArray(collection)
            def(this.object, '$repeater', collection, false, true)
        }

        this.reset()
        // attach an object to container to hold handlers
        this.container.vue_dHandlers = utils.hash()
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.initiated && (!collection || !collection.length)) {
            this.buildItem()
            this.initiated = true
        }

        // keep reference of old data and VMs
        // so we can reuse them if possible
        this.old = this.collection
        var oldVMs = this.oldVMs = this.vms

        collection = this.collection = collection || []
        this.vms = []
        if (this.childId) {
            this.vm.$[this.childId] = this.vms
        }

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        if (!collection.__observer__) Observer.watchArray(collection)
        collection.__observer__.on('mutate', this.mutationListener)

        // create new VMs and append to DOM
        if (collection.length) {
            collection.forEach(this.buildItem, this)
            if (!init) this.changed()
        }

        // destroy unused old VMs
        if (oldVMs) {
            var i = oldVMs.length, vm
            while (i--) {
                vm = oldVMs[i]
                if (vm.$reused) {
                    vm.$reused = false
                } else {
                    vm.$destroy()
                }
            }
        }
        this.old = this.oldVMs = null
    },

    /**
     *  Notify parent compiler that new items
     *  have been added to the collection, it needs
     *  to re-calculate computed property dependencies.
     *  Batched to ensure it's called only once every event loop.
     */
    changed: function () {
        if (this.queued) return
        this.queued = true
        var self = this
        setTimeout(function () {
            if (!self.compiler) return
            self.compiler.parseDeps()
            self.queued = false
        }, 0)
    },

    /**
     *  Create a new child VM from a data object
     *  passing along compiler options indicating this
     *  is a v-repeat item.
     */
    buildItem: function (data, index) {

        var ctn = this.container,
            vms = this.vms,
            col = this.collection,
            el, i, ref, item, primitive, detached

        // append node into DOM first
        // so v-if can get access to parentNode
        if (data) {

            if (this.old) {
                i = indexOf(this.old, data)
            }

            if (i > -1) { // existing, reuse the old VM

                item = this.oldVMs[i]
                // mark, so it won't be destroyed
                item.$reused = true
                el = item.$el
                // don't forget to update index
                data.$index = index
                // existing VM's el can possibly be detached by v-if.
                // in that case don't insert.
                detached = !el.parentNode

            } else { // new data, need to create new VM

                el = this.el.cloneNode(true)
                // process transition info before appending
                el.vue_trans = utils.attr(el, 'transition', true)
                // wrap primitive element in an object
                if (utils.typeOf(data) !== 'Object') {
                    primitive = true
                    data = { $value: data }
                }
                // define index
                def(data, '$index', index, false, true)

            }

            ref = vms.length > index
                ? vms[index].$el
                : this.ref
            // make sure it works with v-if
            if (!ref.parentNode) ref = ref.vue_ref
            if (!detached) {
                if (i > -1) {
                    // no need to transition existing node
                    ctn.insertBefore(el, ref)
                } else {
                    // insert new node with transition
                    transition(el, 1, function () {
                        ctn.insertBefore(el, ref)
                    }, this.compiler)
                }
            } else {
                // detached by v-if
                // just move the comment ref node
                ctn.insertBefore(el.vue_ref, ref)
            }
        }

        item = item || new this.Ctor({
            el: el,
            data: data,
            compilerOptions: {
                repeat: true,
                parentCompiler: this.compiler,
                delegator: ctn
            }
        })

        if (!data) {
            // this is a forced compile for an empty collection.
            // let's remove it...
            item.$destroy()
        } else {
            vms.splice(index, 0, item)
            // for primitive values, listen for value change
            if (primitive) {
                data.__observer__.on('set', function (key, val) {
                    if (key === '$value') {
                        col[item.$index] = val
                    }
                })
            }
        }
    },

    /**
     *  Sync changes in the $repeater Array
     *  back to the represented Object
     */
    updateObject: function (data, action) {
        if (this.object && data.$key) {
            var key = data.$key,
                val = data.$value || data
            if (action > 0) { // new property
                // make key ienumerable
                delete data.$key
                def(data, '$key', key, false, true)
                this.object[key] = val
            } else {
                delete this.object[key]
            }
            this.object.__observer__.emit('set', key, val, true)
        }
    },

    reset: function (destroyAll) {
        if (this.childId) {
            delete this.vm.$[this.childId]
        }
        if (this.collection) {
            this.collection.__observer__.off('mutate', this.mutationListener)
            if (destroyAll) {
                var i = this.vms.length
                while (i--) {
                    this.vms[i].$destroy()
                }
            }
        }
        var ctn = this.container,
            handlers = ctn.vue_dHandlers
        for (var key in handlers) {
            ctn.removeEventListener(handlers[key].event, handlers[key])
        }
        ctn.vue_dHandlers = null
    },

    unbind: function () {
        this.reset(true)
    }
}