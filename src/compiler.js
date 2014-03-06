var Emitter     = require('./emitter'),
    Observer    = require('./observer'),
    config      = require('./config'),
    utils       = require('./utils'),
    Binding     = require('./binding'),
    Directive   = require('./directive'),
    TextParser  = require('./text-parser'),
    DepsParser  = require('./deps-parser'),
    ExpParser   = require('./exp-parser'),
    
    // cache methods
    slice       = [].slice,
    each        = [].forEach,
    makeHash    = utils.hash,
    extend      = utils.extend,
    def         = utils.defProtected,
    hasOwn      = ({}).hasOwnProperty,

    // hooks to register
    hooks = [
        'created', 'ready',
        'beforeDestroy', 'afterDestroy',
        'attached', 'detached'
    ]

/**
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    var compiler = this

    // default state
    compiler.init       = true
    compiler.repeat     = false
    compiler.destroyed  = false
    compiler.delayReady = false

    // process and extend options
    options = compiler.options = options || makeHash()
    utils.processOptions(options)

    // copy data, methods & compiler options
    var data = compiler.data = options.data || {}
    extend(vm, data, true)
    extend(vm, options.methods, true)
    extend(compiler, options.compilerOptions)

    // initialize element
    var el = compiler.el = compiler.setupElement(options)
    utils.log('\nnew VM instance: ' + el.tagName + '\n')

    // set compiler properties
    compiler.vm = el.vue_vm = vm
    compiler.bindings = makeHash()
    compiler.dirs = []
    compiler.deferred = []
    compiler.exps = []
    compiler.computed = []
    compiler.children = []
    compiler.emitter = new Emitter()
    compiler.emitter._ctx = vm
    compiler.delegators = makeHash()

    // set inenumerable VM properties
    def(vm, '$', makeHash())
    def(vm, '$el', el)
    def(vm, '$options', options)
    def(vm, '$compiler', compiler)

    // set parent
    var parentVM = options.parent
    if (parentVM) {
        compiler.parent = parentVM.$compiler
        parentVM.$compiler.children.push(compiler)
        def(vm, '$parent', parentVM)
    }
    // set root
    def(vm, '$root', getRoot(compiler).vm)

    // setup observer
    compiler.setupObserver()

    // create bindings for computed properties
    var computed = options.computed
    if (computed) {
        for (var key in computed) {
            compiler.createBinding(key)
        }
    }

    // copy paramAttributes
    if (options.paramAttributes) {
        options.paramAttributes.forEach(function (attr) {
            var val = el.getAttribute(attr)
            vm[attr] = (isNaN(val) || val === null)
                ? val
                : Number(val)
        })
    }

    // beforeCompile hook
    compiler.execHook('created')

    // the user might have set some props on the vm 
    // so copy it back to the data...
    extend(data, vm)

    // observe the data
    compiler.observeData(data)
    
    // for repeated items, create index/key bindings
    // because they are ienumerable
    if (compiler.repeat) {
        compiler.createBinding('$index')
        if (data.$key) compiler.createBinding('$key')
    }

    // now parse the DOM, during which we will create necessary bindings
    // and bind the parsed directives
    compiler.compile(el, true)

    // bind deferred directives (child components)
    compiler.deferred.forEach(compiler.bindDirective, compiler)

    // extract dependencies for computed properties
    compiler.parseDeps()

    // done!
    compiler.rawContent = null
    compiler.init = false

    // post compile / ready hook
    if (!compiler.delayReady) {
        compiler.execHook('ready')
    }
}

var CompilerProto = Compiler.prototype

/**
 *  Initialize the VM/Compiler's element.
 *  Fill it in with the template if necessary.
 */
