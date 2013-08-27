;(function(){

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
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
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
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
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
    textParser  = require('./text-parser'),
    utils       = require('./utils'),
    api         = {}

/*
 *  Allows user to create a custom directive
 */
api.directive = function (name, fn) {
    if (!fn) return directives[name]
    directives[name] = fn
}

/*
 *  Allows user to create a custom filter
 */
api.filter = function (name, fn) {
    if (!fn) return filters[name]
    filters[name] = fn
}

/*
 *  Set config options
 */
api.config = function (opts) {
    if (opts) utils.extend(config, opts)
    textParser.buildRegex()
}

/*
 *  Angular style bootstrap
 */
api.bootstrap = function (el) {
    el = (typeof el === 'string'
        ? document.querySelector(el)
        : el) || document.body
    var Ctor = ViewModel,
        vmAttr = config.prefix + '-viewmodel',
        vmExp = el.getAttribute(vmAttr)
    if (vmExp) {
        Ctor = utils.getVM(vmExp)
        el.removeAttribute(vmAttr)
    }
    return new Ctor({ el: el })
}

/*
 *  Expose the main ViewModel class
 *  and add extend method
 */
api.ViewModel = ViewModel

ViewModel.extend = function (options) {
    var ExtendedVM = function (opts) {
        opts = opts || {}
        if (options.init) {
            opts.init = options.init
        }
        ViewModel.call(this, opts)
    }
    var proto = ExtendedVM.prototype = Object.create(ViewModel.prototype)
    proto.constructor = ExtendedVM
    if (options.props) utils.extend(proto, options.props)
    if (options.id) {
        utils.registerVM(options.id, ExtendedVM)
    }
    return ExtendedVM
}

// collect templates on load
utils.collectTemplates()

module.exports = api
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
    debug       : false,

    interpolateTags : {
        open  : '{{',
        close : '}}'
    }
}
});
require.register("seed/src/utils.js", function(exports, require, module){
var config    = require('./config'),
    toString  = Object.prototype.toString,
    templates = {},
    VMs       = {}

module.exports = {

    typeOf: function (obj) {
        return toString.call(obj).slice(8, -1)
    },

    extend: function (obj, ext) {
        for (var key in ext) {
            obj[key] = ext[key]
        }
    },

    collectTemplates: function () {
        var selector = 'script[type="text/' + config.prefix + '-template"]',
            templates = document.querySelectorAll(selector),
            i = templates.length
        while (i--) {
            this.storeTemplate(templates[i])
        }
    },

    storeTemplate: function (template) {
        var id = template.getAttribute(config.prefix + '-template-id')
        if (id) {
            templates[id] = template.innerHTML.trim()
        }
        template.parentNode.removeChild(template)
    },

    getTemplate: function (id) {
        return templates[id]
    },

    registerVM: function (id, VM) {
        VMs[id] = VM
    },

    getVM: function (id) {
        return VMs[id]
    },

    log: function () {
        if (config.debug) console.log.apply(console, arguments)
        return this
    },
    
    warn: function() {
        if (config.debug) console.warn.apply(console, arguments)
        return this
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
    slice       = Array.prototype.slice,
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
    utils.extend(this, options)

    // copy data if any
    var data = options.data
    if (data) utils.extend(vm, data)

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
    // anonymous expression bindings that needs to be unbound during destroy()
    this.expressions = []

    // Store things during parsing to be processed afterwards,
    // because we want to have created all bindings before
    // observing values / parsing dependencies.
    var observables = this.observables = []
    var computed = this.computed = [] // computed props to parse deps from
    var ctxBindings = this.contextBindings = [] // computed props with dynamic context

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

    // create bindings for keys set on the vm by the user
    for (var key in vm) {
        if (key.charAt(0) !== '$') {
            this.createBinding(key)
        }
    }

    // now parse the DOM, during which we will create necessary bindings
    // and bind the parsed directives
    this.compileNode(this.el, true)

    // observe root values so that they emit events when
    // their nested values change (for an Object)
    // or when they mutate (for an Array)
    var i = observables.length, binding
    while (i--) {
        binding = observables[i]
        Observer.observe(binding.value, binding.key, this.observer)
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
CompilerProto.compileNode = function (node, root) {

    var compiler = this, i, j

    if (node.nodeType === 3) { // text node

        compiler.compileTextNode(node)

    } else if (node.nodeType === 1) {

        var eachExp = node.getAttribute(eachAttr),
            vmExp   = node.getAttribute(vmAttr),
            directive

        if (eachExp) { // each block

            directive = Directive.parse(eachAttr, eachExp)
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
                        directive = Directive.parse(attr.name, exp)
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
            directive = Directive.parse(dirname, token.key)
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
    if (directive.isExp) {
        binding = this.createBinding(key, true)
    } else if (compiler.vm.hasOwnProperty(baseKey)) {
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
    var i, dep, deps = binding.contextDeps
    if (deps) {
        i = deps.length
        while (i--) {
            dep = this.bindings[deps[i]]
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
        directive.update(value)
    }
}

/*
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key, isExp) {

    var bindings = this.bindings,
        binding  = new Binding(this, key, isExp)

    if (binding.isExp) {
        // a complex expression binding
        // we need to generate an anonymous computed property for it
        var getter = ExpParser.parseGetter(key, this)
        if (getter) {
            utils.log('  created anonymous binding: ' + key)
            binding.value = { get: getter }
            this.markComputed(binding)
            this.expressions.push(binding)
        } else {
            utils.warn('  invalid expression: ' + key)
        }
    } else {
        utils.log('  created binding: ' + key)
        bindings[key] = binding
        // make sure the key exists in the object so it can be observed
        // by the Observer!
        this.ensurePath(key)
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

    utils.log('    defined root binding: ' + key)

    var compiler = this,
        vm = this.vm,
        ob = this.observer,
        value = binding.value = vm[key], // save the value before redefinening it
        type = utils.typeOf(value)

    if (type === 'Object' && value.get) {
        // computed property
        this.markComputed(binding)
    } else if (type === 'Object' || type === 'Array') {
        // observe objects later, becase there might be more keys
        // to be added to it. we also want to emit all the set events
        // after all values are available.
        this.observables.push(binding)
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
                    item: compiler.each
                        ? vm[compiler.eachPrefix]
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
 *  Unbind and remove element
 */
CompilerProto.destroy = function () {
    utils.log('compiler destroyed: ', this.vm.$el)
    // unwatch
    this.observer.off()
    var i, key, dir, inss, binding,
        directives = this.directives,
        exps = this.expressions,
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
                Observer.unobserve(binding.value, binding.key, this.observer)
            }
            binding.unbind()
        }
    }
    // remove el
    if (el.parentNode) {
        el.parentNode.removeChild(el)
    }
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
});
require.register("seed/src/viewmodel.js", function(exports, require, module){
var Compiler = require('./compiler')

/*
 *  ViewModel exposed to the user that holds data,
 *  computed properties, event handlers
 *  and a few reserved methods
 */
function ViewModel (options) {
    // just compile. options are passed directly to compiler
    new Compiler(this, options)
}

var VMProto = ViewModel.prototype

/*
 *  Convenience function to set an actual nested value
 *  from a flat key string. Used in directives.
 */
VMProto.$set = function (key, value) {
    var path = key.split('.'),
        obj = getTargetVM(this, path)
    if (!obj) return
    for (var d = 0, l = path.length - 1; d < l; d++) {
        obj = obj[path[d]]
    }
    obj[path[d]] = value
}

/*
 *  The function for getting a key
 *  which will go up along the prototype chain of the bindings
 *  Used in exp-parser.
 */
VMProto.$get = function (key) {
    var path = key.split('.'),
        obj = getTargetVM(this, path),
        vm = obj
    if (!obj) return
    for (var d = 0, l = path.length; d < l; d++) {
        obj = obj[path[d]]
    }
    if (typeof obj === 'function') obj = obj.bind(vm)
    return obj
}

/*
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
VMProto.$watch = function (key, callback) {
    this.$compiler.observer.on('change:' + key, callback)
}

/*
 *  unwatch a key
 */
VMProto.$unwatch = function (key, callback) {
    this.$compiler.observer.off('change:' + key, callback)
}

/*
 *  unbind everything, remove everything
 */
VMProto.$destroy = function () {
    this.$compiler.destroy()
    this.$compiler = null
}

/*
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
/*
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

/*
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

/*
 *  -- computed property only --    
 *  Force all instances to re-evaluate themselves
 */
BindingProto.refresh = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].refresh()
    }
}

/*
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
    // TODO if this is a root level binding
    this.compiler = this.pubs = this.subs = this.instances = this.deps = null
}

/*
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].refresh()
    }
}

module.exports = Binding
});
require.register("seed/src/observer.js", function(exports, require, module){
var Emitter = require('./emitter'),
    utils   = require('./utils'),
    typeOf  = utils.typeOf,
    def     = Object.defineProperty,
    slice   = Array.prototype.slice,
    methods = ['push','pop','shift','unshift','splice','sort','reverse']

/*
 *  Methods to be added to an observed array
 */
var arrayMutators = {
    remove: function (index) {
        if (typeof index !== 'number') index = this.indexOf(index)
        this.splice(index, 1)
    },
    replace: function (index, data) {
        if (typeof index !== 'number') index = this.indexOf(index)
        this.splice(index, 1, data)
    },
    mutateFilter: function (fn) {
        var i = this.length
        while (i--) {
            if (!fn(this[i])) this.splice(i, 1)
        }
    }
}

// Define mutation interceptors so we can emit the mutation info
methods.forEach(function (method) {
    arrayMutators[method] = function () {
        var result = Array.prototype[method].apply(this, arguments)
        this.__observer__.emit('mutate', this.__path__, this, {
            method: method,
            args: slice.call(arguments),
            result: result
        })
    }
})

/*
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

/*
 *  Watch an Object, recursive.
 */
function watchObject (obj, path, observer) {
    defProtected(obj, '__values__', {})
    defProtected(obj, '__observer__', observer)
    for (var key in obj) {
        bind(obj, key, path, obj.__observer__)
    }
}

/*
 *  Watch an Array, attach mutation interceptors
 *  and augmentations
 */
function watchArray (arr, path, observer) {
    if (path) defProtected(arr, '__path__', path)
    defProtected(arr, '__observer__', observer)
    for (var method in arrayMutators) {
        defProtected(arr, method, arrayMutators[method])
    }
}

/*
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
function bind (obj, key, path, observer) {
    var val = obj[key],
        watchable = isWatchable(val),
        values = obj.__values__,
        fullKey = (path ? path + '.' : '') + key
    values[fullKey] = val
    // emit set on bind
    // this means when an object is observed it will emit
    // a first batch of set events.
    observer.emit('set', fullKey, val)
    def(obj, key, {
        enumerable: true,
        get: function () {
            // only emit get on tip values
            if (!watchable) observer.emit('get', fullKey)
            return values[fullKey]
        },
        set: function (newVal) {
            values[fullKey] = newVal
            watch(newVal, fullKey, observer)
            observer.emit('set', fullKey, newVal)
        }
    })
    watch(val, fullKey, observer)
}

/*
 *  Define an ienumerable property
 *  This avoids it being included in JSON.stringify
 *  or for...in loops.
 */
function defProtected (obj, key, val) {
    if (obj.hasOwnProperty(key)) return
    def(obj, key, {
        enumerable: false,
        configurable: false,
        value: val
    })
}

/*
 *  Check if a value is watchable
 */
function isWatchable (obj) {
    var type = typeOf(obj)
    return type === 'Object' || type === 'Array'
}

/*
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
function emitSet (obj, observer) {
    if (typeOf(obj) === 'Array') {
        observer.emit('set', 'length', obj.length)
    } else {
        var values = obj.__values__
        for (var key in values) {
            observer.emit('set', key, values[key])
        }
    }
}

module.exports = {

    // used in sd-each
    watchArray: watchArray,

    /*
     *  Observe an object with a given path,
     *  and proxy get/set/mutate events to the provided observer.
     */
    observe: function (obj, rawPath, observer) {
        if (isWatchable(obj)) {
            var path = rawPath + '.',
                ob, alreadyConverted = !!obj.__observer__
            if (!alreadyConverted) {
                defProtected(obj, '__observer__', new Emitter())
            }
            ob = obj.__observer__
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

    /*
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
    filters    = require('./filters')

var KEY_RE          = /^[^\|<]+/,
    ARG_RE          = /([^:]+):(.+)$/,
    FILTERS_RE      = /[^\|]\|[^\|<]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    NESTING_RE      = /^\^+/,
    SINGLE_VAR_RE   = /^[\w\.]+$/

/*
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (directiveName, expression) {

    var definition = directives[directiveName]

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this._update = definition
    } else {
        for (var prop in definition) {
            if (prop === 'unbind' || prop === 'update') {
                this['_' + prop] = definition[prop]
            } else {
                this[prop] = definition[prop]
            }
        }
    }

    this.directiveName = directiveName
    this.expression    = expression.trim()
    this.rawKey        = expression.match(KEY_RE)[0].trim()
    
    this.parseKey(this.rawKey)
    this.isExp = !SINGLE_VAR_RE.test(this.key)
    
    var filterExps = expression.match(FILTERS_RE)
    this.filters = filterExps
        ? filterExps.map(parseFilter)
        : null
}

var DirProto = Directive.prototype

/*
 *  parse a key, extract argument and nesting/root info
 */
DirProto.parseKey = function (rawKey) {

    var argMatch = rawKey.match(ARG_RE)

    var key = argMatch
        ? argMatch[2].trim()
        : rawKey.trim()

    this.arg = argMatch
        ? argMatch[1].trim()
        : null

    var nesting = key.match(NESTING_RE)
    this.nesting = nesting
        ? nesting[0].length
        : false

    this.root = key.charAt(0) === '$'

    if (this.nesting) {
        key = key.replace(NESTING_RE, '')
    } else if (this.root) {
        key = key.slice(1)
    }

    this.key = key
}


/*
 *  parse a filter expression
 */
function parseFilter (filter) {

    var tokens = filter.slice(2)
        .match(FILTER_TOKEN_RE)
        .map(function (token) {
            return token.replace(/'/g, '').trim()
        })

    return {
        name  : tokens[0],
        apply : filters[tokens[0]],
        args  : tokens.length > 1
                ? tokens.slice(1)
                : null
    }
}

/*
 *  called when a new value is set 
 *  for computed properties, this will only be called once
 *  during initialization.
 */
DirProto.update = function (value, init) {
    if (!init && value === this.value) return
    this.value = value
    this.apply(value)
}

/*
 *  -- computed property only --
 *  called when a dependency has changed
 */
DirProto.refresh = function (value) {
    // pass element and viewmodel info to the getter
    // enables powerful context-aware bindings
    if (value) this.value = value
    value = this.value.get({
        el: this.el,
        vm: this.vm
    })
    if (value && value === this.computedValue) return
    this.computedValue = value
    this.apply(value)
    this.binding.pub()
}

/*
 *  Actually invoking the _update from the directive's definition
 */
DirProto.apply = function (value) {
    this._update(
        this.filters
        ? this.applyFilters(value)
        : value
    )
}

/*
 *  pipe the value through filters
 */
DirProto.applyFilters = function (value) {
    var filtered = value, filter
    for (var i = 0, l = this.filters.length; i < l; i++) {
        filter = this.filters[i]
        if (!filter.apply) utils.warn('Unknown filter: ' + filter.name)
        filtered = filter.apply(filtered, filter.args)
    }
    return filtered
}

/*
 *  Unbind diretive
 */
DirProto.unbind = function (update) {
    if (!this.el) return
    if (this._unbind) this._unbind(update)
    if (!update) this.vm = this.el = this.binding = this.compiler = null
}

/*
 *  make sure the directive and expression is valid
 *  before we create an instance
 */
Directive.parse = function (dirname, expression) {

    var prefix = config.prefix
    if (dirname.indexOf(prefix) === -1) return null
    dirname = dirname.slice(prefix.length + 1)

    var dir   = directives[dirname],
        valid = KEY_RE.test(expression)

    if (!dir) utils.warn('unknown directive: ' + dirname)
    if (!valid) utils.warn('invalid directive expression: ' + expression)

    return dir && valid
        ? new Directive(dirname, expression)
        : null
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

function getVariables (code) {
    code = code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
    code = code ? code.split(/,+/) : []
    return code
}

module.exports = {

    /*
     *  Parse and create an anonymous computed property getter function
     *  from an arbitrary expression.
     */
    parseGetter: function (exp, compiler) {
        // extract variable names
        var vars = getVariables(exp)
        if (!vars.length) return null
        var args = [],
            v, i = vars.length,
            hash = {}
        while (i--) {
            v = vars[i]
            // avoid duplicate keys
            if (hash[v]) continue
            hash[v] = 1
            // push assignment
            args.push(v + '=this.$get("' + v + '")')
            // need to create the binding if it does not exist yet
            if (!compiler.bindings[v]) {
                compiler.rootCompiler.createBinding(v)
            }
        }
        args = 'var ' + args.join(',') + ';return ' + exp
        /* jshint evil: true */
        return new Function(args)
    }
}
});
require.register("seed/src/text-parser.js", function(exports, require, module){
var config     = require('./config'),
    ESCAPE_RE  = /[-.*+?^${}()|[\]\/\\]/g,
    BINDING_RE

/*
 *  Escapes a string so that it can be used to construct RegExp
 */
function escapeRegex (val) {
    return val.replace(ESCAPE_RE, '\\$&')
}

module.exports = {

    /*
     *  Parse a piece of text, return an array of tokens
     */
    parse: function (node) {
        if (!BINDING_RE) module.exports.buildRegex()
        var text = node.nodeValue
        if (!BINDING_RE.test(text)) return null
        var m, i, tokens = []
        do {
            m = text.match(BINDING_RE)
            if (!m) break
            i = m.index
            if (i > 0) tokens.push(text.slice(0, i))
            tokens.push({ key: m[1] })
            text = text.slice(i + m[0].length)
        } while (true)
        if (text.length) tokens.push(text)
        return tokens
    },

    /*
     *  Build interpolate tag regex from config settings
     */
    buildRegex: function () {
        var open = escapeRegex(config.interpolateTags.open),
            close = escapeRegex(config.interpolateTags.close)
        BINDING_RE = new RegExp(open + '(.+?)' + close)
    }
}
});
require.register("seed/src/deps-parser.js", function(exports, require, module){
var Emitter  = require('./emitter'),
    utils    = require('./utils'),
    observer = new Emitter()

var dummyEl = document.createElement('div'),
    ARGS_RE = /^function\s*?\((.+?)[\),]/,
    SCOPE_RE_STR = '\\.vm\\.[\\.\\w][\\.\\w$]*',
    noop = function () {}

/*
 *  Auto-extract the dependencies of a computed property
 *  by recording the getters triggered when evaluating it.
 *
 *  However, the first pass will contain duplicate dependencies
 *  for computed properties. It is therefore necessary to do a
 *  second pass in injectDeps()
 */
function catchDeps (binding) {
    utils.log('\n─ ' + binding.key)
    var depsHash = {}
    observer.on('get', function (dep) {
        if (depsHash[dep.key]) return
        depsHash[dep.key] = 1
        utils.log('  └─ ' + dep.key)
        binding.deps.push(dep)
        dep.subs.push(binding)
    })
    parseContextDependency(binding)
    binding.value.get({
        vm: createDummyVM(binding),
        el: dummyEl
    })
    observer.off('get')
}

/*
 *  We need to invoke each binding's getter for dependency parsing,
 *  but we don't know what sub-viewmodel properties the user might try
 *  to access in that getter. To avoid thowing an error or forcing
 *  the user to guard against an undefined argument, we staticly
 *  analyze the function to extract any possible nested properties
 *  the user expects the target viewmodel to possess. They are all assigned
 *  a noop function so they can be invoked with no real harm.
 */
function createDummyVM (binding) {
    var viewmodel = {},
        deps = binding.contextDeps
    if (!deps) return viewmodel
    var i = binding.contextDeps.length,
        j, level, key, path
    while (i--) {
        level = viewmodel
        path = deps[i].split('.')
        j = 0
        while (j < path.length) {
            key = path[j]
            if (!level[key]) level[key] = noop
            level = level[key]
            j++
        }
    }
    return viewmodel
}

/*
 *  Extract context dependency paths
 */
function parseContextDependency (binding) {
    var fn   = binding.rawGet,
        str  = fn.toString(),
        args = str.match(ARGS_RE)
    if (!args) return null
    var depsRE = new RegExp(args[1] + SCOPE_RE_STR, 'g'),
        matches = str.match(depsRE),
        base = args[1].length + 4
    if (!matches) return null
    var i = matches.length,
        deps = [], dep
    while (i--) {
        dep = matches[i].slice(base)
        if (deps.indexOf(dep) === -1) {
            deps.push(dep)
        }
    }
    binding.contextDeps = deps
    binding.compiler.contextBindings.push(binding)
}

module.exports = {

    /*
     *  the observer that catches events triggered by getters
     */
    observer: observer,

    /*
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

    capitalize: function (value) {
        if (!value) return ''
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
    },

    uppercase: function (value) {
        return value ? value.toString().toUpperCase() : ''
    },

    lowercase: function (value) {
        return value ? value.toString().toLowerCase() : ''
    },

    pluralize: function (value, args) {
        return args.length > 1
            ? (args[value - 1] || args[args.length - 1])
            : (args[value - 1] || args[0] + 's')
    },

    currency: function (value, args) {
        if (!value) return ''
        var sign = (args && args[0]) || '$',
            i = value % 3,
            f = '.' + value.toFixed(2).slice(-2),
            s = Math.floor(value).toString()
        return sign + s.slice(0, i) + s.slice(i).replace(/(\d{3})(?=\d)/g, '$1,') + f
    },

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
module.exports = {

    on    : require('./on'),
    each  : require('./each'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent =
            (typeof value === 'string' || typeof value === 'number')
            ? value : ''
    },

    html: function (value) {
        this.el.innerHTML =
            (typeof value === 'string' || typeof value === 'number')
            ? value : ''
    },

    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },

    visible: function (value) {
        this.el.style.visibility = value ? '' : 'hidden'
    },
    
    focus: function (value) {
        var el = this.el
        setTimeout(function () {
            if (value) el.focus()
        }, 0)
    },

    class: function (value) {
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

    value: {
        bind: function () {
            if (this.oneway) return
            var el = this.el, self = this
            this.change = function () {
                self.vm.$set(self.key, el.value)
            }
            el.addEventListener('keyup', this.change)
        },
        update: function (value) {
            this.el.value = value ? value : ''
        },
        unbind: function () {
            if (this.oneway) return
            this.el.removeEventListener('keyup', this.change)
        }
    },

    checked: {
        bind: function () {
            if (this.oneway) return
            var el = this.el, self = this
            this.change = function () {
                self.vm.$set(self.key, el.checked)
            }
            el.addEventListener('change', this.change)
        },
        update: function (value) {
            this.el.checked = !!value
        },
        unbind: function () {
            if (this.oneway) return
            this.el.removeEventListener('change', this.change)
        }
    },

    'if': {
        bind: function () {
            this.parent = this.el.parentNode
            this.ref = document.createComment('sd-if-' + this.key)
            var next = this.el.nextSibling
            if (next) {
                this.parent.insertBefore(this.ref, next)
            } else {
                this.parent.appendChild(this.ref)
            }
        },
        update: function (value) {
            if (!value) {
                if (this.el.parentNode) {
                    this.parent.removeChild(this.el)
                }
            } else {
                if (!this.el.parentNode) {
                    this.parent.insertBefore(this.el, this.ref)
                }
            }
        }
    },

    style: {
        bind: function () {
            this.arg = convertCSSProperty(this.arg)
        },
        update: function (value) {
            this.el.style[this.arg] = value
        }
    }
}

/*
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
require.register("seed/src/directives/each.js", function(exports, require, module){
var config   = require('../config'),
    utils    = require('../utils'),
    Observer = require('../observer'),
    Emitter  = require('../emitter'),
    ViewModel // lazy def to avoid circular dependency

/*
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
        this.vms.pop().$destroy()
    },

    unshift: function (m) {
        var i, l = m.args.length
        for (i = 0; i < l; i++) {
            this.buildItem(m.args[i], i)
        }
    },

    shift: function () {
        this.vms.shift().$destroy()
    },

    splice: function (m) {
        var i,
            index = m.args[0],
            removed = m.args[1],
            added = m.args.length - 2,
            removedVMs = this.vms.splice(index, removed)
        for (i = 0; i < removed; i++) {
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
        this.el.removeAttribute(config.prefix + '-each')
        var ctn = this.container = this.el.parentNode
        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment('sd-each-' + this.arg)
        ctn.insertBefore(this.ref, this.el)
        ctn.removeChild(this.el)
        this.collection = null
        this.vms = null
        var self = this
        this.mutationListener = function (path, arr, mutation) {
            mutationHandlers[mutation.method].call(self, mutation)
        }
    },

    update: function (collection) {

        this.unbind(true)
        // attach an object to container to hold handlers
        this.container.sd_dHandlers = {}
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
        // this.compiler.observer.emit('set', this.key + '.length', collection.length)

        // create child-seeds and append to DOM
        for (var i = 0, l = collection.length; i < l; i++) {
            this.buildItem(collection[i], i)
        }
    },

    buildItem: function (data, index) {
        ViewModel = ViewModel || require('../viewmodel')
        var node = this.el.cloneNode(true),
            ctn  = this.container,
            vmID = node.getAttribute(config.prefix + '-viewmodel'),
            ChildVM = utils.getVM(vmID) || ViewModel,
            wrappedData = {}
        wrappedData[this.arg] = data || {}
        var item = new ChildVM({
            el: node,
            each: true,
            eachPrefix: this.arg,
            parentCompiler: this.compiler,
            delegator: ctn,
            data: wrappedData
        })
        if (!data) {
            item.$destroy()
        } else {
            var ref = this.vms.length > index
                ? this.vms[index].$el
                : this.ref
            ctn.insertBefore(node, ref)
            this.vms.splice(index, 0, item)
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

    expectFunction : true,

    bind: function () {
        if (this.compiler.each) {
            // attach an identifier to the el
            // so it can be matched during event delegation
            this.el[this.expression] = true
            // attach the owner viewmodel of this directive
            this.el.sd_viewmodel = this.vm
        }
    },

    update: function (handler) {

        this.unbind(true)
        if (!handler) return

        var compiler = this.compiler,
            event    = this.arg,
            ownerVM  = this.binding.compiler.vm

        if (compiler.each && event !== 'blur' && event !== 'blur') {

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
                    e.item = e.vm[compiler.eachPrefix]
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
                if (compiler.each) {
                    e.item = vm[compiler.eachPrefix]
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
require.alias("component-emitter/index.js", "seed/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("seed/src/main.js", "seed/index.js");

if (typeof exports == "object") {
  module.exports = require("seed");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("seed"); });
} else {
  this["seed"] = require("seed");
}})();