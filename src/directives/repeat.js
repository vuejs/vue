var Observer   = require('../observer'),
    utils      = require('../utils'),
    config     = require('../config'),
    def        = utils.defProtected,
    ViewModel // lazy def to avoid circular dependency

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

        // extract child VM information, if any
        ViewModel = ViewModel || require('../viewmodel')
        this.Ctor = this.Ctor || ViewModel
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
        this.old = this.collection
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
            if (!init) this.changed()
        }

        // destroy unused old VMs
        if (oldVMs) destroyVMs(oldVMs)
        this.old = this.oldVMs = null
    },

    addItems: function (data, base) {
        base = base || 0
        for (var i = 0, l = data.length; i < l; i++) {
            var vm = this.build(data[i], base + i)
            this.updateObject(vm, 1)
        }
    },

    removeItems: function (data) {
        var i = data.length
        while (i--) {
            data[i].$destroy()
            this.updateObject(data[i], -1)
        }
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
        utils.nextTick(function () {
            if (!self.compiler) return
            self.compiler.parseDeps()
            self.queued = false
        })
    },

    /**
     *  Run a dry build just to collect bindings
     */
    dryBuild: function () {
        new this.Ctor({
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
            el, oldIndex, existing, item, nonObject

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
        oldIndex = self.old ? indexOf(self.old, data) : -1
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
            // wrap non-object value in an object
            nonObject = utils.typeOf(data) !== 'Object'
            if (nonObject) {
                data = { $value: data }
            }
            // set index so vm can init with the correct
            // index instead of undefined
            data.$index = index
            // initialize the new VM
            item = new self.Ctor({
                el     : el,
                data   : data,
                parent : self.vm,
                compilerOptions: {
                    repeat: true
                }
            })
            // for non-object values, listen for value change
            // so we can sync it back to the original Array
            if (nonObject) {
                item.$compiler.observer.on('change:$value', function (val) {
                    self.lock = true
                    self.collection.set(item.$index, val)
                    self.lock = false
                })
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

        return item
    },

    /**
     *  Convert an object to a repeater Array
     *  and make sure changes in the object are synced to the repeater
     */
    convertObject: function (object) {

        if (this.object) {
            this.object.__emitter__.off('set', this.updateRepeater)
        }

        this.object = object
        var collection = object.$repeater || objectToArray(object)
        if (!object.$repeater) {
            def(object, '$repeater', collection)
        }

        var self = this
        this.updateRepeater = function (key, val) {
            if (key.indexOf('.') === -1) {
                var i = self.vms.length, item
                while (i--) {
                    item = self.vms[i]
                    if (item.$key === key) {
                        if (item.$data !== val && item.$value !== val) {
                            if ('$value' in item) {
                                item.$value = val
                            } else {
                                item.$data = val
                            }
                        }
                        break
                    }
                }
            }
        }

        object.__emitter__.on('set', this.updateRepeater)
        return collection
    },

    /**
     *  Sync changes from the $repeater Array
     *  back to the represented Object
     */
    updateObject: function (vm, action) {
        var obj = this.object
        if (obj && vm.$key) {
            var key = vm.$key,
                val = vm.$value || vm.$data
            if (action > 0) { // new property
                obj[key] = val
                Observer.convertKey(obj, key)
            } else {
                delete obj[key]
            }
            obj.__emitter__.emit('set', key, val, true)
        }
    },

    reset: function (destroy) {
        if (this.childId) {
            delete this.vm.$[this.childId]
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
 *  Convert an Object to a v-repeat friendly Array
 */
function objectToArray (obj) {
    var res = [], val, data
    for (var key in obj) {
        val = obj[key]
        data = utils.typeOf(val) === 'Object'
            ? val
            : { $value: val }
        def(data, '$key', key)
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

/**
 *  Destroy some VMs, yeah.
 */
function destroyVMs (vms) {
    var i = vms.length, vm
    while (i--) {
        vm = vms[i]
        if (vm.$reused) {
            vm.$reused = false
        } else {
            vm.$destroy()
        }
    }
}