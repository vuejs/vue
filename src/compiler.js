var Emitter     = require('./emitter'),
    Observer    = require('./observer'),
    config      = require('./config'),
    utils       = require('./utils'),
    Binding     = require('./binding'),
    Directive   = require('./directive'),
    TextParser  = require('./text-parser'),
    DepsParser  = require('./deps-parser'),
    ExpParser   = require('./exp-parser'),
    transition  = require('./transition'),

    // cache methods
    slice       = Array.prototype.slice,
    log         = utils.log,
    makeHash    = utils.hash,
    hasOwn      = Object.prototype.hasOwnProperty

/**
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    var compiler = this

    // indicate that we are intiating this instance
    // so we should not run any transitions
    compiler.init = true

    // extend options
    options = compiler.options = options || makeHash()
    utils.processOptions(options)
    utils.extend(compiler, options.compilerOptions)

    // initialize element
    var el = compiler.setupElement(options)
    log('\nnew VM instance:', el.tagName, '\n')

    // copy scope properties to vm
    var scope = options.scope
    if (scope) utils.extend(vm, scope, true)

    compiler.vm  = vm
    vm.$         = makeHash()
    vm.$el       = el
    vm.$compiler = compiler

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
        computed    = compiler.computed    = []

    // prototypal inheritance of bindings
    var parent = compiler.parentCompiler
    compiler.bindings = parent
        ? Object.create(parent.bindings)
        : makeHash()
    compiler.rootCompiler = parent
        ? getRoot(parent)
        : compiler

    // set parent VM
    // and register child id on parent
    var childId = utils.attr(el, 'id')
    if (parent) {
        vm.$parent = parent.vm
        if (childId) {
            compiler.childId = childId
            parent.vm.$[childId] = vm
        }
    }

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
    // which should be inenumerable but configurable
    if (compiler.repeat) {
        vm.$index = compiler.repeatIndex
        vm.$collection = compiler.repeatCollection
        compiler.createBinding('$index')
    }

    // now parse the DOM, during which we will create necessary bindings
    // and bind the parsed directives
    compiler.compile(el, true)

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

    // done!
    compiler.init = false
}

var CompilerProto = Compiler.prototype

/**
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
    if (template) {
        el.innerHTML = ''
        el.appendChild(template.cloneNode(true))
    }
    return el
}

/**
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
    observer.proxies = makeHash()

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

/**
 *  Compile a DOM node (recursive)
 */
CompilerProto.compile = function (node, root) {

    var compiler = this

    if (node.nodeType === 1) { // a normal node

        // skip anything with sd-pre
        if (utils.attr(node, 'pre') !== null) return

        // special attributes to check
        var repeatExp,
            componentId,
            partialId,
            transId,
            transClass

        // It is important that we access these attributes
        // procedurally because the order matters.
        //
        // `utils.attr` removes the attribute once it gets the
        // value, so we should not access them all at once.

        // sd-repeat has the highest priority
        // and we need to preserve all other attributes for it.
        /* jshint boss: true */
        if (repeatExp = utils.attr(node, 'repeat')) {

            // repeat block cannot have sd-id at the same time.
            var directive = Directive.parse(config.attrs.repeat, repeatExp, compiler, node)
            if (directive) {
                compiler.bindDirective(directive)
            }

        // sd-component has second highest priority
        // and we preseve all other attributes as well.
        } else if (!root && (componentId = utils.attr(node, 'component'))) {

            var ChildVM = compiler.getOption('components', componentId)
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
            
            partialId   = utils.attr(node, 'partial')
            transId     = utils.attr(node, 'transition')
            transClass  = utils.attr(node, 'transition-class')

            // replace innerHTML with partial
            if (partialId) {
                var partial = compiler.getOption('partials', partialId)
                if (partial) {
                    node.innerHTML = ''
                    node.appendChild(partial.cloneNode(true))
                }
            }

            // Javascript transition
            if (transId) {
                node.sd_trans = transId
            }

            // CSS class transition
            if (transClass) {
                node.sd_trans_class = utils.split(transClass)
            }

            // finally, only normal directives left!
            compiler.compileNode(node)
        }

    } else if (node.nodeType === 3) { // text node

        compiler.compileTextNode(node)

    }
}

/**
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

/**
 *  Compile a text node
 */
