var Emitter         = require('emitter'),
    Observer        = require('./observer'),
    config          = require('./config'),
    utils           = require('./utils'),
    Binding         = require('./binding'),
    DirectiveParser = require('./directive-parser'),
    TextParser      = require('./text-parser'),
    DepsParser      = require('./deps-parser'),
    slice           = Array.prototype.slice,
    vmAttr,
    eachAttr

/*
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    // need to refresh this everytime we compile
    eachAttr = config.prefix + '-each'
    vmAttr   = config.prefix + '-viewmodel'

    // copy options
    options = options || {}
    for (var key in options) {
        this[key] = options[key]
    }

    // copy data if any
    var data = options.data
    if (data) {
        for (key in data) {
            vm[key] = data[key]
        }
    }

    // determine el
    var tpl = options.template,
        el  = options.el
    el  = typeof el === 'string'
        ? document.querySelector(el)
        : el
    if (el) {
        var tplExp = tpl || el.getAttribute(config.prefix + '-template')
        if (tplExp) {
            el.innerHTML = utils.getTemplate(tplExp) || ''
            el.removeAttribute(config.prefix + '-template')
        }
    } else if (tpl) {
        var template = utils.getTemplate(tpl)
        if (template) {
            var tplHolder = document.createElement('div')
            tplHolder.innerHTML = template
            el = tplHolder.childNodes[0]
        }
    }

    utils.log('\nnew VM instance: ', el, '\n')

    // set stuff on the ViewModel
    vm.$el       = el
    vm.$compiler = this
    vm.$parent   = options.parentCompiler && options.parentCompiler.vm

    // now for the compiler itself...
    this.vm         = vm
    this.el         = el
    this.directives = []

    // Store things during parsing to be processed afterwards,
    // because we want to have created all bindings before
    // observing values / parsing dependencies.
    var observables = this.observables = []
    var computed = this.computed = [] // computed props to parse deps from
    var ctxBindings = this.contextBindings = [] // computed props with dynamic context
    var arrays = this.arrays = []

    // prototypal inheritance of bindings
    var parent = this.parentCompiler
    this.bindings = parent
        ? Object.create(parent.bindings)
        : {}
    this.rootCompiler = parent
        ? getRoot(parent)
        : this

    // setup observer
    this.setupObserver()

    // call user init. this will capture some initial values.
    if (options.init) {
        options.init.apply(vm, options.args || [])
    }

    // now parse the DOM, during which we will create necessary bindings
    // and bind the parsed directives
    this.compileNode(this.el, true)

    // for anything in viewmodel but not binded in DOM, also create bindings for them
    for (key in vm) {
        if (vm.hasOwnProperty(key) &&
            key.charAt(0) !== '$' &&
            !this.bindings.hasOwnProperty(key))
        {
            this.createBinding(key)
        }
    }

    // observe root values so that they emit events when
    // their nested values change (for an Object)
    // or when they mutate (for an Array)
    var i = observables.length, binding
    while (i--) {
        binding = observables[i]
        Observer.observe(binding.value, binding.key, this.observer)
    }
    // emit set events for array lengths
    i = arrays.length
    while (i--) {
        binding = arrays[i]
        this.observer.emit('set', binding.key + '.length', binding.value.length)
    }
    // extract dependencies for computed properties
    if (computed.length) DepsParser.parse(computed)
    // extract dependencies for computed properties with dynamic context
    if (ctxBindings.length) this.bindContexts(ctxBindings)
    // unset these no longer needed stuff
    this.observables = this.computed = this.contextBindings = this.arrays = null
}

var CompilerProto = Compiler.prototype

/*
 *  Setup observer.
 *  The observer listens for get/set/mutate events on all VM
 *  values/objects and trigger corresponding binding updates.
 */
