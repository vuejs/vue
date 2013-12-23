var Emitter     = require('./emitter'),
    Observer    = require('./observer'),
    config      = require('./config'),
    utils       = require('./utils'),
    Binding     = require('./binding'),
    Directive   = require('./directive'),
    TextParser  = require('./text-parser'),
    DepsParser  = require('./deps-parser'),
    ExpParser   = require('./exp-parser'),
    // cache deps ob
    depsOb      = DepsParser.observer,
    // cache methods
    slice       = Array.prototype.slice,
    log         = utils.log,
    makeHash    = utils.hash,
    extend      = utils.extend,
    def         = utils.defProtected,
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

    // process and extend options
    options = compiler.options = options || makeHash()
    var data = compiler.data = options.data || {}
    utils.processOptions(options)
    extend(compiler, options.compilerOptions)
    extend(vm, options.data, true)
    extend(vm, options.methods, true)

    // initialize element
    var el = compiler.setupElement(options)
    log('\nnew VM instance:', el.tagName, '\n')

    compiler.vm  = vm
    def(vm, '$', makeHash())
    def(vm, '$el', el)
    def(vm, '$data', data)
    def(vm, '$compiler', compiler)

    // keep track of directives and expressions
    // so they can be unbound during destroy()
    compiler.dirs = []
    compiler.exps = []
    compiler.childCompilers = [] // keep track of child compilers
    compiler.emitter = new Emitter() // the emitter used for nested VM communication

    // Store things during parsing to be processed afterwards,
    // because we want to have created all bindings before
    // observing values / parsing dependencies.
    var computed = compiler.computed = []

    // prototypal inheritance of bindings
    var parent = compiler.parentCompiler
    compiler.bindings = parent
        ? Object.create(parent.bindings)
        : makeHash()
    compiler.rootCompiler = parent
        ? getRoot(parent)
        : compiler
    def(vm, '$root', compiler.rootCompiler.vm)

    // set parent VM
    // and register child id on parent
    var childId = utils.attr(el, 'component-id')
    if (parent) {
        parent.childCompilers.push(compiler)
        def(vm, '$parent', parent.vm)
        if (childId) {
            compiler.childId = childId
            parent.vm.$[childId] = vm
        }
    }

    // setup observer
    compiler.setupObserver()

    // beforeCompile hook
    compiler.execHook('beforeCompile', 'created')
    // the user might have set some props on the vm 
    // so copy it back to the data...
    extend(data, vm)
    // observe the data
    Observer.observe(data, '', compiler.observer)

    // for repeated items, create an index binding
    // which should be inenumerable but configurable
    if (compiler.repeat) {
        //data.$index = compiler.repeatIndex
        def(data, '$index', compiler.repeatIndex, false, true)
        compiler.createBinding('$index')
    }

    // now parse the DOM, during which we will create necessary bindings
    // and bind the parsed directives
    compiler.compile(el, true)

    // extract dependencies for computed properties
    if (computed.length) DepsParser.parse(computed)

    // done!
    compiler.init = false

    // post compile / ready hook
    compiler.execHook('afterCompile', 'ready')
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

    var template = options.template
    if (template) {
        // replace option: use the first node in
        // the template directly
        if (options.replace && template.childNodes.length === 1) {
            var replacer = template.childNodes[0].cloneNode(true)
            if (el.parentNode) {
                el.parentNode.insertBefore(replacer, el)
                el.parentNode.removeChild(el)
            }
            el = replacer
        } else {
            el.innerHTML = ''
            el.appendChild(template.cloneNode(true))
        }
    }

    // apply element options
    if (options.id) el.id = options.id
    if (options.className) el.className = options.className
    var attrs = options.attributes
    if (attrs) {
        for (var attr in attrs) {
            el.setAttribute(attr, attrs[attr])
        }
    }

    return el
}

/**
 *  Setup observer.
 *  The observer listens for get/set/mutate events on all VM
 *  values/objects and trigger corresponding binding updates.
 */
