var config          = require('./config'),
    utils           = require('./utils'),
    Binding         = require('./binding'),
    DirectiveParser = require('./directive-parser'),
    TextParser      = require('./text-parser'),
    DepsParser      = require('./deps-parser'),
    eventbus        = require('./utils').eventbus

var slice           = Array.prototype.slice,
    ctrlAttr        = config.prefix + '-controller',
    eachAttr        = config.prefix + '-each'

/*
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    utils.log('\nnew Compiler instance: ', vm.$el, '\n')

    // copy options
    options = options || {}
    for (var op in options) {
        this[op] = options[op]
    }

    this.vm              = vm
    vm.$compiler         = this
    this.el              = vm.$el
    this.bindings        = {}
    this.directives      = []
    this.watchers        = {}
    this.listeners       = []
    // list of computed properties that need to parse dependencies for
    this.computed        = []
    // list of bindings that has dynamic context dependencies
    this.contextBindings = []

    // copy data if any
    var key, data = options.data
    if (data) {
        if (data instanceof vm.constructor) {
            data = utils.dump(data)
        }
        for (key in data) {
            vm[key] = data[key]
        }
    }

    // call user init
    if (options.initialize) {
        options.initialize.apply(vm, options.args || [])
    }

    // now parse the DOM
    this.compileNode(this.el, true)

    // for anything in viewmodel but not binded in DOM, create bindings for them
    for (key in vm) {
        if (vm.hasOwnProperty(key) &&
            key.charAt(0) !== '$' &&
            !this.bindings[key])
        {
            this.createBinding(key)
        }
    }

    // extract dependencies for computed properties
    if (this.computed.length) DepsParser.parse(this.computed)
    this.computed = null
    
    // extract dependencies for computed properties with dynamic context
    if (this.contextBindings.length) this.bindContexts(this.contextBindings)
    this.contextBindings = null
    
    utils.log('\ncompilation done.\n')
}

// for better compression
var CompilerProto = Compiler.prototype

/*
 *  Compile a DOM node (recursive)
 */
CompilerProto.compileNode = function (node, root) {
    var compiler = this

    if (node.nodeType === 3) { // text node

        compiler.compileTextNode(node)

    } else if (node.nodeType === 1) {

        var eachExp = node.getAttribute(eachAttr),
            ctrlExp = node.getAttribute(ctrlAttr),
            directive

        if (eachExp) { // each block

            directive = DirectiveParser.parse(eachAttr, eachExp)
            if (directive) {
                directive.el = node
                compiler.bindDirective(directive)
            }

        } else if (ctrlExp && !root) { // nested controllers

            new Compiler(node, {
                child: true,
                parentCompiler: compiler
            })

        } else { // normal node

            // parse if has attributes
            if (node.attributes && node.attributes.length) {
                var attrs = slice.call(node.attributes),
                    i = attrs.length, attr, j, valid, exps, exp
                while (i--) {
                    attr = attrs[i]
                    if (attr.name === ctrlAttr) continue
                    valid = false
                    exps = attr.value.split(',')
                    j = exps.length
                    while (j--) {
                        exp = exps[j]
                        directive = DirectiveParser.parse(attr.name, exp)
                        if (directive) {
                            valid = true
                            directive.el = node
                            compiler.bindDirective(directive)
                        }
                    }
                    if (valid) node.removeAttribute(attr.name)
                }
            }

            // recursively compile childNodes
            if (node.childNodes.length) {
                slice.call(node.childNodes).forEach(compiler.compileNode, compiler)
            }
        }
    }
}

/*
 *  Compile a text node
 */
CompilerProto.compileTextNode = function (node) {
    var tokens = TextParser.parse(node)
    if (!tokens) return
    var compiler = this,
        dirname = config.prefix + '-text',
        el, token, directive
    for (var i = 0, l = tokens.length; i < l; i++) {
        token = tokens[i]
        el = document.createTextNode('')
        if (token.key) {
            directive = DirectiveParser.parse(dirname, token.key)
            if (directive) {
                directive.el = el
                compiler.bindDirective(directive)
            }
        } else {
            el.nodeValue = token
        }
        node.parentNode.insertBefore(el, node)
    }
    node.parentNode.removeChild(node)
}

/*
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key) {
    utils.log('  created binding: ' + key)
    var binding = new Binding(this, key)
    this.bindings[key] = binding
    if (binding.isComputed) this.computed.push(binding)
    return binding
}

/*
 *  Add a directive instance to the correct binding & viewmodel
 */
CompilerProto.bindDirective = function (directive) {

    this.directives.push(directive)
    directive.compiler = this
    directive.vm       = this.vm

    var key = directive.key,
        compiler = this

    // deal with each block
    if (this.each) {
        if (key.indexOf(this.eachPrefix) === 0) {
            key = directive.key = key.replace(this.eachPrefix, '')
        } else {
            compiler = this.parentCompiler
        }
    }

    // deal with nesting
    compiler = traceOwnerCompiler(directive, compiler)
    var binding = compiler.bindings[key] || compiler.createBinding(key)

    binding.instances.push(directive)
    directive.binding = binding

    // for newly inserted sub-VMs (each items), need to bind deps
    // because they didn't get processed when the parent compiler
    // was binding dependencies.
    var i, dep
    if (binding.contextDeps) {
        i = binding.contextDeps.length
        while (i--) {
            dep = this.bindings[binding.contextDeps[i]]
            dep.subs.push(directive)
        }
    }

    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(binding.value)
    }

    // set initial value
    directive.update(binding.value)
    if (binding.isComputed) {
        directive.refresh()
    }
}

/*
 *  Process subscriptions for computed properties that has
 *  dynamic context dependencies
 */
CompilerProto.bindContexts = function (bindings) {
    var i = bindings.length, j, k, binding, depKey, dep, ins
    while (i--) {
        binding = bindings[i]
        j = binding.contextDeps.length
        while (j--) {
            depKey = binding.contextDeps[j]
            k = binding.instances.length
            while (k--) {
                ins = binding.instances[k]
                dep = ins.compiler.bindings[depKey]
                dep.subs.push(ins)
            }
        }
    }
}

/*
 *  Unbind and remove element
 */
CompilerProto.destroy = function () {
    console.log('compiler destroyed: ', this.vm.$el)
    var i, key, dir, listener, inss
    // remove all directives that are instances of external bindings
    i = this.directives.length
    while (i--) {
        dir = this.directives[i]
        if (dir.binding.compiler !== this) {
            inss = dir.binding.instances
            if (inss) inss.splice(inss.indexOf(dir), 1)
        }
        dir.unbind()
    }
    // remove all listeners on eventbus
    i = this.listeners.length
    while (i--) {
        listener = this.listeners[i]
        eventbus.off(listener.event, listener.handler)
    }
    // unbind all bindings
    for (key in this.bindings) {
        this.bindings[key].unbind()
    }
    // remove el
    this.el.parentNode.removeChild(this.el)
}

// Helpers --------------------------------------------------------------------

/*
 *  determine which viewmodel a key belongs to based on nesting symbols
 */
function traceOwnerCompiler (key, compiler) {
    if (key.nesting) {
        var levels = key.nesting
        while (compiler.parentCompiler && levels--) {
            compiler = compiler.parentCompiler
        }
    } else if (key.root) {
        while (compiler.parentCompiler) {
            compiler = compiler.parentCompiler
        }
    }
    return compiler
}

module.exports = Compiler