CompilerProto.setupElement = function (options) {
    // create the node first
    var el = typeof options.el === 'string'
        ? document.querySelector(options.el)
        : options.el || document.createElement(options.tagName || 'div')

    var template = options.template
    if (template) {
        // collect anything already in there
        /* jshint boss: true */
        var child,
            frag = this.rawContent = document.createDocumentFragment()
        while (child = el.firstChild) {
            frag.appendChild(child)
        }
        // replace option: use the first node in
        // the template directly
        if (options.replace && template.childNodes.length === 1) {
            var replacer = template.childNodes[0].cloneNode(true)
            if (el.parentNode) {
                el.parentNode.insertBefore(replacer, el)
                el.parentNode.removeChild(el)
            }
            // copy over attributes
            each.call(el.attributes, function (attr) {
                replacer.setAttribute(attr.name, attr.value)
            })
            // replace
            el = replacer
        } else {
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
 *  It also listens for lifecycle hooks.
 */
CompilerProto.setupObserver = function () {

    var compiler = this,
        bindings = compiler.bindings,
        options  = compiler.options,
        observer = compiler.observer = new Emitter()

    // a hash to hold event proxies for each root level key
    // so they can be referenced and removed later
    observer.proxies = makeHash()
    observer._ctx = compiler.vm

    // add own listeners which trigger binding updates
    observer
        .on('get', onGet)
        .on('set', onSet)
        .on('mutate', onSet)

    // register hooks
    hooks.forEach(function (hook) {
        var fns = options[hook]
        if (Array.isArray(fns)) {
            var i = fns.length
            // since hooks were merged with child at head,
            // we loop reversely.
            while (i--) {
                registerHook(hook, fns[i])
            }
        } else if (fns) {
            registerHook(hook, fns)
        }
    })

    // broadcast attached/detached hooks
    observer
        .on('hook:attached', function () {
            broadcast(1)
        })
        .on('hook:detached', function () {
            broadcast(0)
        })

    function onGet (key) {
        check(key)
        DepsParser.catcher.emit('get', bindings[key])
    }

    function onSet (key, val, mutation) {
        observer.emit('change:' + key, val, mutation)
        check(key)
        bindings[key].update(val)
    }

    function registerHook (hook, fn) {
        observer.on('hook:' + hook, function () {
            fn.call(compiler.vm)
        })
    }

    function broadcast (event) {
        var children = compiler.children
        if (children) {
            var child, i = children.length
            while (i--) {
                child = children[i]
                if (child.el.parentNode) {
                    event = 'hook:' + (event ? 'attached' : 'detached')
                    child.observer.emit(event)
                    child.emitter.emit(event)
                }
            }
        }
    }

    function check (key) {
        if (!bindings[key]) {
            compiler.createBinding(key)
        }
    }
}

CompilerProto.observeData = function (data) {

    var compiler = this,
        observer = compiler.observer

    // recursively observe nested properties
    Observer.observe(data, '', observer)

    // also create binding for top level $data
    // so it can be used in templates too
    var $dataBinding = compiler.bindings['$data'] = new Binding(compiler, '$data')
    $dataBinding.update(data)

    // allow $data to be swapped
    defGetSet(compiler.vm, '$data', {
        enumerable: false,
        get: function () {
            compiler.observer.emit('get', '$data')
            return compiler.data
        },
        set: function (newData) {
            var oldData = compiler.data
            Observer.unobserve(oldData, '', observer)
            compiler.data = newData
            Observer.copyPaths(newData, oldData)
            Observer.observe(newData, '', observer)
            compiler.observer.emit('set', '$data', newData)
        }
    })

    // emit $data change on all changes
    observer
        .on('set', onSet)
        .on('mutate', onSet)

    function onSet (key) {
        if (key !== '$data') {
            $dataBinding.update(compiler.data)
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
            withExp,
            directive,
            componentId =
                utils.attr(node, 'component') ||
                (tagName.indexOf('-') > 0 && tagName.toLowerCase()),
            componentCtor =
                componentId &&
                compiler.getOption('components', componentId)

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
            directive = Directive.parse('repeat', repeatExp, compiler, node)
            if (directive) {
                directive.Ctor = componentCtor
                // defer child component compilation
                // so by the time they are compiled, the parent
                // would have collected all bindings
                compiler.deferred.push(directive)
            }

        // v-with has 2nd highest priority
        } else if (root !== true && ((withExp = utils.attr(node, 'with')) || componentCtor)) {

            withExp = Directive.split(withExp || '')
            withExp.forEach(function (exp, i) {
                var directive = Directive.parse('with', exp, compiler, node)
                if (directive) {
                    directive.Ctor = componentCtor
                    // notify the directive that this is the
                    // last expression in the group
                    directive.last = i === withExp.length - 1
                    compiler.deferred.push(directive)
                }
            })

        } else {

            // compile normal directives
            compiler.compileNode(node)

        }

    } else if (nodeType === 3 && config.interpolate) {

        // text node
        compiler.compileTextNode(node)

    }

}

/**
 *  Compile a normal node
 */
CompilerProto.compileNode = function (node) {

    // check transition & animation properties
    node.vue_trans  = utils.attr(node, 'transition')
    node.vue_anim   = utils.attr(node, 'animation')
    node.vue_effect = this.eval(utils.attr(node, 'effect'))

    var prefix = config.prefix + '-',
        attrs = slice.call(node.attributes),
        i = attrs.length, j, attr, isDirective, exps, exp, directive, dirname

    while (i--) {

        attr = attrs[i]
        isDirective = false

        if (attr.name.indexOf(prefix) === 0) {
            // a directive - split, parse and bind it.
            isDirective = true
            exps = Directive.split(attr.value)
            // loop through clauses (separated by ",")
            // inside each attribute
            j = exps.length
            while (j--) {
                exp = exps[j]
                dirname = attr.name.slice(prefix.length)
                directive = Directive.parse(dirname, exp, this, node)
                this.bindDirective(directive)
            }
        } else if (config.interpolate) {
            // non directive attribute, check interpolation tags
            exp = TextParser.parseAttr(attr.value)
            if (exp) {
                directive = Directive.parse('attr', attr.name + ':' + exp, this, node)
                this.bindDirective(directive)
            }
        }

        if (isDirective && dirname !== 'cloak') {
            node.removeAttribute(attr.name)
        }
    }

    // recursively compile childNodes
    if (node.childNodes.length) {
        slice.call(node.childNodes).forEach(this.compile, this)
    }
}

/**
 *  Compile a text node
 */
CompilerProto.compileTextNode = function (node) {

    var tokens = TextParser.parse(node.nodeValue)
    if (!tokens) return
    var el, token, directive

    for (var i = 0, l = tokens.length; i < l; i++) {

        token = tokens[i]
        directive = null

        if (token.key) { // a binding
            if (token.key.charAt(0) === '>') { // a partial
                el = document.createComment('ref')
                directive = Directive.parse('partial', token.key.slice(1), this, el)
            } else { // a real binding
                if (!token.html) { // text binding
                    el = document.createTextNode('')
                    directive = Directive.parse('text', token.key, this, el)
                } else { // html binding
                    el = document.createComment(config.prefix + '-html')
                    directive = Directive.parse('html', token.key, this, el)
                }
            }
        } else { // a plain string
            el = document.createTextNode(token)
        }

        // insert node
        node.parentNode.insertBefore(el, node)
        // bind directive
        this.bindDirective(directive)

    }
    node.parentNode.removeChild(node)
}

/**
 *  Add a directive instance to the correct binding & viewmodel
 */
CompilerProto.bindDirective = function (directive) {

    if (!directive) return

    // keep track of it so we can unbind() later
    this.dirs.push(directive)

    // for empty or literal directives, simply call its bind()
    // and we're done.
    if (directive.isEmpty || directive.isLiteral) {
        if (directive.bind) directive.bind()
        return
    }

    // otherwise, we got more work to do...
    var binding,
        compiler = this,
        key      = directive.key

    if (directive.isExp) {
        // expression bindings are always created on current compiler
        binding = compiler.createBinding(key, true, directive.isFn)
    } else {
        // recursively locate which compiler owns the binding
        while (compiler) {
            if (compiler.hasKey(key)) {
                break
            } else {
                compiler = compiler.parent
            }
        }
        compiler = compiler || this
        binding = compiler.bindings[key] || compiler.createBinding(key)
    }
    binding.dirs.push(directive)
    directive.binding = binding

    var value = binding.val()
    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(value)
    }
    // set initial value
    directive.update(value, true)
}

/**
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key, isExp, isFn) {

    utils.log('  created binding: ' + key)

    var compiler = this,
        bindings = compiler.bindings,
        computed = compiler.options.computed,
        binding  = new Binding(compiler, key, isExp, isFn)

    if (isExp) {
        // expression bindings are anonymous
        compiler.defineExp(key, binding)
    } else {
        bindings[key] = binding
        if (binding.root) {
            // this is a root level binding. we need to define getter/setters for it.
            if (computed && computed[key]) {
                // computed property
                compiler.defineComputed(key, binding, computed[key])
            } else if (key.charAt(0) !== '$') {
                // normal property
                compiler.defineProp(key, binding)
            } else {
                compiler.defineMeta(key, binding)
            }
        } else if (computed && computed[key.split('.')[0]]) {
            // nested path on computed property
            compiler.defineExp(key, binding)
        } else {
            // ensure path in data so it can be observed
            Observer.ensurePath(compiler.data, key)
            var parentKey = key.slice(0, key.lastIndexOf('.'))
            if (!bindings[parentKey]) {
                // this is a nested value binding, but the binding for its parent
                // has not been created yet. We better create that one too.
                compiler.createBinding(parentKey)
            }
        }
    }
    return binding
}

/**
 *  Define the getter/setter for a root-level property on the VM
 *  and observe the initial value
 */
CompilerProto.defineProp = function (key, binding) {
    
    var compiler = this,
        data     = compiler.data,
        ob       = data.__emitter__

    // make sure the key is present in data
    // so it can be observed
    if (!(key in data)) {
        data[key] = undefined
    }

    // if the data object is already observed, but the key
    // is not observed, we need to add it to the observed keys.
    if (ob && !(key in ob.values)) {
        Observer.convertKey(data, key)
    }

    binding.value = data[key]

    defGetSet(compiler.vm, key, {
        get: function () {
            return compiler.data[key]
        },
        set: function (val) {
            compiler.data[key] = val
        }
    })
}

/**
 *  Define a meta property, e.g. $index or $key,
 *  which is bindable but only accessible on the VM,
 *  not in the data.
 */
CompilerProto.defineMeta = function (key, binding) {
    var vm = this.vm,
        ob = this.observer,
        value = binding.value = vm[key] || this.data[key]
    // remove initital meta in data, since the same piece
    // of data can be observed by different VMs, each have
    // its own associated meta info.
    delete this.data[key]
    defGetSet(vm, key, {
        get: function () {
            if (Observer.shouldGet) ob.emit('get', key)
            return value
        },
        set: function (val) {
            ob.emit('set', key, val)
            value = val
        }
    })
}

/**
 *  Define an expression binding, which is essentially
 *  an anonymous computed property
 */
CompilerProto.defineExp = function (key, binding) {
    var getter = ExpParser.parse(key, this)
    if (getter) {
        this.markComputed(binding, getter)
        this.exps.push(binding)
    }
}

/**
 *  Define a computed property on the VM
 */
CompilerProto.defineComputed = function (key, binding, value) {
    this.markComputed(binding, value)
    defGetSet(this.vm, key, {
        get: binding.value.$get,
        set: binding.value.$set
    })
}

/**
 *  Process a computed property binding
 *  so its getter/setter are bound to proper context
 */
CompilerProto.markComputed = function (binding, value) {
    binding.isComputed = true
    // bind the accessors to the vm
    if (binding.isFn) {
        binding.value = value
    } else {
        if (typeof value === 'function') {
            value = { $get: value }
        }
        binding.value = {
            $get: utils.bind(value.$get, this.vm),
            $set: value.$set
                ? utils.bind(value.$set, this.vm)
                : undefined
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
        parent = this.parent,
        globalAssets = config.globalAssets
    return (opts[type] && opts[type][id]) || (
        parent
            ? parent.getOption(type, id)
            : globalAssets[type] && globalAssets[type][id]
    )
}

/**
 *  Emit lifecycle events to trigger hooks
 */
CompilerProto.execHook = function (event) {
    event = 'hook:' + event
    this.observer.emit(event)
    this.emitter.emit(event)
}

/**
 *  Check if a compiler's data contains a keypath
 */
CompilerProto.hasKey = function (key) {
    var baseKey = key.split('.')[0]
    return hasOwn.call(this.data, baseKey) ||
        hasOwn.call(this.vm, baseKey)
}

/**
 *  Collect dependencies for computed properties
 */
CompilerProto.parseDeps = function () {
    if (!this.computed.length) return
    DepsParser.parse(this.computed)
}

/**
 *  Add an event delegation listener
 *  listeners are instances of directives with `isFn:true`
 */
CompilerProto.addListener = function (listener) {
    var event = listener.arg,
        delegator = this.delegators[event]
    if (!delegator) {
        // initialize a delegator
        delegator = this.delegators[event] = {
            targets: [],
            handler: function (e) {
                var i = delegator.targets.length,
                    target
                while (i--) {
                    target = delegator.targets[i]
                    if (target.el.contains(e.target) && target.handler) {
                        target.handler(e)
                    }
                }
            }
        }
        this.el.addEventListener(event, delegator.handler)
    }
    delegator.targets.push(listener)
}

/**
 *  Remove an event delegation listener
 */
CompilerProto.removeListener = function (listener) {
    var targets = this.delegators[listener.arg].targets
    targets.splice(targets.indexOf(listener), 1)
}

/**
 *  Do a one-time eval of a string that potentially
 *  includes bindings.
 */
CompilerProto.eval = function (exp) {
    var tokens = TextParser.parse(exp)
    if (!tokens) { // no bindings
        return exp
    } else {
        var token, getter,
            i = -1,
            l = tokens.length,
            res = ''
        while (++i < l) {
            token = tokens[i]
            if (token.key) {
                getter = ExpParser.parse(token.key, this)
                if (getter) {
                    res += utils.toText(getter.call(this.vm))
                }
            } else {
                res += token
            }
        }
        return res
    }
}

/**
 *  Unbind and remove element
 */
CompilerProto.destroy = function () {

    // avoid being called more than once
    // this is irreversible!
    if (this.destroyed) return

    var compiler = this,
        i, key, dir, dirs, binding,
        vm          = compiler.vm,
        el          = compiler.el,
        directives  = compiler.dirs,
        exps        = compiler.exps,
        bindings    = compiler.bindings,
        delegators  = compiler.delegators,
        children    = compiler.children,
        parent      = compiler.parent

    compiler.execHook('beforeDestroy')

    // unobserve data
    Observer.unobserve(compiler.data, '', compiler.observer)

    // unbind all direcitves
    i = directives.length
    while (i--) {
        dir = directives[i]
        // if this directive is an instance of an external binding
        // e.g. a directive that refers to a variable on the parent VM
        // we need to remove it from that binding's directives
        // * empty and literal bindings do not have binding.
        if (dir.binding && dir.binding.compiler !== compiler) {
            dirs = dir.binding.dirs
            if (dirs) dirs.splice(dirs.indexOf(dir), 1)
        }
        dir.unbind()
    }

    // unbind all expressions (anonymous bindings)
    i = exps.length
    while (i--) {
        exps[i].unbind()
    }

    // unbind all own bindings
    for (key in bindings) {
        binding = bindings[key]
        if (binding) {
            binding.unbind()
        }
    }

    // remove all event delegators
    for (key in delegators) {
        el.removeEventListener(key, delegators[key].handler)
    }

    // destroy all children
    i = children.length
    while (i--) {
        children[i].destroy()
    }

    // remove self from parent
    if (parent) {
        parent.children.splice(parent.children.indexOf(compiler), 1)
    }

    // finally remove dom element
    if (el === document.body) {
        el.innerHTML = ''
    } else {
        vm.$remove()
    }
    el.vue_vm = null

    this.destroyed = true
    // emit destroy hook
    compiler.execHook('afterDestroy')

    // finally, unregister all listeners
    compiler.observer.off()
    compiler.emitter.off()
}

// Helpers --------------------------------------------------------------------

/**
 *  shorthand for getting root compiler
 */
function getRoot (compiler) {
    while (compiler.parent) {
        compiler = compiler.parent
    }
    return compiler
}

/**
 *  for convenience & minification
 */
function defGetSet (obj, key, def) {
    Object.defineProperty(obj, key, def)
}

module.exports = Compiler