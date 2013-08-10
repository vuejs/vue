var utils    = require('./utils'),
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
    this.inspect(utils.getNestedValue(seed.scope, path))
    this.def(seed.scope, path)
    this.instances = []
    this.subs = []
    this.deps = []
}

var BindingProto = Binding.prototype

/*
 *  Pre-process a passed in value based on its type
 */
BindingProto.inspect = function (value) {
    var type = utils.typeOf(value),
        self = this
    // preprocess the value depending on its type
    if (type === 'Object') {
        if (value.get || value.set) { // computed property
            self.isComputed = true
        }
    } else if (type === 'Array') {
        utils.watchArray(value)
        value.on('mutate', function () {
            self.pub()
        })
    }
    self.value = value
}

/*
 *  Define getter/setter for this binding on scope
 *  recursive for nested objects
 */
BindingProto.def = function (scope, path) {
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
BindingProto.update = function (value) {
    this.inspect(value)
    var i = this.instances.length
    while (i--) {
        this.instances[i].update(value)
    }
    this.pub()
}

/*
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].refresh()
    }
}

module.exports = Binding