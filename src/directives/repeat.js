var utils      = require('../utils'),
    config     = require('../config')

module.exports = {

    bind: function () {

        this.identifier = '$repeat' + this.id

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

    },

    update: function (collection) {

        if (utils.typeOf(collection) === 'Object') {
            collection = utils.objectToArray(collection)
        }

        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.initiated && (!collection || !collection.length)) {
            this.dryBuild()
        }

        // keep reference of old data and VMs
        // so we can reuse them if possible
        this.oldVMs = this.vms
        this.oldCollection = this.collection
        collection = this.collection = collection || []

        var isObject = collection[0] && utils.typeOf(collection[0]) === 'Object'
        this.vms = this.oldCollection
            ? this.diff(collection, isObject)
            : this.init(collection, isObject)

        if (this.childId) {
            this.vm.$[this.childId] = this.vms
        }

    },

    /**
     *  Run a dry build just to collect bindings
     */
    dryBuild: function () {
        var el = this.el.cloneNode(true),
            Ctor = this.compiler.resolveComponent(el)
        new Ctor({
            el     : el,
            parent : this.vm,
            compilerOptions: {
                repeat: true
            }
        }).$destroy()
        this.initiated = true
    },

    init: function (collection, isObject) {
        var vm, vms = [],
            data,
            ref = this.ref,
            ctn = this.container,
            init = this.compiler.init
        for (var i = 0, l = collection.length; i < l; i++) {
            if (isObject) {
                data = collection[i]
                data.$index = i
            } else {
                data = { $index: i }
                data.$value = collection[i]
            }
            vm = this.build(data, i, isObject)
            vms.push(vm)
            if (init) {
                ctn.insertBefore(vm.$el, ref)
            } else {
                vm.$before(ref)
            }
        }
        return vms
    },

    /**
     *  Diff the new array with the old
     *  and determine the minimum amount of DOM manipulations
     */
    diff: function (newCollection, isObject) {

        var i, l, item, vm, oi, ni, wrapper, ref,
            ctn        = this.container,
            oldVMs     = this.oldVMs,
            alias      = this.arg || '$value',
            OLD_REUSED = [],
            NEW_REUSED = [],
            NEW_DATA   = [],
            FINAL      = []

        FINAL.length = newCollection.length

        // first pass, collect new reused and new created
        for (i = 0, l = newCollection.length; i < l; i++) {
            item = newCollection[i]
            if (isObject) {
                item.$index = i
                if (item[this.identifier]) {
                    // this piece of data is being reused.
                    // record its final position in reused vms
                    item.$newReuseIndex = NEW_REUSED.length++
                } else {
                    NEW_DATA.push(item)
                }
            } else {
                // we can't attach an identifier to primitive values
                // so have to do an indexOf
                oi = indexOf(oldVMs, item)
                if (oi > -1) {
                    // record the position on the existing vm
                    oldVMs[oi].$newReuseIndex = NEW_REUSED.length++
                    oldVMs[oi].$data.$index = i
                } else {
                    wrapper = { $index: i }
                    wrapper[alias] = item
                    NEW_DATA.push(wrapper)
                }
            }
        }

        // second pass, collect old reused and destroy unused
        for (i = 0, l = oldVMs.length; i < l; i++) {
            vm = oldVMs[i]
            item = vm.$data
            ni = isObject
                ? item.$newReuseIndex
                : vm.$newReuseIndex
            if (ni != null) {
                // this vm can be reused.
                vm.$newReuseIndex = ni
                // update the index to latest
                vm.$index = item.$index
                // the item could have had a new key
                if (item.$key && item.$key !== vm.$key) {
                    vm.$key = item.$key
                }
                NEW_REUSED[ni] = vm
                FINAL[vm.$index] = vm
                vm.$oldReuseIndex = OLD_REUSED.length
                OLD_REUSED.push(vm)
            } else {
                // this one can be destroyed.
                delete item[this.identifier]
                vm.$destroy()
            }
        }

        // sort reused
        var targetNext,
            currentNext,
            moves = 0

        i = NEW_REUSED.length
        while (i--) {
            vm = NEW_REUSED[i]
            item = vm.$data
            currentNext = vm.$el.nextSibling.vue_vm
            targetNext = NEW_REUSED[i + 1]
            if (currentNext !== targetNext) {
                moves++
                if (!targetNext) {
                    ctn.insertBefore(vm.$el, this.ref)
                } else {
                    ctn.insertBefore(vm.$el, targetNext.$el)
                }
            }
            delete vm.$newReuseIndex
            delete vm.$oldReuseIndex
            delete item.$newReuseIndex
            delete item.$index
            delete item.$key
        }

        // create new
        for (i = 0, l = NEW_DATA.length; i < l; i++) {
            item = NEW_DATA[i]
            ni = item.$index
            vm = this.build(item, ni, isObject)
            ref = ni === FINAL.length - 1
                ? this.ref
                : ni === 0
                    ? NEW_REUSED.length
                        ? NEW_REUSED[0].$el
                        : this.ref
                    : FINAL[ni - 1].$el.nextSibling
            vm.$before(ref)
            FINAL[ni] = vm
        }

        console.log('moves: ' + moves)

        return FINAL
    },

    build: function (data, index, isObject) {

        var el = this.el.cloneNode(true),
            Ctor = this.compiler.resolveComponent(el, data),
            vm = new Ctor({
                el: el,
                data: data,
                parent: this.vm,
                compilerOptions: {
                    repeat: true
                }
            })

        // attach an ienumerable identifier
        utils.defProtected(data, this.identifier, true)
        vm.$index = index

        if (!isObject || this.arg) {
            var self = this,
                sync = function (val) {
                    self.lock = true
                    self.collection.$set(vm.$index, val)
                    self.lock = false
                }
            vm.$compiler.observer.on('change:' + (this.arg || '$value'), sync)
        }

        return vm

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

    unbind: function () {
        if (this.childId) {
            delete this.vm.$[this.childId]
        }
        if (this.vms) {
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
        if (vm.$newReuseIndex == null && vm.$value === obj) {
            return i
        }
    }
    return -1
}