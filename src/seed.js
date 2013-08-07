var config          = require('./config'),
    Emitter         = require('emitter'),
    DirectiveParser = require('./directive-parser'),
    TextNodeParser  = require('./textnode-parser')

var slice           = Array.prototype.slice,
    ctrlAttr        = config.prefix + '-controller',
    eachAttr        = config.prefix + '-each'

var depsObserver    = new Emitter(),
    parsingDeps     = false

/*
 *  The main ViewModel class
 *  scans a node and parse it to populate data bindings
 */
function Seed (el, options) {

    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el         = el
    el.seed         = this
    this._bindings  = {}
    this._computed  = []

    // copy options
    options = options || {}
    for (var op in options) {
        this[op] = options[op]
    }

    // initialize the scope object
    var dataPrefix = config.prefix + '-data'
    var scope = this.scope =
            (options && options.data)
            || config.datum[el.getAttribute(dataPrefix)]
            || {}
    el.removeAttribute(dataPrefix)

    // if the passed in data is already consumed by
    // a Seed instance, make a copy from it
    if (scope.$seed) {
        scope = this.scope = scope.$dump()
    }

    // expose some useful stuff on the scope
    scope.$seed     = this
    scope.$destroy  = this._destroy.bind(this)
    scope.$dump     = this._dump.bind(this)
    scope.$index    = options.index
    scope.$parent   = options.parentSeed && options.parentSeed.scope
    scope.$refresh  = this._refreshBinding.bind(this)

    // add event listener to update corresponding binding
    // when a property is set
    this.on('set', this._updateBinding.bind(this))

    // now parse the DOM
    this._compileNode(el, true)

    // if has controller function, apply it
    var ctrlID = el.getAttribute(ctrlAttr)
    if (ctrlID) {
        el.removeAttribute(ctrlAttr)
        var factory = config.controllers[ctrlID]
        if (factory) {
            factory.call(this, this.scope)
        } else {
            console.warn('controller ' + ctrlID + ' is not defined.')
        }
    }

    // extract dependencies for computed properties
    parsingDeps = true
    this._computed.forEach(this._parseDeps.bind(this))
    delete this._computed
    parsingDeps = false
}

/*
 *  Compile a node (recursive)
 */
Seed.prototype._compileNode = function (node, root) {
    var seed = this

    if (node.nodeType === 3) { // text node

        seed._compileTextNode(node)

    } else if (node.nodeType === 1) {

        var eachExp = node.getAttribute(eachAttr),
            ctrlExp = node.getAttribute(ctrlAttr)

        if (eachExp) { // each block

            var directive = DirectiveParser.parse(eachAttr, eachExp)
            if (directive) {
                directive.el = node
                seed._bind(directive)
            }

        } else if (ctrlExp && !root) { // nested controllers

            var child = new Seed(node, {
                child: true,
                parentSeed: seed
            })
            if (node.id) {
                seed['$' + node.id] = child
            }

        } else { // normal node

            // parse if has attributes
            if (node.attributes && node.attributes.length) {
                slice.call(node.attributes).forEach(function (attr) {
                    if (attr.name === ctrlAttr) return
                    var valid = false
                    attr.value.split(',').forEach(function (exp) {
                        var directive = DirectiveParser.parse(attr.name, exp)
                        if (directive) {
                            valid = true
                            directive.el = node
                            seed._bind(directive)
                        }
                    })
                    if (valid) node.removeAttribute(attr.name)
                })
            }

            // recursively compile childNodes
            if (node.childNodes.length) {
                slice.call(node.childNodes).forEach(function (child) {
                    seed._compileNode(child)
                })
            }
        }
    }
}

/*
 *  Compile a text node
 */
Seed.prototype._compileTextNode = function (node) {
    return TextNodeParser.parse(node)
}

/*
 *  Add a directive instance to the correct binding & scope
 */
Seed.prototype._bind = function (directive) {

    directive.seed = this

    var key = directive.key,
        epr = this.eachPrefixRE,
        isEachKey = epr && epr.test(key),
        scope = this

    if (isEachKey) {
        key = directive.key = key.replace(epr, '')
    }

    if (epr && !isEachKey) {
        scope = this.parentSeed
    }

    var ownerScope = determinScope(directive, scope),
        binding =
            ownerScope._bindings[key] ||
            ownerScope._createBinding(key)

    // add directive to this binding
    binding.instances.push(directive)
    directive.binding = binding

    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(binding.value)
    }

    // set initial value
    directive.update(binding.value)

}

