var Emitter     = require('./emitter'),
    Observer    = require('./observer'),
    config      = require('./config'),
    utils       = require('./utils'),
    Binding     = require('./binding'),
    Directive   = require('./directive'),
    TextParser  = require('./text-parser'),
    DepsParser  = require('./deps-parser'),
    ExpParser   = require('./exp-parser'),
    slice       = Array.prototype.slice,
    log         = utils.log,
    vmAttr,
    repeatAttr,
    partialAttr,
    transitionAttr,
    preAttr

/*
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    refreshPrefix()

    var compiler = this

    // extend options
    options = compiler.options = options || {}
    utils.extend(compiler, options.compilerOptions)

    // initialize element
    compiler.setupElement(options)
    log('\nnew VM instance:', compiler.el.tagName, '\n')

    // copy scope properties to vm
    var scope = options.scope
    if (scope) utils.extend(vm, scope, true)

    compiler.vm  = vm
    vm.$compiler = compiler
    vm.$el       = compiler.el

    // keep track of directives and expressions
    // so they can be unbound during destroy()
    compiler.dirs = []
    compiler.exps = []
    compiler.childCompilers = [] // keep track of child compilers
    compiler.emitter = new Emitter() // the emitter used for nested VM communication

    // Store things during parsing to be processed afterwards,
    // because we want to have created all bindings before
    // observing values / parsing dependencies.
    var observables = compiler.observables = [],
        computed    = compiler.computed    = [],
        ctxBindings = compiler.ctxBindings = []

    // prototypal inheritance of bindings
    var parent = compiler.parentCompiler
    compiler.bindings = parent
        ? Object.create(parent.bindings)
        : {}
    compiler.rootCompiler = parent
        ? getRoot(parent)
        : compiler

    // setup observer
    compiler.setupObserver()

    // call user init. this will capture some initial values.
    if (options.init) {
        options.init.apply(vm, options.args || [])
    }

    // create bindings for keys set on the vm by the user
    var key, keyPrefix
    for (key in vm) {
        keyPrefix = key.charAt(0)
        if (keyPrefix !== '$' && keyPrefix !== '_') {
            compiler.createBinding(key)
        }
    }

    // for repeated items, create an index binding
    if (compiler.repeat) {
        vm[compiler.repeatPrefix].$index = compiler.repeatIndex
    }

    // now parse the DOM, during which we will create necessary bindings
    // and bind the parsed directives
    compiler.compile(compiler.el, true)

    // observe root values so that they emit events when
    // their nested values change (for an Object)
    // or when they mutate (for an Array)
    var i = observables.length, binding
    while (i--) {
        binding = observables[i]
        Observer.observe(binding.value, binding.key, compiler.observer)
    }
    // extract dependencies for computed properties
    if (computed.length) DepsParser.parse(computed)
    // extract dependencies for computed properties with dynamic context
    if (ctxBindings.length) compiler.bindContexts(ctxBindings)
    // unset these no longer needed stuff
    compiler.observables = compiler.computed = compiler.ctxBindings = compiler.arrays = null
}

var CompilerProto = Compiler.prototype

/*
 *  Initialize the VM/Compiler's element.
 *  Fill it in with the template if necessary.
 */
CompilerProto.setupElement = function (options) {
    // create the node first
    var el = this.el = typeof options.el === 'string'
        ? document.querySelector(options.el)
        : options.el || document.createElement(options.tagName || 'div')

    // apply element options
    if (options.id) el.id = options.id
    if (options.className) el.className = options.className
    var attrs = options.attributes
    if (attrs) {
        for (var attr in attrs) {
            el.setAttribute(attr, attrs[attr])
        }
    }

    // initialize template
    var template = options.template
    if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
            var templateNode = document.querySelector(template)
            if (templateNode) {
                el.innerHTML = templateNode.innerHTML
            }
        } else {
            el.innerHTML = template
        }
    } else if (options.templateFragment) {
        el.innerHTML = ''
        el.appendChild(options.templateFragment.cloneNode(true))
    }
}

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
            if (bindings[key] && depsOb.isObserving) {
                depsOb.emit('get', bindings[key])
            }
        })
        .on('set', function (key, val) {
            observer.emit('change:' + key, val)
            if (bindings[key]) bindings[key].update(val)
        })
        .on('mutate', function (key, val, mutation) {
            observer.emit('change:' + key, val, mutation)
            if (bindings[key]) bindings[key].pub()
        })
}

