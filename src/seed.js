var Emitter         = require('emitter'),
    config          = require('./config'),
    DirectiveParser = require('./directive-parser')

var slice           = Array.prototype.slice,
    ancestorKeyRE   = /\^/g,
    ctrlAttr        = config.prefix + '-controller',
    eachAttr        = config.prefix + '-each'

function Seed (el, options) {

    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el         = el
    el.seed         = this
    this._bindings  = {}

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

    scope.$seed     = this
    scope.$destroy  = this._destroy.bind(this)
    scope.$dump     = this._dump.bind(this)
    scope.$on       = this.on.bind(this)
    scope.$emit     = this.emit.bind(this)
    scope.$index    = options.index
    scope.$parent   = options.parentSeed && options.parentSeed.scope

    // revursively process nodes for directives
    this._compileNode(el, true)

    // if has controller, apply it
    var ctrlID = el.getAttribute(ctrlAttr)
    if (ctrlID) {
        el.removeAttribute(ctrlAttr)
        var controller = config.controllers[ctrlID]
        if (controller) {
            controller.call(this, this.scope)
        } else {
            console.warn('controller ' + ctrlID + ' is not defined.')
        }
    }
}

Seed.prototype._compileNode = function (node, root) {
    var self = this

    if (node.nodeType === 3) { // text node

        self._compileTextNode(node)

    } else {

        var eachExp = node.getAttribute(eachAttr),
            ctrlExp = node.getAttribute(ctrlAttr)

        if (eachExp) { // each block

            var binding = DirectiveParser.parse(eachAttr, eachExp)
            if (binding) {
                self._bind(node, binding)
            }

        } else if (ctrlExp && !root) { // nested controllers

            var id = node.id,
                seed = new Seed(node, {
                    child: true,
                    parentSeed: self
                })
            if (id) {
                self['$' + id] = seed
            }

        } else { // normal node

            // parse if has attributes
            if (node.attributes && node.attributes.length) {
                slice.call(node.attributes).forEach(function (attr) {
                    if (attr.name === ctrlAttr) return
                    var valid = false
                    attr.value.split(',').forEach(function (exp) {
                        var binding = DirectiveParser.parse(attr.name, exp)
                        if (binding) {
                            valid = true
                            self._bind(node, binding)
                        }
                    })
                    if (valid) node.removeAttribute(attr.name)
                })
            }

            // recursively compile childNodes
            if (node.childNodes.length) {
                slice.call(node.childNodes).forEach(function (child) {
                    self._compileNode(child)
                })
            }
        }
    }
}

Seed.prototype._compileTextNode = function (node) {
    return node
}

Seed.prototype._bind = function (node, directive) {

    directive.el   = node
    directive.seed = this

    var key = directive.key,
        snr = this.eachPrefixRE,
        isEachKey = snr && snr.test(key),
        scopeOwner = this

    if (isEachKey) {
        key = key.replace(snr, '')
    }

    // handle scope nesting
    if (snr && !isEachKey) {
        scopeOwner = this.parentSeed
    } else {
        var ancestors = key.match(ancestorKeyRE),
            root      = key.charAt(0) === '$'
        if (ancestors) {
            key = key.replace(ancestorKeyRE, '')
            var levels = ancestors.length
            while (scopeOwner.parentSeed && levels--) {
                scopeOwner = scopeOwner.parentSeed
            }
        } else if (root) {
            key = key.slice(1)
            while (scopeOwner.parentSeed) {
                scopeOwner = scopeOwner.parentSeed
            }
        }
    }

    directive.key = key

    // computed properties
    if (directive.deps) {
        directive.deps.forEach(function (dep) {
            console.log(dep)
        })
    }

    var binding = scopeOwner._bindings[key] || scopeOwner._createBinding(key)

    // add directive to this binding
    binding.instances.push(directive)

    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(binding.value)
    }

    // set initial value
    if (binding.value) {
        directive.update(binding.value)
    }

}

Seed.prototype._createBinding = function (key) {

    var binding = {
        value: this.scope[key],
        changed: false,
        instances: []
    }

    this._bindings[key] = binding

    // bind accessor triggers to scope
    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            if (value === binding) return
            binding.changed = true
            binding.value = value
            binding.instances.forEach(function (instance) {
                instance.update(value)
            })
        }
    })

    return binding
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
            } else {
                dump[key] = this._bindings[key].value
            }
        }
    }
    return dump
}

Emitter(Seed.prototype)

module.exports = Seed