Seed.prototype._createBinding = function (key) {

    var binding = new Binding(this.scope[key])
    this._bindings[key] = binding

    // bind accessor triggers to scope
    var seed = this
    Object.defineProperty(this.scope, key, {
        get: function () {
            if (parsingDeps) {
                depsObserver.emit('get', binding)
            }
            seed.emit('get', key)
            return binding.isComputed
                ? binding.value()
                : binding.value
        },
        set: function (value) {
            if (value === binding.value) return
            seed.emit('set', key, value)
        }
    })

    return binding
}

Seed.prototype._updateBinding = function (key, value) {

    var binding = this._bindings[key],
        type = binding.type = typeOf(value)

    // preprocess the value depending on its type
    if (type === 'Object') {
        if (value.get) { // computed property
            this._computed.push(binding)
            binding.isComputed = true
            value = value.get
        } else { // normal object
            // TODO watchObject
        }
    } else if (type === 'Array') {
        watchArray(value)
        value.on('mutate', function () {
            binding.emitChange()
        })
    }

    binding.value = value

    // update all instances
    binding.instances.forEach(function (instance) {
        instance.update(value)
    })

    // notify dependents to refresh themselves
    binding.emitChange()
}

Seed.prototype._refreshBinding = function (key) {
    var binding = this._bindings[key]
    binding.instances.forEach(function (instance) {
        instance.refresh()
    })
}

Seed.prototype._parseDeps = function (binding) {
    depsObserver.on('get', function (dep) {
        if (!dep.dependents) {
            dep.dependents = []
        }
        dep.dependents.push.apply(dep.dependents, binding.instances)
    })
    binding.value()
    depsObserver.off('get')
}

Seed.prototype._unbind = function () {
    var unbind = function (instance) {
        if (instance.unbind) {
            instance.unbind()
        }
    }
    for (var key in this._bindings) {
        this._bindings[key].instances.forEach(unbind)
    }
}

Seed.prototype._destroy = function () {
    this._unbind()
    delete this.el.seed
    this.el.parentNode.removeChild(this.el)
    if (this.parentSeed && this.id) {
        delete this.parentSeed['$' + this.id]
    }
}

Seed.prototype._dump = function () {
    var dump = {}, val,
        subDump = function (scope) {
            return scope.$dump()
        }
    for (var key in this.scope) {
        if (key.charAt(0) !== '$') {
            val = this._bindings[key]
            if (!val) continue
            if (Array.isArray(val)) {
                dump[key] = val.map(subDump)
            } else if (typeof val !== 'function') {
                dump[key] = this._bindings[key].value
            }
        }
    }
    return dump
}

/*
 *  Binding class
 */
 function Binding (value) {
    this.value = value
    this.instances = []
    this.dependents = []
 }

 Binding.prototype.emitChange = function () {
     this.dependents.forEach(function (dept) {
         dept.refresh()
     })
 }

// Helpers --------------------------------------------------------------------

/*
 *  determinScope()
 *  determine which scope a key belongs to based on nesting symbols
 */
function determinScope (key, scope) {
    if (key.nesting) {
        var levels = key.nesting
        while (scope.parentSeed && levels--) {
            scope = scope.parentSeed
        }
    } else if (key.root) {
        while (scope.parentSeed) {
            scope = scope.parentSeed
        }
    }
    return scope
}

/* 
 *  typeOf()
 *  get accurate type of an object
 */
var OtoString = Object.prototype.toString
function typeOf (obj) {
    return OtoString.call(obj).slice(8, -1)
}

/*
 *  watchArray()
 *  augment an Array so that it emit events when mutated
 */
var arrayMutators = ['push','pop','shift','unshift','splice','sort','reverse']
var arrayAugmentations = {
    remove: function (scope) {
        this.splice(scope.$index, 1)
    },
    replace: function (index, data) {
        if (typeof index !== 'number') {
            index = index.$index
        }
        this.splice(index, 1, data)
    }
}
function watchArray (collection) {
    Emitter(collection)
    arrayMutators.forEach(function (method) {
        collection[method] = function () {
            var result = Array.prototype[method].apply(this, arguments)
            collection.emit('mutate', {
                method: method,
                args: Array.prototype.slice.call(arguments),
                result: result
            })
        }
    })
    for (var method in arrayAugmentations) {
        collection[method] = arrayAugmentations[method]
    }
}

Emitter(Seed.prototype)

module.exports = Seed