CompilerProto.setupObserver = function () {

    var compiler = this,
        bindings = compiler.bindings,
        observer = compiler.observer = new Emitter()

    // a hash to hold event proxies for each root level key
    // so they can be referenced and removed later
    observer.proxies = makeHash()

    // add own listeners which trigger binding updates
    observer
        .on('get', function (key) {
            check(key)
            depsOb.emit('get', bindings[key])
        })
        .on('set', function (key, val) {
            observer.emit('change:' + key, val)
            check(key)
            bindings[key].update(val)
        })
        .on('mutate', function (key, val, mutation) {
            observer.emit('change:' + key, val, mutation)
            check(key)
            bindings[key].pub()
        })

    function check (key) {
        if (!hasOwn.call(bindings, key)) {
            compiler.createBinding(key)
        }
    }
}

/**
 *  Compile a DOM node (recursive)
 */
CompilerProto.compile = function (node, root) {

    var compiler = this,
        nodeType = node.nodeType,
        tagName  = node.tagName

    if (nodeType === 1 && tagName !== 'SCRIPT') { // a normal node

        // skip anything with v-pre
        if (utils.attr(node, 'pre') !== null) return

        // special attributes to check
        var repeatExp,
            componentExp,
            partialId,
            directive

        // It is important that we access these attributes
        // procedurally because the order matters.
        //
        // `utils.attr` removes the attribute once it gets the
        // value, so we should not access them all at once.

        // v-repeat has the highest priority
        // and we need to preserve all other attributes for it.
        /* jshint boss: true */
        if (repeatExp = utils.attr(node, 'repeat')) {

            // repeat block cannot have v-id at the same time.
            directive = Directive.parse(config.attrs.repeat, repeatExp, compiler, node)
            if (directive) {
                compiler.bindDirective(directive)
            }

        // v-component has 2nd highest priority
        } else if (!root && (componentExp = utils.attr(node, 'component'))) {

            directive = Directive.parse(config.attrs.component, componentExp, compiler, node)
            if (directive) {
                // component directive is a bit different from the others.
                // when it has no argument, it should be treated as a
                // simple directive with its key as the argument.
                if (componentExp.indexOf(':') === -1) {
                    directive.isSimple = true
                    directive.arg = directive.key
                }
                compiler.bindDirective(directive)
            }

        } else {

            // check transition property
            node.vue_trans = utils.attr(node, 'transition')
            
            // replace innerHTML with partial
            partialId = utils.attr(node, 'partial')
            if (partialId) {
                var partial = compiler.getOption('partials', partialId)
                if (partial) {
                    node.innerHTML = ''
                    node.appendChild(partial.cloneNode(true))
                }
            }

            // finally, only normal directives left!
            compiler.compileNode(node)
        }

    } else if (nodeType === 3) { // text node

        compiler.compileTextNode(node)

    }

}

/**
 *  Compile a normal node
 */