CompilerProto.compileTextNode = function (node) {
    var tokens = TextParser.parse(node.nodeValue)
    if (!tokens) return
    var dirname = config.attrs.text,
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

/**
 *  Add a directive instance to the correct binding & viewmodel
 */
CompilerProto.bindDirective = function (directive) {

    // keep track of it so we can unbind() later
    this.dirs.push(directive)

    // for a simple directive, simply call its bind() or _update()
    // and we're done.
    if (directive.isSimple) {
        if (directive.bind) directive.bind()
        return
    }

    // otherwise, we got more work to do...
    var binding,
        compiler      = this,
        key           = directive.key,
        baseKey       = key.split('.')[0],
        ownerCompiler = traceOwnerCompiler(directive, compiler)

    if (directive.isExp) {
        // expression bindings are always created on current compiler
        binding = compiler.createBinding(key, true, directive.isFn)
    } else if (ownerCompiler.vm.hasOwnProperty(baseKey)) {
        // If the directive's owner compiler's VM has the key,
        // it belongs there. Create the binding if it's not already
        // created, and return it.
        binding = hasOwn.call(ownerCompiler.bindings, key)
            ? ownerCompiler.bindings[key]
            : ownerCompiler.createBinding(key)
    } else {
        // due to prototypal inheritance of bindings, if a key doesn't exist
        // on the owner compiler's VM, then it doesn't exist in the whole
        // prototype chain. In this case we create the new binding at the root level.
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

/**
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key, isExp, isFn) {

    var compiler = this,
        bindings = compiler.bindings,
        binding  = new Binding(compiler, key, isExp, isFn)

    if (isExp) {
        // a complex expression binding
        // we need to generate an anonymous computed property for it
        var result = ExpParser.parse(key)
        if (result) {
            log('  created anonymous binding: ' + key)
            binding.value = isFn
                ? result.getter
                : { get: result.getter }
            compiler.markComputed(binding)
            compiler.exps.push(binding)
            // need to create the bindings for keys
            // that do not exist yet
            if (result.paths) {
                var i = result.paths.length, v
                while (i--) {
                    v = result.paths[i]
                    if (!bindings[v]) {
                        compiler.rootCompiler.createBinding(v)
                    }
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
            if (!hasOwn.call(bindings, parentKey)) {
                // this is a nested value binding, but the binding for its parent
                // has not been created yet. We better create that one too.
                compiler.createBinding(parentKey)
            }
        }
    }
    return binding
}

/**
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

/**
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
                ? value.get()
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

/**
 *  Process a computed property binding
 */
CompilerProto.markComputed = function (binding) {
    var value = binding.value,
        vm    = this.vm
    binding.isComputed = true
    // bind the accessors to the vm
    if (binding.isFn) {
        binding.value = value.bind(vm)
    } else {
        value.get = value.get.bind(vm)
        if (value.set) value.set = value.set.bind(vm)
    }
    // keep track for dep parsing later
    this.computed.push(binding)
}

/**
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

/**
 *  Retrive an option from the compiler
 */
CompilerProto.getOption = function (type, id) {
    var opts = this.options
    return (opts[type] && opts[type][id]) || (utils[type] && utils[type][id])
}

/**
 *  Unbind and remove element
 */
CompilerProto.destroy = function () {

    var compiler = this,
        i, key, dir, instances, binding,
        el         = compiler.el,
        directives = compiler.dirs,
        exps       = compiler.exps,
        bindings   = compiler.bindings,
        teardown   = compiler.options.teardown

    // call user teardown first
    if (teardown) teardown()

    // unwatch
    compiler.observer.off()
    compiler.emitter.off()

    // unbind all direcitves
    i = directives.length
    while (i--) {
        dir = directives[i]
        // if this directive is an instance of an external binding
        // e.g. a directive that refers to a variable on the parent VM
        // we need to remove it from that binding's instances
        if (!dir.isSimple && dir.binding.compiler !== compiler) {
            instances = dir.binding.instances
            if (instances) instances.splice(instances.indexOf(dir), 1)
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
        if (hasOwn.call(bindings, key)) {
            binding = bindings[key]
            if (binding.root) {
                Observer.unobserve(binding.value, binding.key, compiler.observer)
            }
            binding.unbind()
        }
    }

    // remove self from parentCompiler
    var parent = compiler.parentCompiler,
        childId = compiler.childId
    if (parent) {
        parent.childCompilers.splice(parent.childCompilers.indexOf(compiler), 1)
        if (childId) {
            delete parent.vm.$[childId]
        }
    }

    // finally remove dom element
    if (el === document.body) {
        el.innerHTML = ''
    } else if (el.parentNode) {
        transition(el, -1, function () {
            el.parentNode.removeChild(el)
        }, this)
    }
}

// Helpers --------------------------------------------------------------------

/**
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

/**
 *  shorthand for getting root compiler
 */
function getRoot (compiler) {
    return traceOwnerCompiler({ root: true }, compiler)
}

module.exports = Compiler