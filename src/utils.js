var config        = require('./config'),
    Emitter       = require('emitter'),
    toString      = Object.prototype.toString,
    aproto        = Array.prototype,
    templates     = {},
    VMs           = {}

var arrayAugmentations = {
    remove: function (index) {
        if (typeof index !== 'number') index = index.$index
        this.splice(index, 1)
    },
    replace: function (index, data) {
        if (typeof index !== 'number') index = index.$index
        this.splice(index, 1, data)
    }
}

var arrayMutators = ['push','pop','shift','unshift','splice','sort','reverse'],
    mutationInterceptors = {}

arrayMutators.forEach(function (method) {
    mutationInterceptors[method] = function () {
        var result = aproto[method].apply(this, arguments)
        this.emit('mutate', {
            method: method,
            args: aproto.slice.call(arguments),
            result: result
        })
    }
})

/*
 *  get accurate type of an object
 */
function typeOf (obj) {
    return toString.call(obj).slice(8, -1)
}

/*
 *  Recursively dump stuff...
 */
function dump (val) {
    var type = typeOf(val)
    if (type === 'Array') {
        return val.map(dump)
    } else if (type === 'Object') {
        if (val.get) { // computed property
            return val.get()
        } else { // object / child viewmodel
            var ret = {}, prop
            for (var key in val) {
                prop = val[key]
                if (typeof prop !== 'function' &&
                    val.hasOwnProperty(key) &&
                    key.charAt(0) !== '$' &&
                    !isContextual(key, val))
                {
                    ret[key] = dump(prop)
                }
            }
            return ret
        }
    } else if (type !== 'Function') {
        return val
    }
}

/*
 *  check if a value belongs to a contextual binding
 *  because we do NOT want to dump those.
 */
function isContextual (key, vm) {
    if (!vm.$compiler) return false
    var binding = vm.$compiler.bindings[key]
    return binding.isContextual
}

module.exports = {

    typeOf: typeOf,
    dump: dump,

    /*
     *  shortcut for JSON.stringify-ing a dumped value
     */
    serialize: function (val) {
        return JSON.stringify(dump(val))
    },

    /*
     *  Get a value from an object based on a path array
     */
    getNestedValue: function (obj, path) {
        if (path.length === 1) return obj[path[0]]
        var i = 0
        /* jshint boss: true */
        while (obj[path[i]]) {
            obj = obj[path[i]]
            i++
        }
        return i === path.length ? obj : undefined
    },

    /*
     *  augment an Array so that it emit events when mutated
     */
    watchArray: function (collection) {
        Emitter(collection)
        var method, i = arrayMutators.length
        while (i--) {
            method = arrayMutators[i]
            collection[method] = mutationInterceptors[method]
        }
        for (method in arrayAugmentations) {
            collection[method] = arrayAugmentations[method]
        }
    },

    getTemplate: function (id) {
        var el = templates[id]
        if (!el && el !== null) {
            var selector = '[' + config.prefix + '-template="' + id + '"]'
            el = templates[id] = document.querySelector(selector)
            if (el) el.parentNode.removeChild(el)
        }
        return el
    },

    registerVM: function (id, VM) {
        VMs[id] = VM
    },

    getVM: function (id) {
        return VMs[id]
    },

    log: function () {
        if (config.debug) console.log.apply(console, arguments)
        return this
    },
    
    warn: function() {
        if (config.debug) console.warn.apply(console, arguments)
        return this
    }
}