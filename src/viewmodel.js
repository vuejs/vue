var utils    = require('./utils'),
    Compiler = require('./compiler')

/*
 *  ViewModel exposed to the user that holds data,
 *  computed properties, event handlers
 *  and a few reserved methods
 */
function ViewModel (options) {

    // determine el
    this.$el = options.template
        ? options.template.cloneNode(true)
        : typeof options.el === 'string'
            ? document.querySelector(options.el)
            : options.el

    // possible info inherited as an each item
    this.$index  = options.index
    this.$parent = options.parentCompiler && options.parentCompiler.vm

    // compile. options are passed directly to compiler
    new Compiler(this, options)
}

var VMProto = ViewModel.prototype

/*
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
VMProto.$watch = function (key, callback) {
    var self = this
    // yield and wait for compiler to finish compiling
    setTimeout(function () {
        var binding = self.$compiler.bindings[key],
            i       = binding.deps.length,
            watcher = self.$compiler.watchers[key] = {
                refresh: function () {
                    callback(self[key])
                },
                deps: binding.deps
            }
        while (i--) {
            binding.deps[i].subs.push(watcher)
        }
    }, 0)
}

/*
 *  remove watcher
 */
VMProto.$unwatch = function (key) {
    var self = this
    setTimeout(function () {
        var watcher = self.$compiler.watchers[key]
        if (!watcher) return
        var i = watcher.deps.length, subs
        while (i--) {
            subs = watcher.deps[i].subs
            subs.splice(subs.indexOf(watcher))
        }
        self.$compiler.watchers[key] = null
    }, 0)
}

/*
 *  unbind everything, remove everything
 */
VMProto.$destroy = function () {
    this.$compiler.destroy()
    this.$compiler = null
}

module.exports = ViewModel