/*
 *  Compile a DOM node (recursive)
 */
CompilerProto.compile = function (node, root) {
    var compiler = this
    if (node.nodeType === 1) {
        // a normal node
        if (node.hasAttribute(preAttr)) return
        var repeatExp  = node.getAttribute(repeatAttr),
            vmId       = node.getAttribute(vmAttr),
            partialId  = node.getAttribute(partialAttr)
        // we need to check for any possbile special directives
        // e.g. sd-repeat, sd-viewmodel & sd-partial
        if (repeatExp) { // repeat block
            var directive = Directive.parse(repeatAttr, repeatExp, compiler, node)
            if (directive) {
                compiler.bindDirective(directive)
            }
        } else if (vmId && !root) { // child ViewModels
            node.removeAttribute(vmAttr)
            var ChildVM = compiler.getOption('vms', vmId)
            if (ChildVM) {
                var child = new ChildVM({
                    el: node,
                    child: true,
                    compilerOptions: {
                        parentCompiler: compiler
                    }
                })
                compiler.childCompilers.push(child.$compiler)
            }
        } else {
            if (partialId) { // replace innerHTML with partial
                node.removeAttribute(partialAttr)
                var partial = compiler.getOption('partials', partialId)
                if (partial) {
                    node.innerHTML = ''
                    node.appendChild(partial.cloneNode(true))
                }
            }
            // finally, only normal directives left!
            compiler.compileNode(node)
        }
    } else if (node.nodeType === 3) { // text node
        compiler.compileTextNode(node)
    }
}

/*
 *  Compile a normal node
 */
CompilerProto.compileNode = function (node) {
    var i, j
    // parse if has attributes
    if (node.attributes && node.attributes.length) {
        var attrs = slice.call(node.attributes),
            attr, valid, exps, exp
        // loop through all attributes
        i = attrs.length
        while (i--) {
            attr = attrs[i]
            valid = false
            exps = attr.value.split(',')
            // loop through clauses (separated by ",")
            // inside each attribute
            j = exps.length
            while (j--) {
                exp = exps[j]
                var directive = Directive.parse(attr.name, exp, this, node)
                if (directive) {
                    valid = true
                    this.bindDirective(directive)
                }
            }
            if (valid) node.removeAttribute(attr.name)
        }
    }
    // recursively compile childNodes
    if (node.childNodes.length) {
        var nodes = slice.call(node.childNodes)
        for (i = 0, j = nodes.length; i < j; i++) {
            this.compile(nodes[i])
        }
    }
}

/*
 *  Compile a text node
 */
CompilerProto.compileTextNode = function (node) {
    var tokens = TextParser.parse(node.nodeValue)
    if (!tokens) return
    var dirname = config.prefix + '-text',
        el, token, directive
    for (var i = 0, l = tokens.length; i < l; i++) {
        token = tokens[i]
        if (token.key) { // a binding
            if (token.key.charAt(0) === '>') { // a partial
                var partialId = token.key.slice(1).trim(),
                    partial = this.getOption('partials', partialId)
                if (partial) {
                    el = partial.cloneNode(true)
                    this.compileNode(el)
                }
            } else { // a binding
                el = document.createTextNode('')
                directive = Directive.parse(dirname, token.key, this, el)
                if (directive) {
                    this.bindDirective(directive)
                }
            }
        } else { // a plain string
            el = document.createTextNode(token)
        }
        node.parentNode.insertBefore(el, node)
    }
    node.parentNode.removeChild(node)
}

