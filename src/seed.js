var config        = require('./config'),
    controllers   = require('./controllers'),
    bindingParser = require('./binding')

var map  = Array.prototype.map,
    each = Array.prototype.forEach

// lazy init
var ctrlAttr,
    eachAttr

function Seed (el, data, options) {

    // refresh
    ctrlAttr = config.prefix + '-controller'
    eachAttr = config.prefix + '-each'

    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el         = el
    this.scope      = data
    this._bindings  = {}
    this._options   = options || {}

    var key, dataCopy = {}
    for (key in data) {
        dataCopy[key] = data[key]
    }

    // if has controller
    var ctrlID = el.getAttribute(ctrlAttr),
        controller = null
    if (ctrlID) {
        controller = controllers[ctrlID]
        el.removeAttribute(ctrlAttr)
        if (!controller) throw new Error('controller ' + ctrlID + ' is not defined.')
    }

    // process nodes for directives
    this._compileNode(el, true)

    // copy in methods from controller
    if (controller) {
        controller.call(null, this.scope, this)
    }

    // initialize all variables by invoking setters
    for (key in dataCopy) {
        this.scope[key] = dataCopy[key]
    }

}

Seed.prototype._compileNode = function (node, root) {
    var self = this

    if (node.nodeType === 3) {
        // text node
        self._compileTextNode(node)
    } else if (node.attributes && node.attributes.length) {
        var eachExp = node.getAttribute(eachAttr),
            ctrlExp = node.getAttribute(ctrlAttr)
        if (eachExp) {
            // each block
            var binding = bindingParser.parse(eachAttr, eachExp)
            if (binding) {
                self._bind(node, binding)
            }
        } else if (!ctrlExp || root) { // skip nested controllers
            // normal node
            // clone attributes because the list can change
            var attrs = map.call(node.attributes, function (attr) {
                return {
                    name: attr.name,
                    expressions: attr.value.split(',')
                }
            })
            attrs.forEach(function (attr) {
                var valid = false
                attr.expressions.forEach(function (exp) {
                    var binding = bindingParser.parse(attr.name, exp)
                    if (binding) {
                        valid = true
                        self._bind(node, binding)
                    }
                })
                if (valid) node.removeAttribute(attr.name)
            })
            if (node.childNodes.length) {
                each.call(node.childNodes, function (child) {
                    self._compileNode(child)
                })
            }
        }
    }

}

Seed.prototype._compileTextNode = function (node) {
    return node
}

Seed.prototype._bind = function (node, bindingInstance) {

    bindingInstance.seed = this
    bindingInstance.el = node

    var key = bindingInstance.key,
        epr = this._options.eachPrefixRE,
        isEachKey = epr && epr.test(key),
        seed = this
    // TODO make scope chain work on nested controllers
    if (isEachKey) {
        key = key.replace(epr, '')
    } else if (epr) {
        seed = this._options.parentSeed
    }

    var binding = seed._bindings[key] || seed._createBinding(key)

    // add directive to this binding
    binding.instances.push(bindingInstance)

    // invoke bind hook if exists
    if (bindingInstance.bind) {
        bindingInstance.bind(binding.value)
    }

}

Seed.prototype._createBinding = function (key) {

    var binding = {
        value: null,
        instances: []
    }

    this._bindings[key] = binding

    // bind accessor triggers to scope
    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.instances.forEach(function (instance) {
                instance.update(value)
            })
        }
    })

    return binding
}

Seed.prototype.dump = function () {
    var data = {}
    for (var key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}

Seed.prototype.destroy = function () {
    for (var key in this._bindings) {
        this._bindings[key].instances.forEach(unbind)
        ;delete this._bindings[key]
    }
    this.el.parentNode.removeChild(this.el)
    function unbind (instance) {
        if (instance.unbind) {
            instance.unbind()
        }
    }
}

module.exports = Seed