var Compiler = require('./compiler')

/*
 *  ViewModel exposed to the user that holds data,
 *  computed properties, event handlers
 *  and a few reserved methods
 */
function ViewModel (options) {
    // just compile. options are passed directly to compiler
    new Compiler(this, options)
}

var VMProto = ViewModel.prototype

/*
 *  Convenience function to set an actual nested value
 *  from a flat key string. Used in directives.
 */
VMProto.$set = function (key, value) {
    var path = key.split('.'),
        obj = getTargetVM(this, path)
    if (!obj) return
    for (var d = 0, l = path.length - 1; d < l; d++) {
        obj = obj[path[d]]
    }
    obj[path[d]] = value
}

/*
 *  The function for getting a key
 *  which will go up along the prototype chain of the bindings
 *  Used in exp-parser.
 */
VMProto.$get = function (key) {
    var path = key.split('.'),
        obj = getTargetVM(this, path),
        vm = obj
    if (!obj) return
    for (var d = 0, l = path.length; d < l; d++) {
        obj = obj[path[d]]
    }
    if (typeof obj === 'function') obj = obj.bind(vm)
    return obj
}

/*
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
VMProto.$watch = function (key, callback) {
    this.$compiler.observer.on('change:' + key, callback)
}

/*
 *  remove watcher
 */
VMProto.$unwatch = function (key, callback) {
    this.$compiler.observer.off('change:' + key, callback)
}

/*
 *  unbind everything, remove everything
 */
VMProto.$destroy = function () {
    this.$compiler.destroy()
    this.$compiler = null
}

/*
 *  If a VM doesn't contain a path, go up the prototype chain
 *  to locate the ancestor that has it.
 */
function getTargetVM (vm, path) {
    var baseKey = path[0],
        binding = vm.$compiler.bindings[baseKey]
    return binding
        ? binding.compiler.vm
        : null
}

module.exports = ViewModel