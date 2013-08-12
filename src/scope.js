var utils   = require('./utils')

function Scope (seed, options) {
    this.$seed     = seed
    this.$el       = seed.el
    this.$index    = options.index
    this.$parent   = options.parentSeed && options.parentSeed.scope
    this.$watchers = {}
}

var ScopeProto = Scope.prototype

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
            watcher = self.$watchers[key] = {
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
        var watcher = self.$watchers[key]
        if (!watcher) return
        var i = watcher.deps.length, subs
        while (i--) {
            subs = watcher.deps[i].subs
            subs.splice(subs.indexOf(watcher))
        }
        delete self.$watchers[key]
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