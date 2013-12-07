/* jshint proto:true */

var Emitter  = require('./emitter'),
    utils    = require('./utils'),
    depsOb   = require('./deps-parser').observer,

    // cache methods
    typeOf   = utils.typeOf,
    def      = utils.defProtected,
    slice    = Array.prototype.slice,

    // Array mutation methods to wrap
    methods  = ['push','pop','shift','unshift','splice','sort','reverse'],

    // fix for IE + __proto__ problem
    // define methods as inenumerable if __proto__ is present,
    // otherwise enumerable so we can loop through and manually
    // attach to array instances
    hasProto = ({}).__proto__

// The proxy prototype to replace the __proto__ of
// an observed array
var ArrayProxy = Object.create(Array.prototype)

// Define mutation interceptors so we can emit the mutation info
methods.forEach(function (method) {
    def(ArrayProxy, method, function () {
        var result = Array.prototype[method].apply(this, arguments)
        this.__observer__.emit('mutate', this.__observer__.path, this, {
            method: method,
            args: slice.call(arguments),
            result: result
        })
        return result
    }, !hasProto)
})

// Augment it with several convenience methods
var extensions = {
    remove: function (index) {
        if (typeof index === 'function') {
            var i = this.length,
                removed = []
            while (i--) {
                if (index(this[i])) {
                    removed.push(this.splice(i, 1)[0])
                }
            }
            return removed.reverse()
        } else {
            if (typeof index !== 'number') {
                index = this.indexOf(index)
            }
            if (index > -1) {
                return this.splice(index, 1)[0]
            }
        }
    },
    replace: function (index, data) {
        if (typeof index === 'function') {
            var i = this.length,
                replaced = [],
                replacer
            while (i--) {
                replacer = index(this[i])
                if (replacer !== undefined) {
                    replaced.push(this.splice(i, 1, replacer)[0])
                }
            }
            return replaced.reverse()
        } else {
            if (typeof index !== 'number') {
                index = this.indexOf(index)
            }
            if (index > -1) {
                return this.splice(index, 1, data)[0]
            }
        }
    }
}

for (var method in extensions) {
    def(ArrayProxy, method, extensions[method], !hasProto)
}

/**
 *  Watch an object based on type
 */
function watch (obj, path, observer) {
    var type = typeOf(obj)
    if (type === 'Object') {
        watchObject(obj, path, observer)
    } else if (type === 'Array') {
        watchArray(obj, path, observer)
    }
}

/**
 *  Watch an Object, recursive.
 */
function watchObject (obj, path, observer) {
    for (var key in obj) {
        var keyPrefix = key.charAt(0)
        if (keyPrefix !== '$' && keyPrefix !== '_') {
            bind(obj, key, path, observer)
        }
    }
}

/**
 *  Watch an Array, overload mutation methods
 *  and add augmentations by intercepting the prototype chain
 */
function watchArray (arr, path, observer) {
    def(arr, '__observer__', observer)
    observer.path = path
    if (hasProto) {
        arr.__proto__ = ArrayProxy
    } else {
        for (var key in ArrayProxy) {
            def(arr, key, ArrayProxy[key])
        }
    }
}

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
function bind (obj, key, path, observer) {
    var val       = obj[key],
        watchable = isWatchable(val),
        values    = observer.values,
        fullKey   = (path ? path + '.' : '') + key
    values[fullKey] = val
    // emit set on bind
    // this means when an object is observed it will emit
    // a first batch of set events.
    observer.emit('set', fullKey, val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        get: function () {
            // only emit get on tip values
            if (depsOb.active && !watchable) {
                observer.emit('get', fullKey)
            }
            return values[fullKey]
        },
        set: function (newVal) {
            values[fullKey] = newVal
            ensurePaths(key, newVal, values)
            observer.emit('set', fullKey, newVal)
            watch(newVal, fullKey, observer)
        }
    })
    watch(val, fullKey, observer)
}

/**
 *  Check if a value is watchable
 */
function isWatchable (obj) {
    var type = typeOf(obj)
    return type === 'Object' || type === 'Array'
}

/**
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
function emitSet (obj, observer, set) {
    if (typeOf(obj) === 'Array') {
        set('length', obj.length)
    } else {
        var key, val, values = observer.values
        for (key in observer.values) {
            val = values[key]
            set(key, val)
        }
    }
}

/**
 *  Sometimes when a binding is found in the template, the value might
 *  have not been set on the VM yet. To ensure computed properties and
 *  dependency extraction can work, we have to create a dummy value for
 *  any given path.
 */
function ensurePaths (key, val, paths) {
    key += '.'
    for (var path in paths) {
        if (!path.indexOf(key)) {
            ensurePath(val, path.replace(key, ''))
        }
    }
}

/**
 *  walk along a path and make sure it can be accessed
 *  and enumerated in that object
 */
function ensurePath (obj, key) {
    if (typeOf(obj) !== 'Object') return
    var path = key.split('.'), sec
    for (var i = 0, d = path.length - 1; i < d; i++) {
        sec = path[i]
        if (!obj[sec]) obj[sec] = {}
        obj = obj[sec]
    }
    if (typeOf(obj) === 'Object') {
        sec = path[i]
        if (!(sec in obj)) obj[sec] = undefined
    }
}

module.exports = {

    // used in v-repeat
    watchArray: watchArray,
    ensurePath: ensurePath,
    ensurePaths: ensurePaths,

    /**
     *  Observe an object with a given path,
     *  and proxy get/set/mutate events to the provided observer.
     */
    observe: function (obj, rawPath, observer) {
        if (isWatchable(obj)) {
            var path = rawPath + '.',
                ob, alreadyConverted = !!obj.__observer__
            if (!alreadyConverted) {
                def(obj, '__observer__', new Emitter())
            }
            ob = obj.__observer__
            ob.values = ob.values || utils.hash()
            var proxies = observer.proxies[path] = {
                get: function (key) {
                    observer.emit('get', path + key)
                },
                set: function (key, val) {
                    observer.emit('set', path + key, val)
                },
                mutate: function (key, val, mutation) {
                    // if the Array is a root value
                    // the key will be null
                    var fixedPath = key ? path + key : rawPath
                    observer.emit('mutate', fixedPath, val, mutation)
                    // also emit set for Array's length when it mutates
                    var m = mutation.method
                    if (m !== 'sort' && m !== 'reverse') {
                        observer.emit('set', fixedPath + '.length', val.length)
                    }
                }
            }
            ob
                .on('get', proxies.get)
                .on('set', proxies.set)
                .on('mutate', proxies.mutate)
            if (alreadyConverted) {
                emitSet(obj, ob, proxies.set)
            } else {
                watch(obj, null, ob)
            }
        }
    },

    /**
     *  Cancel observation, turn off the listeners.
     */
    unobserve: function (obj, path, observer) {
        if (!obj || !obj.__observer__) return
        path = path + '.'
        var proxies = observer.proxies[path]
        obj.__observer__
            .off('get', proxies.get)
            .off('set', proxies.set)
            .off('mutate', proxies.mutate)
        observer.proxies[path] = null
    }
}