CompilerProto.setupObserver = function () {

    var bindings = this.bindings,
        observer = this.observer = new Emitter(),
        depsOb   = DepsParser.observer

    // a hash to hold event proxies for each root level key
    // so they can be referenced and removed later
    observer.proxies = {}

    // add own listeners which trigger binding updates
    observer
        .on('get', function (key) {
            console.log('get ' + key)
            if (bindings[key] && depsOb.isObserving) {
                depsOb.emit('get', bindings[key])
            }
        })
        .on('set', function (key, val) {
            console.log('set ' + key)
            if (bindings[key]) bindings[key].update(val)
        })
        .on('mutate', function (key) {
            console.log('mutate ' + key)
            if (bindings[key]) bindings[key].pub()
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

            node.removeAttribute(vmAttr)
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
 *  Add a directive instance to the correct binding & viewmodel
 */
CompilerProto.bindDirective = function (directive) {

    this.directives.push(directive)
    directive.compiler = this
    directive.vm       = this.vm

    var key = directive.key,
        baseKey = key.split('.')[0],
        compiler = traceOwnerCompiler(directive, this)

    var binding
    if (compiler.vm.hasOwnProperty(baseKey)) {
        // if the value is present in the target VM, we create the binding on its compiler
        binding = compiler.bindings.hasOwnProperty(key)
            ? compiler.bindings[key]
            : compiler.createBinding(key)
    } else {
        // due to prototypal inheritance of bindings, if a key doesn't exist here,
        // it doesn't exist in the whole prototype chain. Therefore in that case
        // we create the new binding at the root level.
        binding = compiler.bindings[key] || this.rootCompiler.createBinding(key)
    }

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
    if (binding.value) {
        directive.update(binding.value)
    }
    if (binding.isComputed) {
        directive.refresh()
    }
}

/*
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key) {
    
    utils.log('  created binding: ' + key)

    // make sure the key exists in the object so it can be observed
    // by the Observer!
    this.ensurePath(key)

    var bindings = this.bindings,
        binding = new Binding(this, key)
    bindings[key] = binding

    if (binding.root) {
        // this is a root level binding. we need to define getter/setters for it.
        this.define(key, binding)
    } else {
        var parentKey = key.slice(0, key.lastIndexOf('.'))
        if (!bindings.hasOwnProperty(parentKey)) {
            // this is a nested value binding, but the binding for its parent
            // has not been created yet. We better create that one too.
            this.createBinding(parentKey)
        }
    }
    return binding
}

/*
 *  Sometimes when a binding is found in the template, the value might
 *  have not been set on the VM yet. To ensure computed properties and
 *  dependency extraction can work, we have to create a dummy value for
 *  any given path.
 */
CompilerProto.ensurePath = function (key) {
    var path = key.split('.'), sec,
        i = 0, depth = path.length - 1,
        obj = this.vm
    while (i < depth) {
        sec = path[i]
        if (!obj[sec]) obj[sec] = {}
        obj = obj[sec]
        i++
    }
    obj[path[i]] = obj[path[i]] || undefined
}

/*
 *  Defines the getter/setter for a root-level binding on the VM
 *  and observe the initial value
 */
CompilerProto.define = function (key, binding) {

    utils.log('    defined root binding: ' + key)

    var compiler = this,
        vm = this.vm,
        value = binding.value = vm[key], // save the value before redefinening it
        type = utils.typeOf(value)

    if (type === 'Object') {
        if (value.get) {// computed property
            binding.isComputed = true
            binding.rawGet = value.get
            value.get = value.get.bind(vm)
            this.computed.push(binding)
        } else {
            // observe objects later, becase there might be more keys
            // to be added to it. we also want to emit all the set events
            // when values are available.
            this.observables.push(binding)
        }
    } else if (type === 'Array') {
        // observe arrays right now, because they will be needed in
        // sd-each directives.
        Observer.observe(value, key, compiler.observer)
        // we need to later emit set event for the arrays length.
        this.arrays.push(binding)
    }

    Object.defineProperty(vm, key, {
        enumerable: true,
        get: function () {
            var value = binding.value
            if ((!binding.isComputed && (value === undefined || !value.__observer__)) || Array.isArray(value)) {
                // only emit non-computed, non-observed (tip) values, or Arrays.
                // because these are the cleanest dependencies
                compiler.observer.emit('get', key)
            }
            return binding.isComputed
                ? binding.value.get({
                    el: compiler.el,
                    vm: compiler.vm,
                    item: compiler.each
                        ? compiler.vm[compiler.eachPrefix]
                        : null
                })
                : binding.value
        },
        set: function (value) {
            if (binding.isComputed) {
                if (binding.value.set) {
                    binding.value.set(value)
                }
            } else if (value !== binding.value) {
                // unwatch the old value
                Observer.unobserve(binding.value, key, compiler.observer)
                // set new value
                binding.value = value
                compiler.observer.emit('set', key, value)
                // now watch the new value, which in turn emits 'set'
                // for all its nested values
                Observer.observe(value, key, compiler.observer)
            }
        }
    })
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
    var i, key, dir, inss, binding,
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
    // unbind/unobserve all own bindings
    for (key in bindings) {
        if (bindings.hasOwnProperty(key)) {
            binding = bindings[key]
            if (binding.root) {
                Observer.unobserve(binding.value, binding.key, this.observer)
            }
            binding.unbind()
        }
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

/*
 *  shorthand for getting root compiler
 */
function getRoot (compiler) {
    return traceOwnerCompiler({ root: true }, compiler)
}

module.exports = Compiler