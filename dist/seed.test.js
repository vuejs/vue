
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("seed/src/main.js", function(exports, require, module){
var config      = require('./config'),
    ViewModel   = require('./viewmodel'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    utils       = require('./utils')

/**
 *  Set config options
 */
ViewModel.config = function (opts) {
    if (opts) {
        utils.extend(config, opts)
    }
    return this
}

/**
 *  Allows user to register/retrieve a directive definition
 */
ViewModel.directive = function (id, fn) {
    if (!fn) return directives[id]
    directives[id] = fn
    return this
}

/**
 *  Allows user to register/retrieve a filter function
 */
ViewModel.filter = function (id, fn) {
    if (!fn) return filters[id]
    filters[id] = fn
    return this
}

/**
 *  Allows user to register/retrieve a ViewModel constructor
 */
ViewModel.viewmodel = function (id, Ctor) {
    if (!Ctor) return utils.viewmodels[id]
    utils.viewmodels[id] = Ctor
    return this
}

/**
 *  Allows user to register/retrieve a template partial
 */
ViewModel.partial = function (id, partial) {
    if (!partial) return utils.partials[id]
    utils.partials[id] = utils.templateToFragment(partial)
    return this
}

/**
 *  Allows user to register/retrieve a transition definition object
 */
ViewModel.transition = function (id, transition) {
    if (!transition) return utils.transitions[id]
    utils.transitions[id] = transition
    return this
}

ViewModel.extend = extend

/**
 *  Expose the main ViewModel class
 *  and add extend method
 */
function extend (options) {
    var ParentVM = this
    // inherit options
    options = inheritOptions(options, ParentVM.options, true)
    var ExtendedVM = function (opts) {
        opts = inheritOptions(opts, options, true)
        ParentVM.call(this, opts)
    }
    // inherit prototype props
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)
    utils.defProtected(proto, 'constructor', ExtendedVM)
    // copy prototype props
    var protoMixins = options.proto
    if (protoMixins) {
        for (var key in protoMixins) {
            if (!(key in ViewModel.prototype)) {
                proto[key] = protoMixins[key]
            }
        }
    }
    // convert template to documentFragment
    if (options.template) {
        options.templateFragment = utils.templateToFragment(options.template)
    }
    // allow extended VM to be further extended
    ExtendedVM.extend = extend
    ExtendedVM.super = ParentVM
    ExtendedVM.options = options
    return ExtendedVM
}

/**
 *  Inherit options
 *
 *  For options such as `scope`, `vms`, `directives`, 'partials',
 *  they should be further extended. However extending should only
 *  be done at top level.
 *  
 *  `proto` is an exception because it's handled directly on the
 *  prototype.
 *
 *  `el` is an exception because it's not allowed as an
 *  extension option, but only as an instance option.
 */
function inheritOptions (child, parent, topLevel) {
    child = child || utils.hash()
    if (!parent) return child
    for (var key in parent) {
        if (key === 'el' || key === 'proto') continue
        if (!child[key]) { // child has priority
            child[key] = parent[key]
        } else if (topLevel && utils.typeOf(child[key]) === 'Object') {
            inheritOptions(child[key], parent[key], false)
        }
    }
    return child
}

module.exports = ViewModel
});
require.register("seed/src/emitter.js", function(exports, require, module){
// shiv to make this work for Component, Browserify and Node at the same time.
var Emitter,
    componentEmitter = 'emitter'

try {
    // Requiring without a string literal will make browserify
    // unable to parse the dependency, thus preventing it from
    // stopping the compilation after a failed lookup.
    Emitter = require(componentEmitter)
} catch (e) {}

module.exports = Emitter || require('events').EventEmitter
});
require.register("seed/src/config.js", function(exports, require, module){
module.exports = {

    prefix      : 'sd',
    debug       : false
    
}
});
require.register("seed/src/utils.js", function(exports, require, module){
var config    = require('./config'),
    toString  = Object.prototype.toString,
    join      = Array.prototype.join,
    console   = window.console

/**
 *  Create a prototype-less object
 *  which is a better hash/map
 */
function makeHash () {
    return Object.create(null)
}

var utils = module.exports = {

    hash: makeHash,

    // global storage for user-registered
    // vms, partials and transitions
    viewmodels  : makeHash(),
    partials    : makeHash(),
    transitions : makeHash(),

    /**
     *  Define an ienumerable property
     *  This avoids it being included in JSON.stringify
     *  or for...in loops.
     */
    defProtected: function (obj, key, val, enumerable, configurable) {
        if (obj.hasOwnProperty(key)) return
        Object.defineProperty(obj, key, {
            value        : val,
            enumerable   : !!enumerable,
            configurable : !!configurable
        })
    },

    /**
     *  Accurate type check
     *  internal use only, so no need to check for NaN
     */
    typeOf: function (obj) {
        return toString.call(obj).slice(8, -1)
    },

    /**
     *  Make sure only strings and numbers are output to html
     *  output empty string is value is not string or number
     */
    toText: function (value) {
        /* jshint eqeqeq: false */
        return (typeof value === 'string' ||
            typeof value === 'boolean' ||
            (typeof value === 'number' && value == value)) // deal with NaN
            ? value
            : ''
    },

    /**
     *  simple extend
     */
    extend: function (obj, ext, protective) {
        for (var key in ext) {
            if (protective && obj[key]) continue
            obj[key] = ext[key]
        }
    },

    /**
     *  Convert an object of partial strings
     *  to domFragments
     */
    convertPartials: function (partials) {
        if (!partials) return
        for (var key in partials) {
            if (typeof partials[key] === 'string') {
                partials[key] = utils.templateToFragment(partials[key])
            }
        }
    },

    /**
     *  Convert a string template to a dom fragment
     */
    templateToFragment: function (template) {
        if (template.charAt(0) === '#') {
            var templateNode = document.getElementById(template.slice(1))
            if (!templateNode) return
            template = templateNode.innerHTML
        }
        var node = document.createElement('div'),
            frag = document.createDocumentFragment(),
            child
        node.innerHTML = template.trim()
        /* jshint boss: true */
        while (child = node.firstChild) {
            frag.appendChild(child)
        }
        return frag
    },

    /**
     *  log for debugging
     */
    log: function () {
        if (config.debug && console) {
            console.log(join.call(arguments, ' '))
        }
    },
    
    /**
     *  warn for debugging
     */
    warn: function() {
        if (config.debug && console) {
            console.warn(join.call(arguments, ' '))
        }
    }
}
});
require.register("seed/src/compiler.js", function(exports, require, module){
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
    slice       = Array.prototype.slice,
    log         = utils.log,
    def         = utils.defProtected,
    makeHash    = utils.hash,
    hasOwn      = Object.prototype.hasOwnProperty,

    // special directives
    idAttr,
    vmAttr,
    preAttr,
    repeatAttr,
    partialAttr,
    transitionAttr


/**
 *  The DOM compiler
 *  scans a DOM node and compile bindings for a ViewModel
 */
function Compiler (vm, options) {

    refreshPrefix()

    var compiler = this

    // extend options
    options = compiler.options = options || makeHash()
    utils.extend(compiler, options.compilerOptions)
    utils.convertPartials(options.partials)

    // initialize element
    compiler.setupElement(options)
    log('\nnew VM instance:', compiler.el.tagName, '\n')

    // copy scope properties to vm
    var scope = options.scope
    if (scope) utils.extend(vm, scope, true)

    compiler.vm  = vm
    // special VM properties are inumerable
    def(vm, '$', makeHash())
    def(vm, '$el', compiler.el)
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

    // register child id on parent
    var childId = compiler.el.getAttribute(idAttr)
    if (childId && parent) {
        compiler.childId = childId
        parent.vm.$[childId] = vm
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
        def(vm[compiler.repeatPrefix], '$index', compiler.repeatIndex, false, true)
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
    if (node.nodeType === 1) {
        // a normal node
        if (node.hasAttribute(preAttr)) return
        var vmId       = node.getAttribute(vmAttr),
            repeatExp  = node.getAttribute(repeatAttr),
            partialId  = node.getAttribute(partialAttr)
        // we need to check for any possbile special directives
        // e.g. sd-repeat, sd-viewmodel & sd-partial
        if (repeatExp) { // repeat block
            // repeat block cannot have sd-id at the same time.
            node.removeAttribute(idAttr)
            var directive = Directive.parse(repeatAttr, repeatExp, compiler, node)
            if (directive) {
                compiler.bindDirective(directive)
            }
        } else if (vmId && !root) { // child ViewModels
            node.removeAttribute(vmAttr)
            var ChildVM = compiler.getOption('viewmodels', vmId)
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
        binding = compiler.createBinding(key, true)
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
            var i = result.paths.length, v
            while (i--) {
                v = result.paths[i]
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
    value.get = value.get.bind(vm)
    if (value.set) value.set = value.set.bind(vm)
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
        if (!dir.isSimple && dir.binding.compiler !== compiler) {
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
    // remove el
    if (el === document.body) {
        el.innerHTML = ''
    } else if (el.parentNode) {
        el.parentNode.removeChild(el)
    }
}

// Helpers --------------------------------------------------------------------

/**
 *  Refresh prefix in case it has been changed
 *  during compilations
 */
function refreshPrefix () {
    var prefix     = config.prefix
    idAttr         = prefix + '-id'
    vmAttr         = prefix + '-viewmodel'
    preAttr        = prefix + '-pre'
    repeatAttr     = prefix + '-repeat'
    partialAttr    = prefix + '-partial'
    transitionAttr = prefix + '-transition'
}

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
});
require.register("seed/src/viewmodel.js", function(exports, require, module){
var Compiler = require('./compiler'),
    def      = require('./utils').defProtected

/**
 *  ViewModel exposed to the user that holds data,
 *  computed properties, event handlers
 *  and a few reserved methods
 */
function ViewModel (options) {
    // just compile. options are passed directly to compiler
    new Compiler(this, options)
}

// All VM prototype methods are inenumerable
// so it can be stringified/looped through as raw data
var VMProto = ViewModel.prototype

/**
 *  Convenience function to set an actual nested value
 *  from a flat key string. Used in directives.
 */
def(VMProto, '$set', function (key, value) {
    var path = key.split('.'),
        obj = getTargetVM(this, path)
    if (!obj) return
    for (var d = 0, l = path.length - 1; d < l; d++) {
        obj = obj[path[d]]
    }
    obj[path[d]] = value
})

/**
 *  The function for getting a key
 *  which will go up along the prototype chain of the bindings
 *  Used in exp-parser.
 */
def(VMProto, '$get', function (key) {
    var path = key.split('.'),
        obj = getTargetVM(this, path),
        vm = obj
    if (!obj) return
    for (var d = 0, l = path.length; d < l; d++) {
        obj = obj[path[d]]
    }
    if (typeof obj === 'function') obj = obj.bind(vm)
    return obj
})

/**
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
def(VMProto, '$watch', function (key, callback) {
    this.$compiler.observer.on('change:' + key, callback)
})

/**
 *  unwatch a key
 */
def(VMProto, '$unwatch', function (key, callback) {
    // workaround here
    // since the emitter module checks callback existence
    // by checking the length of arguments
    var args = ['change:' + key],
        ob = this.$compiler.observer
    if (callback) args.push(callback)
    ob.off.apply(ob, args)
})

/**
 *  unbind everything, remove everything
 */
def(VMProto, '$destroy', function () {
    this.$compiler.destroy()
})

/**
 *  broadcast an event to all child VMs recursively.
 */
def(VMProto, '$broadcast', function () {
    var children = this.$compiler.childCompilers,
        i = children.length,
        child
    while (i--) {
        child = children[i]
        child.emitter.emit.apply(child.emitter, arguments)
        child.vm.$broadcast.apply(child.vm, arguments)
    }
})

/**
 *  emit an event that propagates all the way up to parent VMs.
 */
def(VMProto, '$emit', function () {
    var parent = this.$compiler.parentCompiler
    if (parent) {
        parent.emitter.emit.apply(parent.emitter, arguments)
        parent.vm.$emit.apply(parent.vm, arguments)
    }
})

/**
 *  delegate on/off/once to the compiler's emitter
 */
;['on', 'off', 'once'].forEach(function (method) {
    def(VMProto, '$' + method, function () {
        var emitter = this.$compiler.emitter
        emitter[method].apply(emitter, arguments)
    })
})

/**
 *  If a VM doesn't contain a path, go up the prototype chain
 *  to locate the ancestor that has it.
 */
function getTargetVM (vm, path) {
    var baseKey = path[0],
        binding = vm.$compiler.bindings[baseKey]
    return binding
        ? binding.compiler.vm
        : null
}

module.exports = ViewModel
});
require.register("seed/src/binding.js", function(exports, require, module){
/**
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (compiler, key, isExp) {
    this.value = undefined
    this.isExp = !!isExp
    this.root = !this.isExp && key.indexOf('.') === -1
    this.compiler = compiler
    this.key = key
    this.instances = []
    this.subs = []
    this.deps = []
}

var BindingProto = Binding.prototype

/**
 *  Process the value, then trigger updates on all dependents
 */
BindingProto.update = function (value) {
    this.value = value
    var i = this.instances.length
    while (i--) {
        this.instances[i].update(value)
    }
    this.pub()
}

/**
 *  -- computed property only --    
 *  Force all instances to re-evaluate themselves
 */
BindingProto.refresh = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].refresh()
    }
    this.pub()
}

/**
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].refresh()
    }
}

/**
 *  Unbind the binding, remove itself from all of its dependencies
 */
BindingProto.unbind = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].unbind()
    }
    i = this.deps.length
    var subs
    while (i--) {
        subs = this.deps[i].subs
        subs.splice(subs.indexOf(this), 1)
    }
}

module.exports = Binding
});
require.register("seed/src/observer.js", function(exports, require, module){
/* jshint proto:true */

var Emitter  = require('./emitter'),
    utils    = require('./utils'),

    // cache methods
    typeOf   = utils.typeOf,
    def      = utils.defProtected,
    slice    = Array.prototype.slice,

    // Array mutation methods to wrap
    methods  = ['push','pop','shift','unshift','splice','sort','reverse'],

    // fix for IE + __proto__ problem
    // define methods as inenumerable if __proto__ is present,
    // otherwise enumerable so we can loop through and manually
    // attach to array instances
    hasProto = ({}).__proto__

// The proxy prototype to replace the __proto__ of
// an observed array
var ArrayProxy = Object.create(Array.prototype)

// Define mutation interceptors so we can emit the mutation info
methods.forEach(function (method) {
    def(ArrayProxy, method, function () {
        var result = Array.prototype[method].apply(this, arguments)
        this.__observer__.emit('mutate', this.__observer__.path, this, {
            method: method,
            args: slice.call(arguments),
            result: result
        })
        return result
    }, !hasProto)
})

// Augment it with several convenience methods
var extensions = {
    remove: function (index) {
        if (typeof index !== 'number') index = this.indexOf(index)
        return this.splice(index, 1)[0]
    },
    replace: function (index, data) {
        if (typeof index !== 'number') index = this.indexOf(index)
        if (this[index] !== undefined) return this.splice(index, 1, data)[0]
    },
    mutateFilter: function (fn) {
        var i = this.length
        while (i--) {
            if (!fn(this[i])) this.splice(i, 1)
        }
        return this
    }
}

for (var method in extensions) {
    def(ArrayProxy, method, extensions[method], !hasProto)
}

/**
 *  Watch an object based on type
 */
function watch (obj, path, observer) {
    var type = typeOf(obj)
    if (type === 'Object') {
        watchObject(obj, path, observer)
    } else if (type === 'Array') {
        watchArray(obj, path, observer)
    }
}

/**
 *  Watch an Object, recursive.
 */
function watchObject (obj, path, observer) {
    for (var key in obj) {
        var keyPrefix = key.charAt(0)
        if (keyPrefix !== '$' && keyPrefix !== '_') {
            bind(obj, key, path, observer)
        }
    }
    // $index is inenumerable
    if (obj.$index !== undefined) {
        bind(obj, '$index', path, observer)
    }
}

/**
 *  Watch an Array, overload mutation methods
 *  and add augmentations by intercepting the prototype chain
 */
function watchArray (arr, path, observer) {
    def(arr, '__observer__', observer)
    observer.path = path
    if (hasProto) {
        arr.__proto__ = ArrayProxy
    } else {
        for (var key in ArrayProxy) {
            def(arr, key, ArrayProxy[key])
        }
    }
}

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
function bind (obj, key, path, observer) {
    var val       = obj[key],
        watchable = isWatchable(val),
        values    = observer.values,
        fullKey   = (path ? path + '.' : '') + key
    values[fullKey] = val
    // emit set on bind
    // this means when an object is observed it will emit
    // a first batch of set events.
    observer.emit('set', fullKey, val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        get: function () {
            // only emit get on tip values
            if (!watchable) observer.emit('get', fullKey)
            return values[fullKey]
        },
        set: function (newVal) {
            values[fullKey] = newVal
            observer.emit('set', fullKey, newVal)
            watch(newVal, fullKey, observer)
        }
    })
    watch(val, fullKey, observer)
}

/**
 *  Check if a value is watchable
 */
function isWatchable (obj) {
    var type = typeOf(obj)
    return type === 'Object' || type === 'Array'
}

/**
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
function emitSet (obj, observer) {
    if (typeOf(obj) === 'Array') {
        observer.emit('set', 'length', obj.length)
    } else {
        var key, val, values = observer.values
        for (key in observer.values) {
            val = values[key]
            observer.emit('set', key, val)
        }
    }
}

module.exports = {

    // used in sd-repeat
    watchArray: watchArray,

    /**
     *  Observe an object with a given path,
     *  and proxy get/set/mutate events to the provided observer.
     */
    observe: function (obj, rawPath, observer) {
        if (isWatchable(obj)) {
            var path = rawPath + '.',
                ob, alreadyConverted = !!obj.__observer__
            if (!alreadyConverted) {
                def(obj, '__observer__', new Emitter())
            }
            ob = obj.__observer__
            ob.values = ob.values || utils.hash()
            var proxies = observer.proxies[path] = {
                get: function (key) {
                    observer.emit('get', path + key)
                },
                set: function (key, val) {
                    observer.emit('set', path + key, val)
                },
                mutate: function (key, val, mutation) {
                    // if the Array is a root value
                    // the key will be null
                    var fixedPath = key ? path + key : rawPath
                    observer.emit('mutate', fixedPath, val, mutation)
                    // also emit set for Array's length when it mutates
                    var m = mutation.method
                    if (m !== 'sort' && m !== 'reverse') {
                        observer.emit('set', fixedPath + '.length', val.length)
                    }
                }
            }
            ob
                .on('get', proxies.get)
                .on('set', proxies.set)
                .on('mutate', proxies.mutate)
            if (alreadyConverted) {
                emitSet(obj, ob, rawPath)
            } else {
                watch(obj, null, ob)
            }
        }
    },

    /**
     *  Cancel observation, turn off the listeners.
     */
    unobserve: function (obj, path, observer) {
        if (!obj || !obj.__observer__) return
        path = path + '.'
        var proxies = observer.proxies[path]
        obj.__observer__
            .off('get', proxies.get)
            .off('set', proxies.set)
            .off('mutate', proxies.mutate)
        observer.proxies[path] = null
    }
}
});
require.register("seed/src/directive.js", function(exports, require, module){
var config     = require('./config'),
    utils      = require('./utils'),
    directives = require('./directives'),
    filters    = require('./filters'),

    // Regexes!
    KEY_RE          = /^[^\|]+/,
    ARG_RE          = /([^:]+):(.+)$/,
    FILTERS_RE      = /\|[^\|]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    NESTING_RE      = /^\^+/,
    SINGLE_VAR_RE   = /^[\w\.\$]+$/

/**
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (definition, expression, rawKey, compiler, node) {

    this.compiler = compiler
    this.vm       = compiler.vm
    this.el       = node

    var isSimple  = expression === ''

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this[isSimple ? 'bind' : '_update'] = definition
    } else {
        for (var prop in definition) {
            if (prop === 'unbind' || prop === 'update') {
                this['_' + prop] = definition[prop]
            } else {
                this[prop] = definition[prop]
            }
        }
    }

    // empty expression, we're done.
    if (isSimple) {
        this.isSimple = true
        return
    }

    this.expression = expression.trim()
    this.rawKey     = rawKey
    
    parseKey(this, rawKey)

    this.isExp = !SINGLE_VAR_RE.test(this.key)
    
    var filterExps = expression.match(FILTERS_RE)
    if (filterExps) {
        this.filters = []
        var i = 0, l = filterExps.length, filter
        for (; i < l; i++) {
            filter = parseFilter(filterExps[i], this.compiler)
            if (filter) this.filters.push(filter)
        }
        if (!this.filters.length) this.filters = null
    } else {
        this.filters = null
    }
}

var DirProto = Directive.prototype

/**
 *  parse a key, extract argument and nesting/root info
 */
function parseKey (dir, rawKey) {

    var argMatch = rawKey.match(ARG_RE)

    var key = argMatch
        ? argMatch[2].trim()
        : rawKey.trim()

    dir.arg = argMatch
        ? argMatch[1].trim()
        : null

    var nesting = key.match(NESTING_RE)
    dir.nesting = nesting
        ? nesting[0].length
        : false

    dir.root = key.charAt(0) === '$'

    if (dir.nesting) {
        key = key.replace(NESTING_RE, '')
    } else if (dir.root) {
        key = key.slice(1)
    }

    dir.key = key
}

/**
 *  parse a filter expression
 */
function parseFilter (filter, compiler) {

    var tokens = filter.slice(1).match(FILTER_TOKEN_RE)
    if (!tokens) return
    tokens = tokens.map(function (token) {
        return token.replace(/'/g, '').trim()
    })

    var name = tokens[0],
        apply = compiler.getOption('filters', name) || filters[name]
    if (!apply) {
        utils.warn('Unknown filter: ' + name)
        return
    }

    return {
        name  : name,
        apply : apply,
        args  : tokens.length > 1
                ? tokens.slice(1)
                : null
    }
}

/**
 *  called when a new value is set 
 *  for computed properties, this will only be called once
 *  during initialization.
 */
DirProto.update = function (value, init) {
    if (!init && value === this.value) return
    this.value = value
    this.apply(value)
}

/**
 *  -- computed property only --
 *  called when a dependency has changed
 */
DirProto.refresh = function (value) {
    // pass element and viewmodel info to the getter
    // enables context-aware bindings
    if (value) this.value = value
    value = this.value.get({
        el: this.el,
        vm: this.vm
    })
    if (value && value === this.computedValue) return
    this.computedValue = value
    this.apply(value)
}

/**
 *  Actually invoking the _update from the directive's definition
 */
DirProto.apply = function (value) {
    this._update(
        this.filters
        ? this.applyFilters(value)
        : value
    )
}

/**
 *  pipe the value through filters
 */
DirProto.applyFilters = function (value) {
    var filtered = value, filter
    for (var i = 0, l = this.filters.length; i < l; i++) {
        filter = this.filters[i]
        filtered = filter.apply(filtered, filter.args)
    }
    return filtered
}

/**
 *  Unbind diretive
 *  @ param {Boolean} update
 *    Sometimes we call unbind before an update (i.e. not destroy)
 *    just to teardown previous stuff, in that case we do not want
 *    to null everything.
 */
DirProto.unbind = function (update) {
    // this can be called before the el is even assigned...
    if (!this.el) return
    if (this._unbind) this._unbind(update)
    if (!update) this.vm = this.el = this.binding = this.compiler = null
}

/**
 *  make sure the directive and expression is valid
 *  before we create an instance
 */
Directive.parse = function (dirname, expression, compiler, node) {

    var prefix = config.prefix
    if (dirname.indexOf(prefix) === -1) return
    dirname = dirname.slice(prefix.length + 1)

    var dir = compiler.getOption('directives', dirname) || directives[dirname]
    if (!dir) return utils.warn('unknown directive: ' + dirname)

    var keyMatch = expression.match(KEY_RE),
        rawKey = keyMatch && keyMatch[0].trim()
    // have a valid raw key, or be an empty directive
    return (rawKey || expression === '')
        ? new Directive(dir, expression, rawKey, compiler, node)
        : utils.warn('invalid directive expression: ' + expression)
}

module.exports = Directive
});
require.register("seed/src/exp-parser.js", function(exports, require, module){
// Variable extraction scooped from https://github.com/RubyLouvre/avalon

var KEYWORDS =
        // keywords
        'break,case,catch,continue,debugger,default,delete,do,else,false'
        + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
        + ',throw,true,try,typeof,var,void,while,with'
        // reserved
        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
        + ',final,float,goto,implements,import,int,interface,long,native'
        + ',package,private,protected,public,short,static,super,synchronized'
        + ',throws,transient,volatile'
        // ECMA 5 - use strict
        + ',arguments,let,yield'
        + ',undefined',
    KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g'),
    REMOVE_RE   = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g,
    SPLIT_RE    = /[^\w$]+/g,
    NUMBER_RE   = /\b\d[^,]*/g,
    BOUNDARY_RE = /^,+|,+$/g

/**
 *  Strip top level variable names from a snippet of JS expression
 */
function getVariables (code) {
    code = code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
    return code
        ? code.split(/,+/)
        : []
}

/**
 *  Based on top level variables, extract full keypaths accessed.
 *  We need full paths because we need to define them in the compiler's
 *  bindings, so that they emit 'get' events during dependency tracking.
 */
function getPaths (code, vars) {
    var pathRE = new RegExp("\\b(" + vars.join('|') + ")[$\\w\\.]*\\b", 'g')
    return code.match(pathRE)
}

module.exports = {

    /**
     *  Parse and return an anonymous computed property getter function
     *  from an arbitrary expression, together with a list of paths to be
     *  created as bindings.
     */
    parse: function (exp) {
        // extract variable names
        var vars = getVariables(exp)
        if (!vars.length) return null
        var args = [],
            v, i, keyPrefix,
            l = vars.length,
            hash = Object.create(null)
        for (i = 0; i < l; i++) {
            v = vars[i]
            // avoid duplicate keys
            if (hash[v]) continue
            hash[v] = v
            // push assignment
            keyPrefix = v.charAt(0)
            args.push(v + (
                (keyPrefix === '$' || keyPrefix === '_')
                    ? '=this.' + v
                    : '=this.$get("' + v + '")'
                ))
        }
        args = 'var ' + args.join(',') + ';return ' + exp
        /* jshint evil: true */
        return {
            getter: new Function(args),
            paths: getPaths(exp, Object.keys(hash))
        }
    }
}
});
require.register("seed/src/text-parser.js", function(exports, require, module){
var BINDING_RE = /\{\{(.+?)\}\}/

module.exports = {

    /**
     *  Parse a piece of text, return an array of tokens
     */
    parse: function (text) {
        if (!BINDING_RE.test(text)) return null
        var m, i, tokens = []
        /* jshint boss: true */
        while (m = text.match(BINDING_RE)) {
            i = m.index
            if (i > 0) tokens.push(text.slice(0, i))
            tokens.push({ key: m[1].trim() })
            text = text.slice(i + m[0].length)
        }
        if (text.length) tokens.push(text)
        return tokens
    }
    
}
});
require.register("seed/src/deps-parser.js", function(exports, require, module){
var Emitter  = require('./emitter'),
    utils    = require('./utils'),
    observer = new Emitter()

/**
 *  Auto-extract the dependencies of a computed property
 *  by recording the getters triggered when evaluating it.
 */
function catchDeps (binding) {
    utils.log('\n─ ' + binding.key)
    var depsHash = utils.hash()
    observer.on('get', function (dep) {
        if (depsHash[dep.key]) return
        depsHash[dep.key] = 1
        utils.log('  └─ ' + dep.key)
        binding.deps.push(dep)
        dep.subs.push(binding)
    })
    binding.value.get()
    observer.off('get')
}

module.exports = {

    /**
     *  the observer that catches events triggered by getters
     */
    observer: observer,

    /**
     *  parse a list of computed property bindings
     */
    parse: function (bindings) {
        utils.log('\nparsing dependencies...')
        observer.isObserving = true
        bindings.forEach(catchDeps)
        observer.isObserving = false
        utils.log('\ndone.')
    }
    
}
});
require.register("seed/src/filters.js", function(exports, require, module){
var keyCodes = {
    enter    : 13,
    tab      : 9,
    'delete' : 46,
    up       : 38,
    left     : 37,
    right    : 39,
    down     : 40,
    esc      : 27
}

module.exports = {

    /**
     *  'abc' => 'Abc'
     */
    capitalize: function (value) {
        if (!value && value !== 0) return ''
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
    },

    /**
     *  'abc' => 'ABC'
     */
    uppercase: function (value) {
        return (value || value === 0)
            ? value.toString().toUpperCase()
            : ''
    },

    /**
     *  'AbC' => 'abc'
     */
    lowercase: function (value) {
        return (value || value === 0)
            ? value.toString().toLowerCase()
            : ''
    },

    /**
     *  12345 => $12,345.00
     */
    currency: function (value, args) {
        if (!value && value !== 0) return ''
        var sign = (args && args[0]) || '$',
            s = Math.floor(value).toString(),
            i = s.length % 3,
            h = i > 0 ? (s.slice(0, i) + (s.length > 3 ? ',' : '')) : '',
            f = '.' + value.toFixed(2).slice(-2)
        return sign + h + s.slice(i).replace(/(\d{3})(?=\d)/g, '$1,') + f
    },

    /**
     *  args: an array of strings corresponding to
     *  the single, double, triple ... forms of the word to
     *  be pluralized. When the number to be pluralized
     *  exceeds the length of the args, it will use the last
     *  entry in the array.
     *
     *  e.g. ['single', 'double', 'triple', 'multiple']
     */
    pluralize: function (value, args) {
        return args.length > 1
            ? (args[value - 1] || args[args.length - 1])
            : (args[value - 1] || args[0] + 's')
    },

    /**
     *  A special filter that takes a handler function,
     *  wraps it so it only gets triggered on specific keypresses.
     */
    key: function (handler, args) {
        if (!handler) return
        var code = keyCodes[args[0]]
        if (!code) {
            code = parseInt(args[0], 10)
        }
        return function (e) {
            if (e.keyCode === code) {
                handler.call(this, e)
            }
        }
    }
}
});
require.register("seed/src/directives/index.js", function(exports, require, module){
var utils = require('../utils')

module.exports = {

    on     : require('./on'),
    repeat : require('./repeat'),
    model  : require('./model'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent = utils.toText(value)
    },

    html: function (value) {
        this.el.innerHTML = utils.toText(value)
    },

    style: {
        bind: function () {
            this.arg = convertCSSProperty(this.arg)
        },
        update: function (value) {
            this.el.style[this.arg] = value
        }
    },

    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },

    visible: function (value) {
        this.el.style.visibility = value ? '' : 'hidden'
    },

    'class': function (value) {
        if (this.arg) {
            this.el.classList[value ? 'add' : 'remove'](this.arg)
        } else {
            if (this.lastVal) {
                this.el.classList.remove(this.lastVal)
            }
            this.el.classList.add(value)
            this.lastVal = value
        }
    },

    'if': {
        bind: function () {
            this.parent = this.el.parentNode
            this.ref = document.createComment('sd-if-' + this.key)
        },
        update: function (value) {
            var attached = !!this.el.parentNode
            if (!this.parent) { // the node was detached when bound
                if (!attached) {
                    return
                } else {
                    this.parent = this.el.parentNode
                }
            }
            // should always have this.parent if we reach here
            if (!value) {
                if (attached) {
                    // insert the reference node
                    var next = this.el.nextSibling
                    if (next) {
                        this.parent.insertBefore(this.ref, next)
                    } else {
                        this.parent.appendChild(this.ref)
                    }
                    this.parent.removeChild(this.el)
                }
            } else if (!attached) {
                this.parent.insertBefore(this.el, this.ref)
                this.parent.removeChild(this.ref)
            }
        }
    }
}

/**
 *  convert hyphen style CSS property to Camel style
 */
var CONVERT_RE = /-(.)/g
function convertCSSProperty (prop) {
    if (prop.charAt(0) === '-') prop = prop.slice(1)
    return prop.replace(CONVERT_RE, function (m, char) {
        return char.toUpperCase()
    })
}
});
require.register("seed/src/directives/repeat.js", function(exports, require, module){
var config   = require('../config'),
    Observer = require('../observer'),
    Emitter  = require('../emitter'),
    utils    = require('../utils'),
    ViewModel // lazy def to avoid circular dependency

/**
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var i, l = m.args.length,
            base = this.collection.length - l
        for (i = 0; i < l; i++) {
            this.buildItem(m.args[i], base + i)
        }
    },

    pop: function () {
        var vm = this.vms.pop()
        if (vm) vm.$destroy()
    },

    unshift: function (m) {
        var i, l = m.args.length
        for (i = 0; i < l; i++) {
            this.buildItem(m.args[i], i)
        }
    },

    shift: function () {
        var vm = this.vms.shift()
        if (vm) vm.$destroy()
    },

    splice: function (m) {
        var i, l,
            index = m.args[0],
            removed = m.args[1],
            added = m.args.length - 2,
            removedVMs = this.vms.splice(index, removed)
        for (i = 0, l = removedVMs.length; i < l; i++) {
            removedVMs[i].$destroy()
        }
        for (i = 0; i < added; i++) {
            this.buildItem(m.args[i + 2], index + i)
        }
    },

    sort: function () {
        var key = this.arg,
            vms = this.vms,
            col = this.collection,
            l = col.length,
            sorted = new Array(l),
            i, j, vm, data
        for (i = 0; i < l; i++) {
            data = col[i]
            for (j = 0; j < l; j++) {
                vm = vms[j]
                if (vm[key] === data) {
                    sorted[i] = vm
                    break
                }
            }
        }
        for (i = 0; i < l; i++) {
            this.container.insertBefore(sorted[i].$el, this.ref)
        }
        this.vms = sorted
    },

    reverse: function () {
        var vms = this.vms
        vms.reverse()
        for (var i = 0, l = vms.length; i < l; i++) {
            this.container.insertBefore(vms[i].$el, this.ref)
        }
    }
}

module.exports = {

    bind: function () {
        this.el.removeAttribute(config.prefix + '-repeat')
        var ctn = this.container = this.el.parentNode
        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment('sd-repeat-' + this.arg)
        ctn.insertBefore(this.ref, this.el)
        ctn.removeChild(this.el)
        this.collection = null
        this.vms = null
        var self = this
        this.mutationListener = function (path, arr, mutation) {
            self.detach()
            var method = mutation.method
            mutationHandlers[method].call(self, mutation)
            if (method !== 'push' && method !== 'pop') {
                self.updateIndexes()
            }
            self.retach()
        }
    },

    update: function (collection) {

        this.unbind(true)
        // attach an object to container to hold handlers
        this.container.sd_dHandlers = utils.hash()
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.collection && !collection.length) {
            this.buildItem()
        }
        this.collection = collection
        this.vms = []

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        if (!collection.__observer__) Observer.watchArray(collection, null, new Emitter())
        collection.__observer__.on('mutate', this.mutationListener)

        // create child-seeds and append to DOM
        this.detach()
        for (var i = 0, l = collection.length; i < l; i++) {
            this.buildItem(collection[i], i)
        }
        this.retach()
    },

    /**
     *  Create a new child VM from a data object
     *  passing along compiler options indicating this
     *  is a sd-repeat item.
     */
    buildItem: function (data, index) {

        // late def
        ViewModel   = ViewModel || require('../viewmodel')

        var node    = this.el.cloneNode(true),
            ctn     = this.container,
            vmAttr  = config.prefix + '-viewmodel',
            vmID    = node.getAttribute(vmAttr),
            ChildVM = this.compiler.getOption('viewmodels', vmID) || ViewModel,
            scope   = {},
            ref, item

        if (vmID) node.removeAttribute(vmAttr)

        // append node into DOM first
        // so sd-if can get access to parentNode
        if (data) {
            ref = this.vms.length > index
                ? this.vms[index].$el
                : this.ref
            ctn.insertBefore(node, ref)
        }

        // set data on scope and compile
        scope[this.arg] = data || {}
        item = new ChildVM({
            el: node,
            scope: scope,
            compilerOptions: {
                repeat: true,
                repeatIndex: index,
                repeatPrefix: this.arg,
                parentCompiler: this.compiler,
                delegator: ctn
            }
        })

        if (!data) {
            // this is a forced compile for an empty collection.
            // let's remove it...
            item.$destroy()
        } else {
            this.vms.splice(index, 0, item)
        }
    },

    /**
     *  Update index of each item after a mutation
     */
    updateIndexes: function () {
        var i = this.vms.length
        while (i--) {
            this.vms[i][this.arg].$index = i
        }
    },

    /**
     *  Detach/retach the container from the DOM before mutation
     *  so that batch DOM updates are done in-memory and faster
     */
    detach: function () {
        var c = this.container,
            p = this.parent = c.parentNode
        this.next = c.nextSibling
        if (p) p.removeChild(c)
    },

    retach: function () {
        var n = this.next,
            p = this.parent,
            c = this.container
        if (!p) return
        if (n) {
            p.insertBefore(c, n)
        } else {
            p.appendChild(c)
        }
    },

    unbind: function () {
        if (this.collection) {
            this.collection.__observer__.off('mutate', this.mutationListener)
            var i = this.vms.length
            while (i--) {
                this.vms[i].$destroy()
            }
        }
        var ctn = this.container,
            handlers = ctn.sd_dHandlers
        for (var key in handlers) {
            ctn.removeEventListener(handlers[key].event, handlers[key])
        }
        ctn.sd_dHandlers = null
    }
}
});
require.register("seed/src/directives/on.js", function(exports, require, module){
var utils = require('../utils')

function delegateCheck (current, top, identifier) {
    if (current[identifier]) {
        return current
    } else if (current === top) {
        return false
    } else {
        return delegateCheck(current.parentNode, top, identifier)
    }
}

module.exports = {

    bind: function () {
        if (this.compiler.repeat) {
            // attach an identifier to the el
            // so it can be matched during event delegation
            this.el[this.expression] = true
            // attach the owner viewmodel of this directive
            this.el.sd_viewmodel = this.vm
        }
    },

    update: function (handler) {

        this.unbind(true)
        if (typeof handler !== 'function') {
            return utils.warn('Directive "on" expects a function value.')
        }

        var compiler = this.compiler,
            event    = this.arg,
            ownerVM  = this.binding.compiler.vm

        if (compiler.repeat &&
            // do not delegate if the repeat is combined with an extended VM
            !this.vm.constructor.super &&
            // blur and focus events do not bubble
            event !== 'blur' && event !== 'focus') {

            // for each blocks, delegate for better performance
            // focus and blur events dont bubble so exclude them
            var delegator  = compiler.delegator,
                identifier = this.expression,
                dHandler   = delegator.sd_dHandlers[identifier]

            if (dHandler) return

            // the following only gets run once for the entire each block
            dHandler = delegator.sd_dHandlers[identifier] = function (e) {
                var target = delegateCheck(e.target, delegator, identifier)
                if (target) {
                    e.el = target
                    e.vm = target.sd_viewmodel
                    e.item = e.vm[compiler.repeatPrefix]
                    handler.call(ownerVM, e)
                }
            }
            dHandler.event = event
            delegator.addEventListener(event, dHandler)

        } else {

            // a normal, single element handler
            var vm = this.vm
            this.handler = function (e) {
                e.el = e.currentTarget
                e.vm = vm
                if (compiler.repeat) {
                    e.item = vm[compiler.repeatPrefix]
                }
                handler.call(ownerVM, e)
            }
            this.el.addEventListener(event, this.handler)

        }
    },

    unbind: function (update) {
        this.el.removeEventListener(this.arg, this.handler)
        this.handler = null
        if (!update) this.el.sd_viewmodel = null
    }
}
});
require.register("seed/src/directives/model.js", function(exports, require, module){
var utils = require('../utils'),
    isIE  = !!document.attachEvent

module.exports = {

    bind: function () {

        var self = this,
            el   = self.el,
            type = el.type

        self.lock = false

        // determine what event to listen to
        self.event =
            (self.compiler.options.lazy ||
            el.tagName === 'SELECT' ||
            type === 'checkbox' ||
            type === 'radio')
                ? 'change'
                : 'input'

        // determin the attribute to change when updating
        var attr = type === 'checkbox'
            ? 'checked'
            : 'value'

        // attach listener
        self.set = function () {
            self.lock = true
            self.vm.$set(self.key, el[attr])
            self.lock = false
        }
        el.addEventListener(self.event, self.set)

        // fix shit for IE9
        // since it doesn't fire input on backspace / del / cut
        if (isIE) {
            el.addEventListener('cut', self.set)
            el.addEventListener('keydown', function (e) {
                if (e.keyCode === 46 || e.keyCode === 8) {
                    self.set()
                }
            })
        }
    },

    update: function (value) {
        /* jshint eqeqeq: false */
        var self = this,
            el   = self.el
        if (self.lock) return
        if (el.tagName === 'SELECT') { // select dropdown
            // setting <select>'s value in IE9 doesn't work
            var o = el.options,
                i = o.length,
                index = -1
            while (i--) {
                if (o[i].value == value) {
                    index = i
                    break
                }
            }
            o.selectedIndex = index
        } else if (el.type === 'radio') { // radio button
            el.checked = value == el.value
        } else if (el.type === 'checkbox') { // checkbox
            el.checked = !!value
        } else {
            el.value = utils.toText(value)
        }
    },

    unbind: function () {
        this.el.removeEventListener(this.event, this.set)
    }
}
});
require.alias("component-emitter/index.js", "seed/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("seed/src/main.js", "seed/index.js");