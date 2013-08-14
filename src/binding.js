var utils    = require('./utils'),
    observer = require('./deps-parser').observer,
    def      = Object.defineProperty

/*
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (compiler, key) {
    this.compiler = compiler
    this.vm = compiler.vm
    this.key = key
    var path = key.split('.')
    this.inspect(utils.getNestedValue(compiler.vm, path))
    this.def(compiler.vm, path)
    this.instances = []
    this.subs = []
    this.deps = []
}

var BindingProto = Binding.prototype

/*
 *  Pre-process a passed in value based on its type
 */
BindingProto.inspect = function (value) {
    var type = utils.typeOf(value)
    // preprocess the value depending on its type
    if (type === 'Object') {
        if (value.get) {
            var l = Object.keys(value).length
            if (l === 1 || (l === 2 && value.set)) {
                this.isComputed = true // computed property
                this.rawGet = value.get
                value.get = value.get.bind(this.vm)
                if (value.set) value.set = value.set.bind(this.vm)
            }
        }
    } else if (type === 'Array') {
        value = utils.dump(value)
        utils.watchArray(value)
        value.on('mutate', this.pub.bind(this))
    }
    this.value = value
}

/*
 *  Define getter/setter for this binding on viewmodel
 *  recursive for nested objects
 */
BindingProto.def = function (viewmodel, path) {
    var key = path[0]
    if (path.length === 1) {
        // here we are! at the end of the path!
        // define the real value accessors.
        def(viewmodel, key, {
            get: (function () {
                if (observer.isObserving) {
                    observer.emit('get', this)
                }
                return this.isComputed
                    ? this.value.get({
                        el: this.compiler.el,
                        vm: this.compiler.vm
                    })
                    : this.value
            }).bind(this),
            set: (function (value) {
                if (this.isComputed) {
                    // computed properties cannot be redefined
                    // no need to call binding.update() here,
                    // as dependency extraction has taken care of that
                    if (this.value.set) {
                        this.value.set(value)
                    }
                } else if (value !== this.value) {
                    this.update(value)
                }
            }).bind(this)
        })
    } else {
        // we are not there yet!!!
        // create an intermediate object
        // which also has its own getter/setters
        var nestedObject = viewmodel[key]
        if (!nestedObject) {
            nestedObject = {}
            def(viewmodel, key, {
                get: (function () {
                    return this
                }).bind(nestedObject),
                set: (function (value) {
                    // when the nestedObject is given a new value,
                    // copy everything over to trigger the setters
                    for (var prop in value) {
                        this[prop] = value[prop]
                    }
                }).bind(nestedObject)
            })
        }
        // recurse
        this.def(nestedObject, path.slice(1))
    }
}

/*
 *  Process the value, then trigger updates on all dependents
 */
BindingProto.update = function (value) {
    this.inspect(value)
    var i = this.instances.length
    while (i--) {
        this.instances[i].update(this.value)
    }
    this.pub()
}

/*
 *  -- computed property only --    
 *  Force all instances to re-evaluate themselves
 */
BindingProto.refresh = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].refresh()
    }
}

/*
 *  Unbind the binding, remove itself from all of its dependencies
 */
BindingProto.unbind = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].unbind()
    }
    i = this.deps.length
    var subs
    while (i--) {
        subs = this.deps[i].subs
        subs.splice(subs.indexOf(this), 1)
    }
    if (Array.isArray(this.value)) this.value.off('mutate')
    this.vm = this.compiler = this.pubs =
    this.subs = this.instances = this.deps = null
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