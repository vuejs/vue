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
 *  unwatch a key
 */
VMProto.$unwatch = function (key, callback) {
    // workaround here
    // since the emitter module checks callback existence
    // by checking the length of arguments
    var args = ['change:' + key],
        ob = this.$compiler.observer
    if (callback) args.push(callback)
    ob.off.apply(ob, args)
}

/*
 *  unbind everything, remove everything
 */
VMProto.$destroy = function () {
    this.$compiler.destroy()
    this.$compiler = null
}

/*
 *  broadcast an event to all child VMs recursively.
 */
VMProto.$broadcast = function () {
    var children = this.$compiler.childCompilers,
        i = children.length,
        child
    while (i--) {
        child = children[i]
        child.emitter.emit.apply(child.emitter, arguments)
        child.vm.$broadcast.apply(child.vm, arguments)
    }
}

/*
 *  emit an event that propagates all the way up to parent VMs.
 */
VMProto.$emit = function () {
    var parent = this.$compiler.parentCompiler
    if (parent) {
        parent.emitter.emit.apply(parent.emitter, arguments)
        parent.vm.$emit.apply(parent.vm, arguments)
    }
}

/*
 *  listen for a broadcasted/emitted event
 */
VMProto.$on = function () {
    var emitter = this.$compiler.emitter
    emitter.on.apply(emitter, arguments)
}

/*
 *  stop listening
 */
VMProto.$off = function () {
    var emitter = this.$compiler.emitter
    emitter.off.apply(emitter, arguments)
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