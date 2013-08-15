;(function (undefined) {
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
    textParser  = require('./text-parser'),
    utils       = require('./utils')

var eventbus    = utils.eventbus,
    api         = {}

/*
 *  expose utils
 */
api.utils = utils

/*
 *  broadcast event
 */
api.broadcast = function () {
    eventbus.emit.apply(eventbus, arguments)
}

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
    if (opts) {
        for (var key in opts) {
            config[key] = opts[key]
        }
    }
    textParser.buildRegex()
}

/*
 *  Expose the main ViewModel class
 *  and add extend method
 */
api.ViewModel = ViewModel

ViewModel.extend = function (options) {
    var ExtendedVM = function (opts) {
        opts = opts || {}
        if (options.template) {
            opts.template = utils.getTemplate(options.template)
        }
        if (options.initialize) {
            opts.initialize = options.initialize
        }
        ViewModel.call(this, opts)
    }
    var p = ExtendedVM.prototype = Object.create(ViewModel.prototype)
    p.constructor = ExtendedVM
    if (options.properties) {
        for (var prop in options.properties) {
            p[prop] = options.properties[prop]
        }
    }
    return ExtendedVM
}

module.exports = api
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
var config        = require('./config'),
    Emitter       = require('emitter'),
    toString      = Object.prototype.toString,
    aproto        = Array.prototype,
    templates     = {}

var arrayAugmentations = {
    remove: function (index) {
        if (typeof index !== 'number') index = index.$index
        this.splice(index, 1)
    },
    replace: function (index, data) {
        if (typeof index !== 'number') index = index.$index
        this.splice(index, 1, data)
    }
}

var arrayMutators = ['push','pop','shift','unshift','splice','sort','reverse'],
    mutationInterceptors = {}

arrayMutators.forEach(function (method) {
    mutationInterceptors[method] = function () {
        var result = aproto[method].apply(this, arguments)
        this.emit('mutate', {
            method: method,
            args: aproto.slice.call(arguments),
            result: result
        })
    }
})

/*
 *  get accurate type of an object
 */
function typeOf (obj) {
    return toString.call(obj).slice(8, -1)
}

/*
 *  Recursively dump stuff...
 */
function dump (val) {
    var type = typeOf(val)
    if (type === 'Array') {
        return val.map(dump)
    } else if (type === 'Object') {
        if (val.get) { // computed property
            return val.get()
        } else { // object / child viewmodel
            var ret = {}, prop
            for (var key in val) {
                prop = val[key]
                if (typeof prop !== 'function' &&
                    val.hasOwnProperty(key) &&
                    key.charAt(0) !== '$')
                {
                    ret[key] = dump(prop)
                }
            }
            return ret
        }
    } else if (type !== 'Function') {
        return val
    }
}

module.exports = {

    typeOf: typeOf,
    dump: dump,

    /*
     *  shortcut for JSON.stringify-ing a dumped value
     */
    serialize: function (val) {
        return JSON.stringify(dump(val))
    },

    /*
     *  Get a value from an object based on a path array
     */
    getNestedValue: function (obj, path) {
        if (path.length === 1) return obj[path[0]]
        var i = 0
        /* jshint boss: true */
        while (obj[path[i]]) {
            obj = obj[path[i]]
            i++
        }
        return i === path.length ? obj : undefined
    },

    /*
     *  augment an Array so that it emit events when mutated
     */
    watchArray: function (collection) {
        Emitter(collection)
        var method, i = arrayMutators.length
        while (i--) {
            method = arrayMutators[i]
            collection[method] = mutationInterceptors[method]
        }
        for (method in arrayAugmentations) {
            collection[method] = arrayAugmentations[method]
        }
    },

    getTemplate: function (id) {
        var el = templates[id]
        if (!el && el !== null) {
            var selector = '[' + config.prefix + '-template="' + id + '"]'
            el = templates[id] = document.querySelector(selector)
            if (el) el.parentNode.removeChild(el)
        }
        return el
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
var config          = require('./config'),
    utils           = require('./utils'),
    Binding         = require('./binding'),
    DirectiveParser = require('./directive-parser'),
    TextParser      = require('./text-parser'),
    DepsParser      = require('./deps-parser')

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
    utils.log('compiler destroyed: ', this.vm.$el)
    var i, key, dir, inss
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
});
require.register("seed/src/viewmodel.js", function(exports, require, module){
var utils    = require('./utils'),
    Compiler = require('./compiler')

/*
 *  ViewModel exposed to the user that holds data,
 *  computed properties, event handlers
 *  and a few reserved methods
 */
function ViewModel (options) {

    // determine el
    this.$el = options.template
        ? options.template.cloneNode(true)
        : typeof options.el === 'string'
            ? document.querySelector(options.el)
            : options.el

    // possible info inherited as an each item
    this.$index  = options.index
    this.$parent = options.parentCompiler && options.parentCompiler.vm

    // compile. options are passed directly to compiler
    new Compiler(this, options)
}

var VMProto = ViewModel.prototype

/*
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
VMProto.$watch = function (key, callback) {
    var self = this
    // yield and wait for compiler to finish compiling
    setTimeout(function () {
        var binding = self.$compiler.bindings[key],
            i       = binding.deps.length,
            watcher = self.$compiler.watchers[key] = {
                refresh: function () {
                    callback(self[key])
                },
                deps: binding.deps
            }
        while (i--) {
            binding.deps[i].subs.push(watcher)
        }
    }, 0)
}

/*
 *  remove watcher
 */
VMProto.$unwatch = function (key) {
    var self = this
    setTimeout(function () {
        var watcher = self.$compiler.watchers[key]
        if (!watcher) return
        var i = watcher.deps.length, subs
        while (i--) {
            subs = watcher.deps[i].subs
            subs.splice(subs.indexOf(watcher))
        }
        self.$compiler.watchers[key] = null
    }, 0)
}

/*
 *  load data into viewmodel
 */
VMProto.$load = function (data) {
    for (var key in data) {
        this[key] = data[key]
    }
}

/*
 *  Dump a copy of current viewmodel data, excluding compiler-exposed properties.
 *  @param key (optional): key for the value to dump
 */
VMProto.$dump = function (key) {
    var bindings = this.$compiler.bindings
    return utils.dump(key ? bindings[key].value : this)
}

/*
 *  stringify the result from $dump
 */
VMProto.$serialize = function (key) {
    return JSON.stringify(this.$dump(key))
}

/*
 *  unbind everything, remove everything
 */
VMProto.$destroy = function () {
    this.$compiler.destroy()
    this.$compiler = null
}

module.exports = ViewModel
});
require.register("seed/src/binding.js", function(exports, require, module){
var utils    = require('./utils'),
    observer = require('./deps-parser').observer,
    def      = Object.defineProperty

/*
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (compiler, key) {
    this.compiler = compiler
    this.key = key
    var path = key.split('.')
    this.inspect(utils.getNestedValue(compiler.vm, path))
    this.def(compiler.vm, path)
    this.instances = []
    this.subs = []
    this.deps = []
}

var BindingProto = Binding.prototype

/*
 *  Pre-process a passed in value based on its type
 */
BindingProto.inspect = function (value) {
    var type = utils.typeOf(value)
    // preprocess the value depending on its type
    if (type === 'Object') {
        if (value.get) {
            var l = Object.keys(value).length
            if (l === 1 || (l === 2 && value.set)) {
                this.isComputed = true // computed property
                this.rawGet = value.get
                value.get = value.get.bind(this.compiler.vm)
                if (value.set) value.set = value.set.bind(this.compiler.vm)
            }
        }
    } else if (type === 'Array') {
        value = utils.dump(value)
        utils.watchArray(value)
        value.on('mutate', this.pub.bind(this))
    }
    this.value = value
}

/*
 *  Define getter/setter for this binding on viewmodel
 *  recursive for nested objects
 */
BindingProto.def = function (viewmodel, path) {
    var key = path[0]
    if (path.length === 1) {
        // here we are! at the end of the path!
        // define the real value accessors.
        def(viewmodel, key, {
            get: (function () {
                if (observer.isObserving) {
                    observer.emit('get', this)
                }
                return this.isComputed
                    ? this.value.get({
                        el: this.compiler.el,
                        vm: this.compiler.vm
                    })
                    : this.value
            }).bind(this),
            set: (function (value) {
                if (this.isComputed) {
                    // computed properties cannot be redefined
                    // no need to call binding.update() here,
                    // as dependency extraction has taken care of that
                    if (this.value.set) {
                        this.value.set(value)
                    }
                } else if (value !== this.value) {
                    this.update(value)
                }
            }).bind(this)
        })
    } else {
        // we are not there yet!!!
        // create an intermediate object
        // which also has its own getter/setters
        var nestedObject = viewmodel[key]
        if (!nestedObject) {
            nestedObject = {}
            def(viewmodel, key, {
                get: (function () {
                    return this
                }).bind(nestedObject),
                set: (function (value) {
                    // when the nestedObject is given a new value,
                    // copy everything over to trigger the setters
                    for (var prop in value) {
                        this[prop] = value[prop]
                    }
                }).bind(nestedObject)
            })
        }
        // recurse
        this.def(nestedObject, path.slice(1))
    }
}

/*
 *  Process the value, then trigger updates on all dependents
 */
BindingProto.update = function (value) {
    this.inspect(value)
    var i = this.instances.length
    while (i--) {
        this.instances[i].update(this.value)
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
    if (Array.isArray(this.value)) this.value.off('mutate')
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
require.register("seed/src/directive-parser.js", function(exports, require, module){
var config     = require('./config'),
    utils      = require('./utils'),
    directives = require('./directives'),
    filters    = require('./filters')

var KEY_RE          = /^[^\|<]+/,
    ARG_RE          = /([^:]+):(.+)$/,
    FILTERS_RE      = /\|[^\|<]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    INVERSE_RE      = /^!/,
    NESTING_RE      = /^\^+/,
    ONEWAY_RE       = /-oneway$/

/*
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (directiveName, expression, oneway) {

    var prop,
        definition = directives[directiveName]

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this._update = definition
    } else {
        this._update = definition.update
        for (prop in definition) {
            if (prop !== 'update') {
                if (prop === 'unbind') {
                    this._unbind = definition[prop]
                } else {
                    this[prop] = definition[prop]
                }
            }
        }
    }

    this.oneway        = !!oneway
    this.directiveName = directiveName
    this.expression    = expression.trim()
    this.rawKey        = expression.match(KEY_RE)[0].trim()
    
    this.parseKey(this.rawKey)
    
    var filterExps = expression.match(FILTERS_RE)
    this.filters = filterExps
        ? filterExps.map(parseFilter)
        : null
}

var DirProto = Directive.prototype

/*
 *  called when a new value is set 
 *  for computed properties, this will only be called once
 *  during initialization.
 */
DirProto.update = function (value) {
    if (value && (value === this.value)) return
    this.value = value
    this.apply(value)
}

/*
 *  -- computed property only --
 *  called when a dependency has changed
 */
DirProto.refresh = function () {
    // pass element and viewmodel info to the getter
    // enables powerful context-aware bindings
    var value = this.value.get({
        el: this.el,
        vm: this.vm
    })
    if (value === this.computedValue) return
    this.computedValue = value
    this.apply(value)
    this.binding.pub()
}

/*
 *  Actually invoking the _update from the directive's definition
 */
DirProto.apply = function (value) {
    if (this.inverse) value = !value
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
        if (!filter.apply) throw new Error('Unknown filter: ' + filter.name)
        filtered = filter.apply(filtered, filter.args)
    }
    return filtered
}

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

    this.inverse = INVERSE_RE.test(key)
    if (this.inverse) {
        key = key.slice(1)
    }

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
 *  unbind noop, to be overwritten by definitions
 */
DirProto.unbind = function (update) {
    if (!this.el) return
    if (this._unbind) this._unbind(update)
    if (!update) this.vm = this.el = this.binding = this.compiler = null
}

/*
 *  parse a filter expression
 */
function parseFilter (filter) {

    var tokens = filter.slice(1)
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

module.exports = {

    /*
     *  make sure the directive and expression is valid
     *  before we create an instance
     */
    parse: function (dirname, expression) {

        var prefix = config.prefix
        if (dirname.indexOf(prefix) === -1) return null
        dirname = dirname.slice(prefix.length + 1)

        var oneway = ONEWAY_RE.test(dirname)
        if (oneway) {
            dirname = dirname.slice(0, -7)
        }

        var dir   = directives[dirname],
            valid = KEY_RE.test(expression)

        if (!dir) utils.warn('unknown directive: ' + dirname)
        if (!valid) utils.warn('invalid directive expression: ' + expression)

        return dir && valid
            ? new Directive(dirname, expression, oneway)
            : null
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
var Emitter  = require('emitter'),
    config   = require('./config'),
    utils    = require('./utils'),
    observer = new Emitter()

var dummyEl = document.createElement('div'),
    ARGS_RE = /^function\s*?\((.+?)\)/,
    SCOPE_RE_STR = '\\.vm\\.[\\.A-Za-z0-9_][\\.A-Za-z0-9_$]*',
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
    observer.on('get', function (dep) {
        binding.deps.push(dep)
    })
    parseContextDependency(binding)
    binding.value.get({
        vm: createDummyVM(binding),
        el: dummyEl
    })
    observer.off('get')
}

/*
 *  The second pass of dependency extraction.
 *  Only include dependencies that don't have dependencies themselves.
 */
function filterDeps (binding) {
    var i = binding.deps.length, dep
    utils.log('\n─ ' + binding.key)
    while (i--) {
        dep = binding.deps[i]
        if (!dep.deps.length) {
            utils.log('  └─ ' + dep.key)
            dep.subs.push(binding)
        } else {
            binding.deps.splice(i, 1)
        }
    }
    var ctdeps = binding.contextDeps
    if (!ctdeps || !config.debug) return
    i = ctdeps.length
    while (i--) {
        utils.log('  └─ ctx:' + ctdeps[i])
    }
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
        bindings.forEach(filterDeps)
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

    trim: function (value) {
        return value ? value.toString().trim() : ''
    },

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
            el[value ? 'focus' : 'focus']()
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
                self.vm[self.key] = el.value
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
                self.vm[self.key] = el.checked
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
var config = require('../config'),
    ViewModel // lazy def to avoid circular dependency

/*
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var i, l = m.args.length,
            baseIndex = this.collection.length - l
        for (i = 0; i < l; i++) {
            this.buildItem(this.ref, m.args[i], baseIndex + i)
        }
    },

    pop: function (m) {
        m.result.$destroy()
    },

    unshift: function (m) {
        var i, l = m.args.length, ref
        for (i = 0; i < l; i++) {
            ref = this.collection.length > l
                ? this.collection[l].$el
                : this.ref
            this.buildItem(ref, m.args[i], i)
        }
        this.updateIndexes()
    },

    shift: function (m) {
        m.result.$destroy()
        this.updateIndexes()
    },

    splice: function (m) {
        var i, pos, ref,
            l = m.args.length,
            k = m.result.length,
            index   = m.args[0],
            removed = m.args[1],
            added   = l - 2
        for (i = 0; i < k; i++) {
            m.result[i].$destroy()
        }
        if (added > 0) {
            for (i = 2; i < l; i++) {
                pos  = index - removed + added + 1
                ref  = this.collection[pos]
                     ? this.collection[pos].$el
                     : this.ref
                this.buildItem(ref, m.args[i], index + i)
            }
        }
        if (removed !== added) {
            this.updateIndexes()
        }
    },

    sort: function () {
        var i, l = this.collection.length, viewmodel
        for (i = 0; i < l; i++) {
            viewmodel = this.collection[i]
            viewmodel.$index = i
            this.container.insertBefore(viewmodel.$el, this.ref)
        }
    }
}

//mutationHandlers.reverse = mutationHandlers.sort

module.exports = {

    bind: function () {
        this.el.removeAttribute(config.prefix + '-each')
        var ctn = this.container = this.el.parentNode
        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment('sd-each-' + this.arg)
        ctn.insertBefore(this.ref, this.el)
        ctn.removeChild(this.el)
    },

    update: function (collection) {

        this.unbind(true)
        // attach an object to container to hold handlers
        this.container.sd_dHandlers = {}
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.collection && !collection.length) {
            this.buildItem(this.ref, null, null)
        }
        this.collection = collection

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        collection.on('mutate', (function (mutation) {
            mutationHandlers[mutation.method].call(this, mutation)
        }).bind(this))

        // create child-seeds and append to DOM
        for (var i = 0, l = collection.length; i < l; i++) {
            this.buildItem(this.ref, collection[i], i)
        }
    },

    buildItem: function (ref, data, index) {
        var node = this.el.cloneNode(true)
        this.container.insertBefore(node, ref)
        ViewModel = ViewModel || require('../viewmodel')
        var item = new ViewModel({
            el: node,
            each: true,
            eachPrefix: this.arg + '.',
            parentCompiler: this.compiler,
            index: index,
            data: data,
            delegator: this.container
        })
        if (index !== null) {
            this.collection[index] = item
        } else {
            item.$destroy()
        }
    },

    updateIndexes: function () {
        var i = this.collection.length
        while (i--) {
            this.collection[i].$index = i
        }
    },

    unbind: function () {
        if (this.collection) {
            this.collection.off('mutate')
            var i = this.collection.length
            while (i--) {
                this.collection[i].$destroy()
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
                handler.call(vm, e)
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

window.Seed = window.Seed || require('seed')
Seed.version = '0.2.1'
})();