/*
 *  Add a directive instance to the correct binding & viewmodel
 */
CompilerProto.bindDirective = function (directive) {

    var binding,
        compiler      = this,
        key           = directive.key,
        baseKey       = key.split('.')[0],
        ownerCompiler = traceOwnerCompiler(directive, compiler)

    compiler.dirs.push(directive)

    if (directive.isExp) {
        binding = compiler.createBinding(key, true)
    } else if (ownerCompiler.vm.hasOwnProperty(baseKey)) {
        // if the value is present in the target VM, we create the binding on its compiler
        binding = ownerCompiler.bindings.hasOwnProperty(key)
            ? ownerCompiler.bindings[key]
            : ownerCompiler.createBinding(key)
    } else {
        // due to prototypal inheritance of bindings, if a key doesn't exist here,
        // it doesn't exist in the whole prototype chain. Therefore in that case
        // we create the new binding at the root level.
        binding = ownerCompiler.bindings[key] || compiler.rootCompiler.createBinding(key)
    }

    binding.instances.push(directive)
    directive.binding = binding

    // for newly inserted sub-VMs (repeat items), need to bind deps
    // because they didn't get processed when the parent compiler
    // was binding dependencies.
    var i, dep, deps = binding.contextDeps
    if (deps) {
        i = deps.length
        while (i--) {
            dep = compiler.bindings[deps[i]]
            dep.subs.push(directive)
        }
    }

    var value = binding.value
    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(value)
    }

    // set initial value
    if (binding.isComputed) {
        directive.refresh(value)
    } else {
        directive.update(value, true)
    }
}

/*
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key, isExp) {

    var compiler = this,
        bindings = compiler.bindings,
        binding  = new Binding(compiler, key, isExp)

    if (isExp) {
        // a complex expression binding
        // we need to generate an anonymous computed property for it
        var result = ExpParser.parse(key)
        if (result) {
            log('  created anonymous binding: ' + key)
            binding.value = { get: result.getter }
            compiler.markComputed(binding)
            compiler.exps.push(binding)
            // need to create the bindings for keys
            // that do not exist yet
            var i = result.vars.length, v
            while (i--) {
                v = result.vars[i]
                if (!bindings[v]) {
                    compiler.rootCompiler.createBinding(v)
                }
            }
        } else {
            utils.warn('  invalid expression: ' + key)
        }
    } else {
        log('  created binding: ' + key)
        bindings[key] = binding
        // make sure the key exists in the object so it can be observed
        // by the Observer!
        compiler.ensurePath(key)
        if (binding.root) {
            // this is a root level binding. we need to define getter/setters for it.
            compiler.define(key, binding)
        } else {
            var parentKey = key.slice(0, key.lastIndexOf('.'))
            if (!bindings.hasOwnProperty(parentKey)) {
                // this is a nested value binding, but the binding for its parent
                // has not been created yet. We better create that one too.
                compiler.createBinding(parentKey)
            }
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
    var path = key.split('.'), sec, obj = this.vm
    for (var i = 0, d = path.length - 1; i < d; i++) {
        sec = path[i]
        if (!obj[sec]) obj[sec] = {}
        obj = obj[sec]
    }
    if (utils.typeOf(obj) === 'Object') {
        sec = path[i]
        if (!(sec in obj)) obj[sec] = undefined
    }
}

/*
 *  Defines the getter/setter for a root-level binding on the VM
 *  and observe the initial value
 */