CompilerProto.compileNode = function (node) {
    var i, j, attrs = node.attributes
    // parse if has attributes
    if (attrs && attrs.length) {
        var attr, valid, exps, exp
        // loop through all attributes
        i = attrs.length
        while (i--) {
            attr = attrs[i]
            valid = false
            exps = Directive.split(attr.value)
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
        baseKey       = key.split('.')[0]

    if (directive.isExp) {
        // expression bindings are always created on current compiler
        binding = compiler.createBinding(key, true, directive.isFn)
    } else if (
        hasOwn.call(compiler.data, baseKey) ||
        hasOwn.call(compiler.vm, baseKey)
    ) {
        // If the directive's compiler's VM has the base key,
        // it belongs here. Create the binding if it's not created already.
        binding = hasOwn.call(compiler.bindings, key)
            ? compiler.bindings[key]
            : compiler.createBinding(key)
    } else {
        // due to prototypal inheritance of bindings, if a key doesn't exist
        // on the bindings object, then it doesn't exist in the whole
        // prototype chain. In this case we create the new binding at the root level.
        binding = compiler.bindings[key] || compiler.rootCompiler.createBinding(key)
    }

    binding.instances.push(directive)
    directive.binding = binding

    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind()
    }

    // set initial value
    var value = binding.value
    if (value !== undefined) {
        if (binding.isComputed) {
            directive.refresh(value)
        } else {
            directive.update(value, true)
        }
    }
}

/**
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key, isExp, isFn) {

    var compiler = this,
        data = compiler.data,
        bindings = compiler.bindings,
        binding  = new Binding(compiler, key, isExp, isFn)

    if (isExp) {
        // a complex expression binding
        // we need to generate an anonymous computed property for it
        var getter = ExpParser.parse(key, compiler)
        if (getter) {
            log('  created expression binding: ' + key)
            binding.value = isFn
                ? getter
                : { $get: getter }
            compiler.markComputed(binding)
            compiler.exps.push(binding)
        }
    } else {
        log('  created binding: ' + key)
        bindings[key] = binding
        // make sure the key exists in the object so it can be observed
        // by the Observer!
        if (binding.root) {
            // this is a root level binding. we need to define getter/setters for it.
            compiler.define(key, binding)
        } else {
            // ensure path in data so it can be observed
            Observer.ensurePath(data, key)
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
 *  Defines the getter/setter for a root-level binding on the VM
 *  and observe the initial value
 */
CompilerProto.define = function (key, binding) {

    log('    defined root binding: ' + key)

    var compiler = this,
        data = compiler.data,
        vm = compiler.vm,
        value = binding.value = data[key] // save the value before redefinening it

    if (utils.typeOf(value) === 'Object' && value.$get) {
        compiler.markComputed(binding)
    }

    if (!(key in data)) {
        data[key] = undefined
    }

    // if the data object is already observed, that means
    // this binding is created late. we need to observe it now.
    if (data.__observer__) {
        Observer.convert(data, key)
    }

    Object.defineProperty(vm, key, {
        get: binding.isComputed
            ? function () {
                return data[key].$get()
            }
            : function () {
                return data[key]
            },
        set: binding.isComputed
            ? function (val) {
                if (data[key].$set) {
                    data[key].$set(val)
                }
            }
            : function (val) {
                data[key] = val
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
        binding.value = utils.bind(value, vm)
    } else {
        value.$get = utils.bind(value.$get, vm)
        if (value.$set) {
            value.$set = utils.bind(value.$set, vm)
        }
    }
    // keep track for dep parsing later
    this.computed.push(binding)
}

/**
 *  Retrive an option from the compiler
 */
CompilerProto.getOption = function (type, id) {
    var opts = this.options,
        parent = this.parentCompiler
    return (opts[type] && opts[type][id]) || (
        parent
            ? parent.getOption(type, id)
            : utils[type] && utils[type][id]
    )
}

/**
 *  Execute a user hook
 */
CompilerProto.execHook = function (id, alt) {
    var opts = this.options,
        hook = opts[id] || opts[alt]
    if (hook) {
        hook.call(this.vm, opts)
    }
}

/**
 *  Unbind and remove element
 */
CompilerProto.destroy = function () {

    var compiler = this,
        i, key, dir, instances, binding,
        vm          = compiler.vm,
        el          = compiler.el,
        directives  = compiler.dirs,
        exps        = compiler.exps,
        bindings    = compiler.bindings

    compiler.execHook('beforeDestroy')

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
    } else {
        vm.$remove()
    }

    compiler.execHook('afterDestroy')
}

// Helpers --------------------------------------------------------------------

/**
 *  shorthand for getting root compiler
 */
function getRoot (compiler) {
    while (compiler.parentCompiler) {
        compiler = compiler.parentCompiler
    }
    return compiler
}

module.exports = Compiler