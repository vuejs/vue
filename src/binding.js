var Emitter  = require('emitter'),
    observer = require('./deps-parser').observer,
    def      = Object.defineProperty

/*
 *  Binding class.
 *
 *  each property on the scope has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (seed, key) {
    this.seed = seed
    this.key  = key
    var path = key.split('.')
    this.set(getNestedValue(seed.scope, path))
    this.def(seed.scope, path)
    this.instances = []
    this.subs = []
    this.deps = []
}

/*
 *  Pre-process a passed in value based on its type
 */
Binding.prototype.set = function (value) {
    var type = typeOf(value),
        self = this
    // preprocess the value depending on its type
    if (type === 'Object') {
        if (value.get || value.set) { // computed property
            self.isComputed = true
        }
    } else if (type === 'Array') {
        watchArray(value)
        value.on('mutate', function () {
            self.pub()
        })
    }
    this.value = value
}

/*
 *  Define getter/setter for this binding on scope
 *  recursive for nested objects
 */
Binding.prototype.def = function (scope, path) {
    var self = this,
        key = path[0]
    if (path.length === 1) {
        // here we are! at the end of the path!
        // define the real value accessors.
        def(scope, key, {
            get: function () {
                if (observer.isObserving) {
                    observer.emit('get', self)
                }
                return self.isComputed
                    ? self.value.get()
                    : self.value
            },
            set: function (value) {
                if (self.isComputed) {
                    // computed properties cannot be redefined
                    // no need to call binding.update() here,
                    // as dependency extraction has taken care of that
                    if (self.value.set) {
                        self.value.set(value)
                    }
                } else if (value !== self.value) {
                    self.value = value
                    self.update(value)
                }
            }
        })
    } else {
        // we are not there yet!!!
        // create an intermediate subscope
        // which also has its own getter/setters
        var subScope = scope[key]
        if (!subScope) {
            subScope = {}
            def(scope, key, {
                get: function () {
                    return subScope
                },
                set: function (value) {
                    // when the subScope is given a new value,
                    // copy everything over to trigger the setters
                    for (var prop in value) {
                        subScope[prop] = value[prop]
                    }
                }
            })
        }
        // recurse
        this.def(subScope, path.slice(1))
    }
}

/*
 *  Process the value, then trigger updates on all dependents
 */
Binding.prototype.update = function (value) {
    this.set(value)
    this.instances.forEach(function (instance) {
        instance.update(value)
    })
    this.pub()
}

/*
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
Binding.prototype.pub = function () {
    this.subs.forEach(function (dept) {
        dept.refresh()
    })
}

// Helpers --------------------------------------------------------------------

/*
 *  Get a value from an object based on a path array
 */
function getNestedValue (scope, path) {
    if (path.length === 1) return scope[path[0]]
    var i = 0
    /* jshint boss: true */
    while (scope[path[i]]) {
        scope = scope[path[i]]
        i++
    }
    return i === path.length ? scope : undefined
}

/*
 *  get accurate type of an object
 */
var toString = Object.prototype.toString
function typeOf (obj) {
    return toString.call(obj).slice(8, -1)
}

/*
 *  augment an Array so that it emit events when mutated
 */
var aproto = Array.prototype,
    arrayMutators = ['push','pop','shift','unshift','splice','sort','reverse'],
    arrayAugmentations = {
        remove: function (index) {
            if (typeof index !== 'number') index = index.$index
            this.splice(index, 1)
        },
        replace: function (index, data) {
            if (typeof index !== 'number') index = index.$index
            this.splice(index, 1, data)
        }
    }

function watchArray (collection) {
    Emitter(collection)
    arrayMutators.forEach(function (method) {
        collection[method] = function () {
            var result = aproto[method].apply(this, arguments)
            collection.emit('mutate', {
                method: method,
                args: aproto.slice.call(arguments),
                result: result
            })
        }
    })
    for (var method in arrayAugmentations) {
        collection[method] = arrayAugmentations[method]
    }
}

module.exports = Binding