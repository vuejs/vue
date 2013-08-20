var Emitter         = require('emitter'),
    Observer        = require('./observer'),
    config          = require('./config'),
    utils           = require('./utils'),
    Binding         = require('./binding'),
    DirectiveParser = require('./directive-parser'),
    TextParser      = require('./text-parser'),
    DepsParser      = require('./deps-parser')

var slice           = Array.prototype.slice

// late bindings
var vmAttr, eachAttr

/*
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    utils.log('\nnew Compiler instance: ', vm.$el, '\n')

    // need to refresh this everytime we compile
    eachAttr = config.prefix + '-each'
    vmAttr   = config.prefix + '-viewmodel'

    // copy options
    options = options || {}
    for (var op in options) {
        this[op] = options[op]
    }

    this.vm              = vm
    vm.$compiler         = this
    this.el              = vm.$el
    this.bindings        = {}
    this.observer        = new Emitter()
    this.directives      = []
    this.watchers        = {}
    // list of computed properties that need to parse dependencies for
    this.computed        = []
    // list of bindings that has dynamic context dependencies
    this.contextBindings = []

    // setup observer
    this.setupObserver()

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
    if (options.init) {
        options.init.apply(vm, options.args || [])
    }

    // check for async compilation (vm.$wait())
    if (vm.__wait__) {
        var self = this
        this.observer.on('ready', function () {
            self.observer.off('ready')
            vm.__wait__ = null
            self.compile()
        })
    } else {
        this.compile()
    }
    
}

var CompilerProto = Compiler.prototype

/*
 *  Actually parse the DOM nodes for directives, create bindings,
 *  and parse dependencies afterwards. For the dependency extraction to work,
 *  this has to happen after all user-set values are present in the VM.
 */
CompilerProto.compile = function () {
    var key,
        vm = this.vm,
        computed = this.computed,
        contextBindings = this.contextBindings
    // parse the DOM
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
    if (computed.length) DepsParser.parse(computed)
    this.computed = null
    
    // extract dependencies for computed properties with dynamic context
    if (contextBindings.length) this.bindContexts(contextBindings)
    this.contextBindings = null
    
    utils.log('\ncompilation done.\n')
}

/*
 *  Setup observer.
 *  The observer listens for get/set/mutate events on all VM
 *  values/objects and trigger corresponding binding updates.
 */
CompilerProto.setupObserver = function () {

    var bindings = this.bindings,
        observer = this.observer,
        compiler = this

    // a hash to hold event proxies for each root level key
    // so they can be referenced and removed later
    observer.proxies = {}

    // add own listeners which trigger binding updates
    observer
        .on('get', function (key) {
            if (DepsParser.observer.isObserving) {
                DepsParser.observer.emit('get', bindings[key])
            }
        })
        .on('set', function (key, val) {
            if (!bindings[key]) compiler.createBinding(key)
            bindings[key].update(val)
        })
        .on('mutate', function (key) {
            bindings[key].refresh()
        })
}

/*
 *  Compile a DOM node (recursive)
 */
CompilerProto.compileNode = function (node, root) {

    var compiler = this, i, j

    if (node.nodeType === 3) { // text node

        compiler.compileTextNode(node)

    } else if (node.nodeType === 1) {

        var eachExp = node.getAttribute(eachAttr),
            vmExp   = node.getAttribute(vmAttr),
            directive

        if (eachExp) { // each block

            directive = DirectiveParser.parse(eachAttr, eachExp)
            if (directive) {
                directive.el = node
                compiler.bindDirective(directive)
            }

        } else if (vmExp && !root) { // nested ViewModels

            var ChildVM = utils.getVM(vmExp)
            if (ChildVM) {
                new ChildVM({
                    el: node,
                    child: true,
                    parentCompiler: compiler
                })
            }

        } else { // normal node

            // parse if has attributes
            if (node.attributes && node.attributes.length) {
                var attrs = slice.call(node.attributes),
                    attr, valid, exps, exp
                i = attrs.length
                while (i--) {
                    attr = attrs[i]
                    if (attr.name === vmAttr) continue
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
                var nodes = slice.call(node.childNodes)
                for (i = 0, j = nodes.length; i < j; i++) {
                    this.compileNode(nodes[i])
                }
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

    var bindings = this.bindings,
        binding = new Binding(this, key)
    bindings[key] = binding

    var baseKey = key.split('.')[0]
    if (binding.root) {
        // this is a root level binding. we need to define getter/setters for it.
        this.define(baseKey, binding)
    } else {
        // TODO create placeholder objects
        if (!bindings[baseKey]) {
            // this is a nested value binding, but the binding for its root
            // has not been created yet. We better create that one too.
            this.createBinding(baseKey)
        }
    }

    return binding
}

/*
 *  Defines the getter/setter for a top-level binding on the VM
 *  and observe the initial value
 */
CompilerProto.define = function (key, binding) {

    utils.log('    defined root binding: ' + key)

    var compiler = this,
        vm = this.vm,
        value = binding.value = vm[key] // save the value before redefinening it

    if (utils.typeOf(value) === 'Object' && value.get) {
        binding.isComputed = true
        binding.rawGet = value.get
        value.get = value.get.bind(vm)
        this.computed.push(binding)
    } else {
        Observer.observe(value, key, compiler.observer) // start observing right now
    }

    Object.defineProperty(vm, key, {
        enumerable: true,
        get: function () {
            if (!binding.isComputed && !binding.value.__observer__) {
                // only emit non-computed, non-observed values
                // because these are the cleanest dependencies
                compiler.observer.emit('get', key)
            }
            return binding.isComputed
                ? binding.value.get({
                    el: compiler.el,
                    vm: compiler.vm
                })
                : binding.value
        },
        set: function (value) {
            if (binding.isComputed) {
                if (binding.value.set) {
                    binding.value.set(value)
                }
            } else if (value !== binding.value) {
                // unwatch the old value!
                Observer.unobserve(binding.value, key, compiler.observer)
                // now watch the new one instead
                Observer.observe(value, key, compiler.observer)
                binding.value = value
                compiler.observer.emit('set', key, value)
            }
        }
    })
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
    utils.log('compiler destroyed: ', this.vm.$el)
    var i, key, dir, inss,
        directives = this.directives,
        bindings = this.bindings,
        el = this.el
    // remove all directives that are instances of external bindings
    i = directives.length
    while (i--) {
        dir = directives[i]
        if (dir.binding.compiler !== this) {
            inss = dir.binding.instances
            if (inss) inss.splice(inss.indexOf(dir), 1)
        }
        dir.unbind()
    }
    // unbind all bindings
    for (key in bindings) {
        bindings[key].unbind()
    }
    // remove el
    el.parentNode.removeChild(el)
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