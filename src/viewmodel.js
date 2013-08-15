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

    // compile
    new Compiler(this, options)
}

var VMProto = ViewModel.prototype

/*
 *  register a listener that will be broadcasted from the global event bus
 */
VMProto.$on = function (event, handler) {
    utils.eventbus.on(event, handler)
    this.$compiler.listeners.push({
        event: event,
        handler: handler
    })
}

/*
 *  remove the registered listener
 */
VMProto.$off = function (event, handler) {
    utils.eventbus.off(event, handler)
    var listeners = this.$compiler.listeners,
        i = listeners.length, listener
    while (i--) {
        listener = listeners[i]
        if (listener.event === event && listener.handler === handler) {
            listeners.splice(i, 1)
            break
        }
    }
}

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
 *  load data into viewmodel
 */
VMProto.$load = function (data) {
    for (var key in data) {
        this[key] = data[key]
    }
}

/*
 *  Dump a copy of current viewmodel data, excluding compiler-exposed properties.
 *  @param key (optional): key for the value to dump
 */
VMProto.$dump = function (key) {
    var bindings = this.$compiler.bindings
    return utils.dump(key ? bindings[key].value : this)
}

/*
 *  stringify the result from $dump
 */
VMProto.$serialize = function (key) {
    return JSON.stringify(this.$dump(key))
}

/*
 *  unbind everything, remove everything
 */
VMProto.$destroy = function () {
    this.$compiler.destroy()
    this.$compiler = null
}

module.exports = ViewModel