CompilerProto.define = function (key, binding) {

    log('    defined root binding: ' + key)

    var compiler = this,
        vm = compiler.vm,
        ob = compiler.observer,
        value = binding.value = vm[key], // save the value before redefinening it
        type = utils.typeOf(value)

    if (type === 'Object' && value.get) {
        // computed property
        compiler.markComputed(binding)
    } else if (type === 'Object' || type === 'Array') {
        // observe objects later, becase there might be more keys
        // to be added to it. we also want to emit all the set events
        // after all values are available.
        compiler.observables.push(binding)
    }

    Object.defineProperty(vm, key, {
        enumerable: true,
        get: function () {
            var value = binding.value
            if ((!binding.isComputed && (!value || !value.__observer__)) ||
                Array.isArray(value)) {
                // only emit non-computed, non-observed (primitive) values, or Arrays.
                // because these are the cleanest dependencies
                ob.emit('get', key)
            }
            return binding.isComputed
                ? value.get({
                    el: compiler.el,
                    vm: vm,
                    item: compiler.repeat
                        ? vm[compiler.repeatPrefix]
                        : null
                })
                : value
        },
        set: function (newVal) {
            var value = binding.value
            if (binding.isComputed) {
                if (value.set) {
                    value.set(newVal)
                }
            } else if (newVal !== value) {
                // unwatch the old value
                Observer.unobserve(value, key, ob)
                // set new value
                binding.value = newVal
                ob.emit('set', key, newVal)
                // now watch the new value, which in turn emits 'set'
                // for all its nested values
                Observer.observe(newVal, key, ob)
            }
        }
    })
}

/*
 *  Process a computed property binding
 */
CompilerProto.markComputed = function (binding) {
    var value = binding.value,
        vm    = this.vm
    binding.isComputed = true
    // keep a copy of the raw getter
    // for extracting contextual dependencies
    binding.rawGet = value.get
    // bind the accessors to the vm
    value.get = value.get.bind(vm)
    if (value.set) value.set = value.set.bind(vm)
    // keep track for dep parsing later
    this.computed.push(binding)
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
 *  Retrive an option from the compiler
 */
CompilerProto.getOption = function (type, id) {
    var opts = this.options
    return (opts[type] && opts[type][id]) || (utils[type] && utils[type][id])
}

/*
 *  Unbind and remove element
 */
CompilerProto.destroy = function () {
    var compiler = this
    log('compiler destroyed: ', compiler.vm.$el)
    // unwatch
    compiler.observer.off()
    compiler.emitter.off()
    var i, key, dir, inss, binding,
        el         = compiler.el,
        directives = compiler.dirs,
        exps       = compiler.exps,
        bindings   = compiler.bindings
    // remove all directives that are instances of external bindings
    i = directives.length
    while (i--) {
        dir = directives[i]
        if (dir.binding.compiler !== compiler) {
            inss = dir.binding.instances
            if (inss) inss.splice(inss.indexOf(dir), 1)
        }
        dir.unbind()
    }
    // unbind all expressions (anonymous bindings)
    i = exps.length
    while (i--) {
        exps[i].unbind()
    }
    // unbind/unobserve all own bindings
    for (key in bindings) {
        if (bindings.hasOwnProperty(key)) {
            binding = bindings[key]
            if (binding.root) {
                Observer.unobserve(binding.value, binding.key, compiler.observer)
            }
            binding.unbind()
        }
    }
    // remove self from parentCompiler
    var parent = compiler.parentCompiler
    if (parent) {
        parent.childCompilers.splice(parent.childCompilers.indexOf(compiler), 1)
    }
    // remove el
    if (el === document.body) {
        el.innerHTML = ''
    } else if (el.parentNode) {
        el.parentNode.removeChild(el)
    }
}

// Helpers --------------------------------------------------------------------

/*
 *  Refresh prefix in case it has been changed
 *  during compilations
 */
function refreshPrefix () {
    var prefix     = config.prefix
    repeatAttr     = prefix + '-repeat'
    vmAttr         = prefix + '-viewmodel'
    partialAttr    = prefix + '-partial'
    transitionAttr = prefix + '-transition'
    preAttr        = prefix + '-pre'
}

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