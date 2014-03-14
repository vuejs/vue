var Observer   = require('../observer'),
    utils      = require('../utils'),
    config     = require('../config')

/**
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
// var mutationHandlers = {

//     push: function (m) {
//         this.addItems(m.args, this.vms.length)
//     },

//     pop: function () {
//         var vm = this.vms.pop()
//         if (vm) this.removeItems([vm])
//     },

//     unshift: function (m) {
//         this.addItems(m.args)
//     },

//     shift: function () {
//         var vm = this.vms.shift()
//         if (vm) this.removeItems([vm])
//     },

//     splice: function (m) {
//         var index = m.args[0],
//             removed = m.args[1],
//             removedVMs = removed === undefined
//                 ? this.vms.splice(index)
//                 : this.vms.splice(index, removed)
//         this.removeItems(removedVMs)
//         this.addItems(m.args.slice(2), index)
//     },

//     sort: function () {
//         var vms = this.vms,
//             col = this.collection,
//             l = col.length,
//             sorted = new Array(l),
//             i, j, vm, data
//         for (i = 0; i < l; i++) {
//             data = col[i]
//             for (j = 0; j < l; j++) {
//                 vm = vms[j]
//                 if (vm.$data === data) {
//                     sorted[i] = vm
//                     break
//                 }
//             }
//         }
//         for (i = 0; i < l; i++) {
//             this.container.insertBefore(sorted[i].$el, this.ref)
//         }
//         this.vms = sorted
//     },

//     reverse: function () {
//         var vms = this.vms
//         vms.reverse()
//         for (var i = 0, l = vms.length; i < l; i++) {
//             this.container.insertBefore(vms[i].$el, this.ref)
//         }
//     }
// }

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

        // var self = this
        // this.mutationListener = function (path, arr, mutation) {
        //     if (self.lock) return
        //     var method = mutation.method
        //     mutationHandlers[method].call(self, mutation)
        //     if (method !== 'push' && method !== 'pop') {
        //         // update index
        //         var i = arr.length
        //         while (i--) {
        //             self.vms[i].$index = i
        //         }
        //     }
        // }

    },

    update: function (collection) {

        // if (
        //     collection === this.collection ||
        //     collection === this.object
        // ) return

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
        this.oldVMs = this.vms
        this.oldCollection = this.collection

        collection = this.collection = collection || []

        // If the collection is not already converted for observation,
        // we need to convert and watch it.
        if (!Observer.convert(collection)) {
            Observer.watch(collection)
        }
        // listen for collection mutation events
        // collection.__emitter__.on('mutate', this.mutationListener)

        var isObject = collection[0] && utils.typeOf(collection[0]) === 'Object'
        if (this.oldCollection) {
            this.vms = this.diff(collection, isObject)
        } else {
            this.vms = this.init(collection, isObject)
        }

        if (this.childId) {
            this.vm.$[this.childId] = this.vms
        }

        // listen for object changes and sync the repeater
        if (this.object) {
            this.object.__emitter__.on('set', this.syncRepeater)
            this.object.__emitter__.on('delete', this.deleteProp)
        }
    },

    // addItems: function (data, base) {
    //     base = base || 0
    //     for (var i = 0, l = data.length; i < l; i++) {
    //         this.build(data[i], base + i)
    //     }
    // },

    // removeItems: function (data) {
    //     var i = data.length
    //     while (i--) {
    //         data[i].$destroy()
    //     }
    // },

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
            data, wrapper,
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
            ctn = this.container,
            alias = this.arg || '$value',
            OLD_REUSED = [],
            NEW_REUSED = [],
            NEW_DATA = [],
            oldVMs = this.oldVMs,
            oldData = this.oldCollection

        // first pass, collect new reused and new created
        for (i = 0, l = newCollection.length; i < l; i++) {
            item = newCollection[i]
            if (isObject) {
                item.$index = i
                if (item[this.identifier]) { // existing
                    item.$newReuseIndex = NEW_REUSED.length++
                } else {
                    NEW_DATA.push(item)
                }
            } else {
                // non objects so we can't attach an identifier
                // oi = oldData.indexOf(item)
                oi = indexOf(oldVMs, item)
                if (oi > -1) {
                    oldVMs[oi].$newReuseIndex = NEW_REUSED.length++
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
                vm.$newReuseIndex = ni
                vm.$index = item.$index
                NEW_REUSED[ni] = vm
                OLD_REUSED.push(vm)
            } else {
                delete item[this.identifier]
                vm.$destroy()
            }
        }

        // sort reused
        var oldNext,
            newNext,
            moves = 0
        for (i = 0, l = OLD_REUSED.length; i < l; i++) {
            vm = OLD_REUSED[i]
            oldNext = OLD_REUSED[i + 1]
            newNext = NEW_REUSED[vm.$newReuseIndex + 1]
            if (newNext && oldNext !== newNext) {
                moves++
                if (!oldNext) {
                    // I was the last one. move myself to before newNext
                    ctn.insertBefore(vm.$el, newNext.$el)
                } else {
                    // move newNext to after me
                    ctn.insertBefore(newNext.$el, oldNext.$el)
                }
            }
            // delete temporary data
            delete vm.$newReuseIndex
            delete vm.$data.$newReuseIndex
            delete vm.$data.$index
        }

        // create new
        for (i = 0, l = NEW_DATA.length; i < l; i++) {
            item = NEW_DATA[i]
            ni = item.$index
            vm = this.build(item, ni, isObject)
            ref = ni >= NEW_REUSED.length
                ? this.ref
                : NEW_REUSED[ni].$el
            vm.$before(ref)
            NEW_REUSED.splice(ni, 0, vm)
        }

        //console.log(OLD_REUSED, NEW_REUSED, NEW_DATA)
        console.log('moves: ' + moves)

        console.log(NEW_REUSED.map(function (item, i) {
            return item.title + ', ' + item.$index
        }))

        return NEW_REUSED
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

    /**
     *  Create a new child VM from a data object
     *  passing along compiler options indicating this
     *  is a v-repeat item.
     */
    // build: function (data, index) {

    //     var self = this,
    //         ctn = self.container,
    //         vms = self.vms,
    //         el, Ctor, item, nonObject

    //     // get our DOM insertion reference node
    //     var ref = vms.length > index
    //         ? vms[index].$el
    //         : self.ref

    //     // new data, need to create new VM.
    //     // there's some preparation work to do...

    //     // first clone the template node
    //     el = self.el.cloneNode(true)

    //     // we have an alias, wrap the data
    //     if (self.arg) {
    //         var actual = data
    //         data = {}
    //         data[self.arg] = actual
    //     }

    //     // wrap non-object value in an object
    //     nonObject = utils.typeOf(data) !== 'Object'
    //     if (nonObject) {
    //         data = { $value: data }
    //     }
    //     // set index so vm can init with the correct
    //     // index instead of undefined
    //     data.$index = index
    //     // resolve the constructor
    //     Ctor = this.compiler.resolveComponent(el, data)
    //     // initialize the new VM
    //     item = new Ctor({
    //         el     : el,
    //         data   : data,
    //         parent : self.vm,
    //         compilerOptions: {
    //             repeat: true
    //         }
    //     })

    //     // attach an ienumerable identifier
    //     utils.defProtected(item, this.identifier, true)

    //     // for non-object values or aliased items, listen for value change
    //     // so we can sync it back to the original Array
    //     if (nonObject || self.arg) {
    //         var sync = function (val) {
    //             self.lock = true
    //             self.collection.$set(item.$index, val)
    //             self.lock = false
    //         }
    //         item.$compiler.observer.on('change:' + (self.arg || '$value'), sync)
    //     }

    //     // put the item into the VM Array
    //     vms.splice(index, 0, item)
    //     // update the index
    //     item.$index = index

    //     // Finally, DOM operations...
    //     el = item.$el

    //     if (self.compiler.init) {
    //         // do not transition on initial compile,
    //         // just manually insert.
    //         ctn.insertBefore(el, ref)
    //         item.$compiler.execHook('attached')
    //     } else {
    //         // give it some nice transition.
    //         item.$before(ref)
    //     }
    // },

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
        if (destroy && this.vms) {
            destroyVMs(this.vms)
        }
        // if (this.collection) {
        //     this.collection.__emitter__.off('mutate', this.mutationListener)
            
        // }
    },

    unbind: function () {
        this.reset(true)
    }
}

// Helpers --------------------------------------------------------------------

function indexOf (vms, obj) {
    for (var vm, i = 0, l = vms.length; i < l; i++) {
        vm = vms[i]
        if (vm.$newReuseIndex == null && vm.$value === obj) {
            return i
        }
    }
    return -1
}

/**
 *  Find an object or a wrapped data object
 *  from an Array
 */
// function indexOf (vms, obj) {
//     for (var vm, i = 0, l = vms.length; i < l; i++) {
//         vm = vms[i]
//         if (!vm.$reused && (vm.$data === obj || vm.$value === obj)) {
//             return i
//         }
//     }
//     return -1
// }

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