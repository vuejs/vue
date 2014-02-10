/* jshint proto:true */

var Emitter  = require('./emitter'),
    utils    = require('./utils'),

    // cache methods
    typeOf   = utils.typeOf,
    def      = utils.defProtected,
    slice    = Array.prototype.slice,

    // types
    OBJECT   = 'Object',
    ARRAY    = 'Array',

    // Array mutation methods to wrap
    methods  = ['push','pop','shift','unshift','splice','sort','reverse'],

    // fix for IE + __proto__ problem
    // define methods as inenumerable if __proto__ is present,
    // otherwise enumerable so we can loop through and manually
    // attach to array instances
    hasProto = ({}).__proto__,

    // lazy load
    ViewModel

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

/**
 *  Convenience method to remove an element in an Array
 *  This will be attached to observed Array instances
 */
function removeElement (index) {
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
}

/**
 *  Convenience method to replace an element in an Array
 *  This will be attached to observed Array instances
 */
function replaceElement (index, data) {
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

// Augment the ArrayProxy with convenience methods
def(ArrayProxy, 'remove', removeElement, !hasProto)
def(ArrayProxy, 'set', replaceElement, !hasProto)
def(ArrayProxy, 'replace', replaceElement, !hasProto)

/**
 *  Watch an Object, recursive.
 */
function watchObject (obj) {
    for (var key in obj) {
        convert(obj, key)
    }
}

/**
 *  Watch an Array, overload mutation methods
 *  and add augmentations by intercepting the prototype chain
 */
function watchArray (arr, path) {
    var observer = arr.__observer__
    if (!observer) {
        observer = new Emitter()
        def(arr, '__observer__', observer)
    }
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
function convert (obj, key) {
    var keyPrefix = key.charAt(0)
    if ((keyPrefix === '$' || keyPrefix === '_') && key !== '$index') {
        return
    }
    // emit set on bind
    // this means when an object is observed it will emit
    // a first batch of set events.
    var observer = obj.__observer__,
        values   = observer.values,
        val      = values[key] = obj[key]
    observer.emit('set', key, val)
    if (Array.isArray(val)) {
        observer.emit('set', key + '.length', val.length)
    }
    Object.defineProperty(obj, key, {
        get: function () {
            var value = values[key]
            // only emit get on tip values
            if (pub.shouldGet && typeOf(value) !== OBJECT) {
                observer.emit('get', key)
            }
            return value
        },
        set: function (newVal) {
            var oldVal = values[key]
            unobserve(oldVal, key, observer)
            values[key] = newVal
            copyPaths(newVal, oldVal)
            observer.emit('set', key, newVal)
            observe(newVal, key, observer)
        }
    })
    observe(val, key, observer)
}

/**
 *  Check if a value is watchable
 */
function isWatchable (obj) {
    ViewModel = ViewModel || require('./viewmodel')
    var type = typeOf(obj)
    return (type === OBJECT || type === ARRAY) && !(obj instanceof ViewModel)
}

/**
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
function emitSet (obj) {
    var type = typeOf(obj),
        emitter = obj && obj.__observer__
    if (type === ARRAY) {
        emitter.emit('set', 'length', obj.length)
    } else if (type === OBJECT) {
        var key, val
        for (key in obj) {
            val = obj[key]
            emitter.emit('set', key, val)
            emitSet(val)
        }
    }
}

/**
 *  Make sure all the paths in an old object exists
 *  in a new object.
 *  So when an object changes, all missing keys will
 *  emit a set event with undefined value.
 */
function copyPaths (newObj, oldObj) {
    if (typeOf(oldObj) !== OBJECT || typeOf(newObj) !== OBJECT) {
        return
    }
    var path, type, oldVal, newVal
    for (path in oldObj) {
        if (!(path in newObj)) {
            oldVal = oldObj[path]
            type = typeOf(oldVal)
            if (type === OBJECT) {
                newVal = newObj[path] = {}
                copyPaths(newVal, oldVal)
            } else if (type === ARRAY) {
                newObj[path] = []
            } else {
                newObj[path] = undefined
            }
        }
    }
}

/**
 *  walk along a path and make sure it can be accessed
 *  and enumerated in that object
 */
function ensurePath (obj, key) {
    var path = key.split('.'), sec
    for (var i = 0, d = path.length - 1; i < d; i++) {
        sec = path[i]
        if (!obj[sec]) {
            obj[sec] = {}
            if (obj.__observer__) convert(obj, sec)
        }
        obj = obj[sec]
    }
    if (typeOf(obj) === OBJECT) {
        sec = path[i]
        if (!(sec in obj)) {
            obj[sec] = undefined
            if (obj.__observer__) convert(obj, sec)
        }
    }
}

/**
 *  Observe an object with a given path,
 *  and proxy get/set/mutate events to the provided observer.
 */
function observe (obj, rawPath, observer) {
    if (!isWatchable(obj)) return
    var path = rawPath ? rawPath + '.' : '',
        ob, alreadyConverted = !!obj.__observer__
    if (!alreadyConverted) {
        def(obj, '__observer__', new Emitter())
    }
    ob = obj.__observer__
    ob.values = ob.values || utils.hash()
    observer.proxies = observer.proxies || {}
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
        emitSet(obj)
    } else {
        var type = typeOf(obj)
        if (type === OBJECT) {
            watchObject(obj)
        } else if (type === ARRAY) {
            watchArray(obj)
        }
    }
}

/**
 *  Cancel observation, turn off the listeners.
 */
function unobserve (obj, path, observer) {
    if (!obj || !obj.__observer__) return
    path = path ? path + '.' : ''
    var proxies = observer.proxies[path]
    if (!proxies) return
    obj.__observer__
        .off('get', proxies.get)
        .off('set', proxies.set)
        .off('mutate', proxies.mutate)
    observer.proxies[path] = null
}

var pub = module.exports = {

    // whether to emit get events
    // only enabled during dependency parsing
    shouldGet   : false,

    observe     : observe,
    unobserve   : unobserve,
    ensurePath  : ensurePath,
    convert     : convert,
    copyPaths   : copyPaths,
    watchArray  : watchArray
}