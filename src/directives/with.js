var utils = require('../utils')

module.exports = {

    bind: function () {

        var self      = this,
            childKey  = self.arg,
            parentKey = self.key,
            compiler  = self.compiler,
            owner     = self.binding.compiler

        if (compiler === owner) {
            this.alone = true
            return
        }

        if (childKey) {
            if (!compiler.bindings[childKey]) {
                compiler.createBinding(childKey)
            }
            // sync changes on child back to parent
            compiler.observer.on('change:' + childKey, function (val) {
                if (compiler.init) return
                if (!self.lock) {
                    self.lock = true
                    utils.nextTick(function () {
                        self.lock = false
                    })
                }
                owner.vm.$set(parentKey, val)
            })
        }
    },

    update: function (value) {
        // sync from parent
        if (!this.alone && !this.lock) {
            if (this.arg) {
                this.vm.$set(this.arg, value)
            } else {
                this.vm.$data = value
            }
        }
    }

}

// var utils = require('../utils')

// module.exports = {

//     bind: function () {
//         if (this.el.vue_vm) {
//             this.subVM = this.el.vue_vm
//             var compiler = this.subVM.$compiler
//             if (this.arg && !compiler.bindings[this.arg]) {
//                 compiler.createBinding(this.arg)
//             }
//         } else if (this.isEmpty) {
//             this.build()
//         }
//     },

//     update: function (value, init) {
//         var vm = this.subVM,
//             key = this.arg || '$data'
//         if (!vm) {
//             this.build(value)
//         } else if (!this.lock && vm[key] !== value) {
//             vm[key] = value
//         }
//         if (init) {
//             // watch after first set
//             this.watch()
//             // The v-with directive can have multiple expressions,
//             // and we want to make sure when the ready hook is called
//             // on the subVM, all these clauses have been properly set up.
//             // So this is a hack that sniffs whether we have reached
//             // the last expression. We hold off the subVM's ready hook
//             // until we are actually ready.
//             if (this.last) {
//                 this.subVM.$compiler.execHook('ready')
//             }
//         }
//     },

//     build: function (value) {
//         var data = value
//         if (this.arg) {
//             data = {}
//             data[this.arg] = value
//         }
//         var Ctor = this.compiler.resolveComponent(this.el, data)
//         this.subVM = new Ctor({
//             el     : this.el,
//             data   : data,
//             parent : this.vm,
//             compilerOptions: {
//                 // it is important to delay the ready hook
//                 // so that when it's called, all `v-with` wathcers
//                 // would have been set up.
//                 delayReady: !this.last
//             }
//         })
//         // mark that this VM is created by v-with
//         utils.defProtected(this.subVM, '$with', true)
//     },

//     /**
//      *  For inhertied keys, need to watch
//      *  and sync back to the parent
//      */
//     watch: function () {
//         if (!this.arg) return
//         var self    = this,
//             key     = self.key,
//             ownerVM = self.binding.compiler.vm
//         this.subVM.$compiler.observer.on('change:' + this.arg, function (val) {
//             if (!self.lock) {
//                 self.lock = true
//                 utils.nextTick(function () {
//                     self.lock = false
//                 })
//             }
//             ownerVM.$set(key, val)
//         })
//     },

//     unbind: function () {
//         // all watchers are turned off during destroy
//         // so no need to worry about it
//         if (this.subVM.$with) {
//             this.subVM.$destroy()
//         }
//     }

// }