var utils   = require('./utils')

/*
 *  Scope is the ViewModel/whatever exposed to the user
 *  that holds data, computed properties, event handlers
 *  and a few reserved methods
 */
function Scope (seed, options) {
    this.$seed     = seed
    this.$el       = seed.el
    this.$index    = options.index
    this.$parent   = options.parentSeed && options.parentSeed.scope
    this.$seed._watchers = {}
}

var ScopeProto = Scope.prototype

/*
 *  register a listener that will be broadcasted from the global event bus
 */
ScopeProto.$on = function (event, handler) {
    utils.eventbus.on(event, handler)
    this.$seed._listeners.push({
        event: event,
        handler: handler
    })
}

/*
 *  remove the registered listener
 */
ScopeProto.$off = function (event, handler) {
    utils.eventbus.off(event, handler)
    var listeners = this.$seed._listeners,
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
 *  watch a key on the scope for changes
 *  fire callback with new value
 */
ScopeProto.$watch = function (key, callback) {
    var self = this
    // yield and wait for seed to finish compiling
    setTimeout(function () {
        var scope   = self.$seed.scope,
            binding = self.$seed._bindings[key],
            i       = binding.deps.length,
            watcher = self.$seed._watchers[key] = {
                refresh: function () {
                    callback(scope[key])
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
ScopeProto.$unwatch = function (key) {
    var self = this
    setTimeout(function () {
        var watcher = self.$seed._watchers[key]
        if (!watcher) return
        var i = watcher.deps.length, subs
        while (i--) {
            subs = watcher.deps[i].subs
            subs.splice(subs.indexOf(watcher))
        }
        delete self.$seed._watchers[key]
    }, 0)
}

/*
 *  load data into scope
 */
ScopeProto.$load = function (data) {
    for (var key in data) {
        this[key] = data[key]
    }
}

/*
 *  Dump a copy of current scope data, excluding seed-exposed properties.
 *  @param key (optional): key for the value to dump
 */
ScopeProto.$dump = function (key) {
    var bindings = this.$seed._bindings
    return utils.dump(key ? bindings[key].value : this)
}

/*
 *  stringify the result from $dump
 */
ScopeProto.$serialize = function (key) {
    return JSON.stringify(this.$dump(key))
}

/*
 *  unbind everything, remove everything
 */
ScopeProto.$destroy = function () {
    this.$seed._destroy()
}

module.exports = Scope