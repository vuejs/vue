var Observer   = require('../observer'),
    utils      = require('../utils'),
    config     = require('../config')

/**
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        this.addItems(m.args, this.vms.length)
    },

    pop: function () {
        var vm = this.vms.pop()
        if (vm) this.removeItems([vm])
    },

    unshift: function (m) {
        this.addItems(m.args)
    },

    shift: function () {
        var vm = this.vms.shift()
        if (vm) this.removeItems([vm])
    },

    splice: function (m) {
        var index = m.args[0],
            removed = m.args[1],
            removedVMs = removed === undefined
                ? this.vms.splice(index)
                : this.vms.splice(index, removed)
        this.removeItems(removedVMs)
        this.addItems(m.args.slice(2), index)
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

        var el   = this.el,
            ctn  = this.container = el.parentNode

        // extract child Id, if any
        this.childId = this.compiler.eval(utils.attr(el, 'ref'))

        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment(config.prefix + '-repeat-' + this.key)
        ctn.insertBefore(this.ref, el)
        ctn.removeChild(el)

        this.initiated = false
        this.collection = null
        this.vms = null

        var self = this
        this.mutationListener = function (path, arr, mutation) {
            if (self.lock) return
            var method = mutation.method
            mutationHandlers[method].call(self, mutation)
            if (method !== 'push' && method !== 'pop') {
                // update index
                var i = arr.length
                while (i--) {
                    self.vms[i].$index = i
                }
            }
        }

    },

    update: function (collection) {

        if (
            collection === this.collection ||
            collection === this.object
        ) return

        if (utils.typeOf(collection) === 'Object') {
            collection = this.convertObject(collection)
        }

        this.reset()
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.initiated && (!collection || !collection.length)) {
            this.dryBuild()
        }

        // keep reference of old data and VMs
        // so we can reuse them if possible
        var oldVMs = this.oldVMs = this.vms

        collection = this.collection = collection || []
        this.vms = []
        if (this.childId) {
            this.vm.$[this.childId] = this.vms
        }

        // If the collection is not already converted for observation,
        // we need to convert and watch it.
        if (!Observer.convert(collection)) {
            Observer.watch(collection)
        }
        // listen for collection mutation events
        collection.__emitter__.on('mutate', this.mutationListener)

        // create new VMs and append to DOM
        if (collection.length) {
            collection.forEach(this.build, this)
        }

        // listen for object changes and sync the repeater
        if (this.object) {
            this.object.__emitter__.on('set', this.syncRepeater)
            this.object.__emitter__.on('delete', this.deleteProp)
        }

        // destroy unused old VMs
        if (oldVMs) destroyVMs(oldVMs)
        this.oldVMs = null
    },

    addItems: function (data, base) {
        base = base || 0
        for (var i = 0, l = data.length; i < l; i++) {
            this.build(data[i], base + i)
        }
    },

    removeItems: function (data) {
        var i = data.length
        while (i--) {
            data[i].$destroy()
        }
    },

    /**
     *  Run a dry build just to collect bindings
     */
    dryBuild: function () {
        var Ctor = this.compiler.resolveComponent(this.el)
        new Ctor({
            el     : this.el.cloneNode(true),
            parent : this.vm,
            compilerOptions: {
                repeat: true
            }
        }).$destroy()
        this.initiated = true
    },

    /**
     *  Create a new child VM from a data object
     *  passing along compiler options indicating this
     *  is a v-repeat item.
     */
    build: function (data, index) {

        var self = this,
            ctn = self.container,
            vms = self.vms,
            el, Ctor, oldIndex, existing, item, nonObject

        // get our DOM insertion reference node
        var ref = vms.length > index
            ? vms[index].$el
            : self.ref
        
        // if reference VM is detached by v-if,
        // use its v-if ref node instead
        if (!ref.parentNode) {
            ref = ref.vue_if_ref
        }

        // check if data already exists in the old array
        oldIndex = self.oldVMs ? indexOf(self.oldVMs, data) : -1
        existing = oldIndex > -1

        if (existing) {

            // existing, reuse the old VM
            item = self.oldVMs[oldIndex]
            // mark, so it won't be destroyed
            item.$reused = true

        } else {

            // new data, need to create new VM.
            // there's some preparation work to do...

            // first clone the template node
            el = self.el.cloneNode(true)
            // then we provide the parentNode for v-if
            // so that it can still work in a detached state
            el.vue_if_parent = ctn
            el.vue_if_ref = ref

            // we have an alias, wrap the data
            if (self.arg) {
                var actual = data
                data = {}
                data[self.arg] = actual
            }

            // wrap non-object value in an object
            nonObject = utils.typeOf(data) !== 'Object'
            if (nonObject) {
                data = { $value: data }
            }
            // set index so vm can init with the correct
            // index instead of undefined
            data.$index = index
            // resolve the constructor
            Ctor = this.compiler.resolveComponent(el, data)
            // initialize the new VM
            item = new Ctor({
                el     : el,
                data   : data,
                parent : self.vm,
                compilerOptions: {
                    repeat: true
                }
            })
            // for non-object values or aliased items, listen for value change
            // so we can sync it back to the original Array
            if (nonObject || self.arg) {
                var sync = function (val) {
                    self.lock = true
                    self.collection.$set(item.$index, val)
                    self.lock = false
                }
                item.$compiler.observer.on('change:' + (self.arg || '$value'), sync)
            }

        }

        // put the item into the VM Array
        vms.splice(index, 0, item)
        // update the index
        item.$index = index

        // Finally, DOM operations...
        el = item.$el
        if (existing) {
            // we simplify need to re-insert the existing node
            // to its new position. However, it can possibly be
            // detached by v-if. in that case we insert its v-if
            // ref node instead.
            ctn.insertBefore(el.parentNode ? el : el.vue_if_ref, ref)
        } else {
            if (el.vue_if !== false) {
                if (self.compiler.init) {
                    // do not transition on initial compile,
                    // just manually insert.
                    ctn.insertBefore(el, ref)
                    item.$compiler.execHook('attached')
                } else {
                    // give it some nice transition.
                    item.$before(ref)
                }
            }
        }
    },

    /**
     *  Convert an object to a repeater Array
     *  and make sure changes in the object are synced to the repeater
     */
    convertObject: function (object) {

        this.object = object
        var self = this,
            collection = utils.objectToArray(object)

        this.syncRepeater = function (key, val) {
            if (key in object) {
                var vm = self.findVMByKey(key)
                if (vm) {
                    // existing vm, update property
                    if (vm.$data !== val && vm.$value !== val) {
                        if ('$value' in vm) {
                            vm.$value = val
                        } else {
                            vm.$data = val
                        }
                    }
                } else {
                    // new property added!
                    var data
                    if (utils.typeOf(val) === 'Object') {
                        data = val
                        data.$key = key
                    } else {
                        data = {
                            $key: key,
                            $value: val
                        }
                    }
                    collection.push(data)
                }
            }
        }

        this.deleteProp = function (key) {
            var i = self.findVMByKey(key).$index
            collection.splice(i, 1)
        }

        return collection
    },

    findVMByKey: function (key) {
        var i = this.vms.length, vm
        while (i--) {
            vm = this.vms[i]
            if (vm.$key === key) {
                return vm
            }
        }
    },

    reset: function (destroy) {
        if (this.childId) {
            delete this.vm.$[this.childId]
        }
        if (this.object) {
            this.object.__emitter__.off('set', this.updateRepeater)
        }
        if (this.collection) {
            this.collection.__emitter__.off('mutate', this.mutationListener)
            if (destroy) {
                destroyVMs(this.vms)
            }
        }
    },

    unbind: function () {
        this.reset(true)
    }
}

// Helpers --------------------------------------------------------------------

/**
 *  Find an object or a wrapped data object
 *  from an Array
 */
function indexOf (vms, obj) {
    for (var vm, i = 0, l = vms.length; i < l; i++) {
        vm = vms[i]
        if (!vm.$reused && (vm.$data === obj || vm.$value === obj)) {
            return i
        }
    }
    return -1
}

/**
 *  Destroy some VMs, yeah.
 */
function destroyVMs (vms) {
    var i = vms.length, vm
    while (i--) {
        vm = vms[i]
        if (vm.$reused) {
            delete vm.$reused
        } else {
            vm.$destroy()
        }
    }
}