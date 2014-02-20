/*
 Vue.js v0.8.7
 (c) 2014 Evan You
 License: MIT
*/
;(function(){
'use strict';

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
require.register("component-emitter/index.js", function(exports, require, module){

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

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
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

  on.fn = fn;
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
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
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
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
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
require.register("vue/src/main.js", function(exports, require, module){
var config      = require('./config'),
    ViewModel   = require('./viewmodel'),
    utils       = require('./utils'),
    makeHash    = utils.hash,
    assetTypes  = ['directive', 'filter', 'partial', 'transition', 'component']

ViewModel.options = config.globalAssets = {
    directives  : require('./directives'),
    filters     : require('./filters'),
    partials    : makeHash(),
    transitions : makeHash(),
    components  : makeHash()
}

/**
 *  Expose asset registration methods
 */
assetTypes.forEach(function (type) {
    ViewModel[type] = function (id, value) {
        var hash = this.options[type + 's']
        if (!hash) {
            hash = this.options[type + 's'] = makeHash()
        }
        if (!value) return hash[id]
        if (type === 'partial') {
            value = utils.toFragment(value)
        } else if (type === 'component') {
            value = utils.toConstructor(value)
        }
        hash[id] = value
        return this
    }
})

/**
 *  Set config options
 */
ViewModel.config = function (opts, val) {
    if (typeof opts === 'string') {
        if (val === undefined) {
            return config[opts]
        } else {
            config[opts] = val
        }
    } else {
        utils.extend(config, opts)
    }
    return this
}

/**
 *  Expose internal modules for plugins
 */
ViewModel.require = function (path) {
    return require('./' + path)
}

/**
 *  Expose an interface for plugins
 */
ViewModel.use = function (plugin) {
    if (typeof plugin === 'string') {
        try {
            plugin = require(plugin)
        } catch (e) {
            return utils.warn('Cannot find plugin: ' + plugin)
        }
    }

    // additional parameters
    var args = [].slice.call(arguments, 1)
    args.unshift(ViewModel)

    if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args)
    } else {
        plugin.apply(null, args)
    }
}

ViewModel.extend = extend
ViewModel.nextTick = utils.nextTick

/**
 *  Expose the main ViewModel class
 *  and add extend method
 */
function extend (options) {

    var ParentVM = this

    // inherit options
    options = inheritOptions(options, ParentVM.options, true)
    utils.processOptions(options)

    var ExtendedVM = function (opts, asParent) {
        if (!asParent) {
            opts = inheritOptions(opts, options, true)
        }
        ParentVM.call(this, opts, true)
    }

    // inherit prototype props
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)
    utils.defProtected(proto, 'constructor', ExtendedVM)

    // copy prototype props
    var methods = options.methods
    if (methods) {
        for (var key in methods) {
            if (
                !(key in ViewModel.prototype) &&
                typeof methods[key] === 'function'
            ) {
                proto[key] = methods[key]
            }
        }
    }

    // allow extended VM to be further extended
    ExtendedVM.extend = extend
    ExtendedVM.super = ParentVM
    ExtendedVM.options = options

    // allow extended VM to add its own assets
    assetTypes.forEach(function (type) {
        ExtendedVM[type] = ViewModel[type]
    })

    return ExtendedVM
}

/**
 *  Inherit options
 *
 *  For options such as `data`, `vms`, `directives`, 'partials',
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
    child = child || makeHash()
    if (!parent) return child
    for (var key in parent) {
        if (key === 'el' || key === 'methods') continue
        var val = child[key],
            parentVal = parent[key],
            type = utils.typeOf(val)
        if (topLevel && type === 'Function' && parentVal) {
            // merge hook functions into an array
            child[key] = [val]
            if (Array.isArray(parentVal)) {
                child[key] = child[key].concat(parentVal)
            } else {
                child[key].push(parentVal)
            }
        } else if (topLevel && type === 'Object') {
            // merge toplevel object options
            inheritOptions(val, parentVal)
        } else if (val === undefined) {
            // inherit if child doesn't override
            child[key] = parentVal
        }
    }
    return child
}

module.exports = ViewModel
});
require.register("vue/src/emitter.js", function(exports, require, module){
// shiv to make this work for Component, Browserify and Node at the same time.
var Emitter,
    componentEmitter = 'emitter'

try {
    // Requiring without a string literal will make browserify
    // unable to parse the dependency, thus preventing it from
    // stopping the compilation after a failed lookup.
    Emitter = require(componentEmitter)
} catch (e) {
    Emitter = require('events').EventEmitter
    Emitter.prototype.off = function () {
        var method = arguments.length > 1
            ? this.removeListener
            : this.removeAllListeners
        return method.apply(this, arguments)
    }
}

module.exports = Emitter
});
require.register("vue/src/config.js", function(exports, require, module){
var prefix = 'v',
    specialAttributes = [
        'pre',
        'ref',
        'with',
        'text',
        'repeat',
        'partial',
        'component',
        'transition'
    ],
    config = module.exports = {

        debug       : false,
        silent      : false,
        enterClass  : 'v-enter',
        leaveClass  : 'v-leave',
        attrs       : {},

        get prefix () {
            return prefix
        },
        set prefix (val) {
            prefix = val
            updatePrefix()
        }
        
    }

function updatePrefix () {
    specialAttributes.forEach(function (attr) {
        config.attrs[attr] = prefix + '-' + attr
    })
}

updatePrefix()
});
require.register("vue/src/utils.js", function(exports, require, module){
var config    = require('./config'),
    attrs     = config.attrs,
    toString  = ({}).toString,
    join      = [].join,
    win       = window,
    console   = win.console,

    hasClassList = 'classList' in document.documentElement,
    ViewModel // late def

var defer =
    win.requestAnimationFrame ||
    win.webkitRequestAnimationFrame ||
    win.setTimeout

var utils = module.exports = {

    /**
     *  Create a prototype-less object
     *  which is a better hash/map
     */
    hash: function () {
        return Object.create(null)
    },

    /**
     *  get an attribute and remove it.
     */
    attr: function (el, type, noRemove) {
        var attr = attrs[type],
            val = el.getAttribute(attr)
        if (!noRemove && val !== null) el.removeAttribute(attr)
        return val
    },

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
     *  Most simple bind
     *  enough for the usecase and fast than native bind()
     */
    bind: function (fn, ctx) {
        return function (arg) {
            return fn.call(ctx, arg)
        }
    },

    /**
     *  Make sure only strings, booleans, numbers and
     *  objects are output to html. otherwise, ouput empty string.
     */
    toText: function (value) {
        /* jshint eqeqeq: false */
        var type = typeof value
        return (type === 'string' ||
            type === 'boolean' ||
            (type === 'number' && value == value)) // deal with NaN
                ? value
                : type === 'object' && value !== null
                    ? JSON.stringify(value)
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
     *  filter an array with duplicates into uniques
     */
    unique: function (arr) {
        var hash = utils.hash(),
            i = arr.length,
            key, res = []
        while (i--) {
            key = arr[i]
            if (hash[key]) continue
            hash[key] = 1
            res.push(key)
        }
        return res
    },

    /**
     *  Convert a string template to a dom fragment
     */
    toFragment: function (template) {
        if (typeof template !== 'string') {
            return template
        }
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
            if (node.nodeType === 1) {
                frag.appendChild(child)
            }
        }
        return frag
    },

    /**
     *  Convert the object to a ViewModel constructor
     *  if it is not already one
     */
    toConstructor: function (obj) {
        ViewModel = ViewModel || require('./viewmodel')
        return utils.typeOf(obj) === 'Object'
            ? ViewModel.extend(obj)
            : typeof obj === 'function'
                ? obj
                : null
    },

    /**
     *  convert certain option values to the desired format.
     */
    processOptions: function (options) {
        var components = options.components,
            partials   = options.partials,
            template   = options.template,
            key
        if (components) {
            for (key in components) {
                components[key] = utils.toConstructor(components[key])
            }
        }
        if (partials) {
            for (key in partials) {
                partials[key] = utils.toFragment(partials[key])
            }
        }
        if (template) {
            options.template = utils.toFragment(template)
        }
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
     *  warnings, traces by default
     *  can be suppressed by `silent` option.
     */
    warn: function() {
        if (!config.silent && console) {
            console.warn(join.call(arguments, ' '))
            if (config.debug) {
                console.trace()
            }
        }
    },

    /**
     *  used to defer batch updates
     */
    nextTick: function (cb) {
        defer(cb, 0)
    },

    /**
     *  add class for IE9
     *  uses classList if available
     */
    addClass: function (el, cls) {
        if (hasClassList) {
            el.classList.add(cls)
        } else {
            var cur = ' ' + el.className + ' '
            if (cur.indexOf(' ' + cls + ' ') < 0) {
                el.className = (cur + cls).trim()
            }
        }
    },

    /**
     *  remove class for IE9
     */
    removeClass: function (el, cls) {
        if (hasClassList) {
            el.classList.remove(cls)
        } else {
            var cur = ' ' + el.className + ' ',
                tar = ' ' + cls + ' '
            while (cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ')
            }
            el.className = cur.trim()
        }
    }
}
});
require.register("vue/src/compiler.js", function(exports, require, module){
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
    log         = utils.log,
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
    // indicate that we are intiating this instance
    // so we should not run any transitions
    compiler.init = true

    // process and extend options
    options = compiler.options = options || makeHash()
    utils.processOptions(options)

    // copy data, methods & compiler options
    var data = compiler.data = options.data || {}
    extend(vm, data, true)
    extend(vm, options.methods, true)
    extend(compiler, options.compilerOptions)

    // initialize element
    var el = compiler.setupElement(options)
    log('\nnew VM instance:', el.tagName, '\n')

    // set compiler properties
    compiler.vm  = vm
    compiler.bindings = makeHash()
    compiler.dirs = []
    compiler.deferred = []
    compiler.exps = []
    compiler.computed = []
    compiler.childCompilers = []
    compiler.emitter = new Emitter()

    // set inenumerable VM properties
    def(vm, '$', makeHash())
    def(vm, '$el', el)
    def(vm, '$compiler', compiler)
    def(vm, '$root', getRoot(compiler).vm)

    // set parent VM
    // and register child id on parent
    var parent = compiler.parentCompiler,
        childId = utils.attr(el, 'ref')
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

    // create bindings for computed properties
    var computed = options.computed
    if (computed) {
        for (var key in computed) {
            compiler.createBinding(key)
        }
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
    compiler.execHook('ready')
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
                register(hook, fns[i])
            }
        } else if (fns) {
            register(hook, fns)
        }
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

    function register (hook, fn) {
        observer.on('hook:' + hook, function () {
            fn.call(compiler.vm, options)
        })
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
    Object.defineProperty(compiler.vm, '$data', {
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
            withKey,
            partialId,
            directive,
            componentId = utils.attr(node, 'component') || tagName.toLowerCase(),
            componentCtor = compiler.getOption('components', componentId)

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
        } else if (root !== true && ((withKey = utils.attr(node, 'with')) || componentCtor)) {

            directive = Directive.parse('with', withKey || '', compiler, node)
            if (directive) {
                directive.Ctor = componentCtor
                compiler.deferred.push(directive)
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
    var i, j,
        attrs = slice.call(node.attributes),
        prefix = config.prefix + '-'
    // parse if has attributes
    if (attrs && attrs.length) {
        var attr, isDirective, exps, exp, directive, dirname
        // loop through all attributes
        i = attrs.length
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
                    if (directive) {
                        this.bindDirective(directive)
                    }
                }
            } else {
                // non directive attribute, check interpolation tags
                exp = TextParser.parseAttr(attr.value)
                if (exp) {
                    directive = Directive.parse('attr', attr.name + ':' + exp, this, node)
                    if (directive) {
                        this.bindDirective(directive)
                    }
                }
            }

            if (isDirective && dirname !== 'cloak') {
                node.removeAttribute(attr.name)
            }
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
    var el, token, directive, partial, partialId, partialNodes

    for (var i = 0, l = tokens.length; i < l; i++) {
        token = tokens[i]
        directive = partialNodes = null
        if (token.key) { // a binding
            if (token.key.charAt(0) === '>') { // a partial
                partialId = token.key.slice(1).trim()
                if (partialId === 'yield') {
                    el = this.rawContent
                } else {
                    partial = this.getOption('partials', partialId)
                    if (partial) {
                        el = partial.cloneNode(true)
                    } else {
                        utils.warn('Unknown partial: ' + partialId)
                        continue
                    }
                }
                if (el) {
                    // save an Array reference of the partial's nodes
                    // so we can compile them AFTER appending the fragment
                    partialNodes = slice.call(el.childNodes)
                }
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
        if (directive) {
            this.bindDirective(directive)
        }

        // compile partial after appending, because its children's parentNode
        // will change from the fragment to the correct parentNode.
        // This could affect directives that need access to its element's parentNode.
        if (partialNodes) {
            partialNodes.forEach(this.compile, this)
        }

    }
    node.parentNode.removeChild(node)
}

/**
 *  Add a directive instance to the correct binding & viewmodel
 */
CompilerProto.bindDirective = function (directive) {

    // keep track of it so we can unbind() later
    this.dirs.push(directive)

    // for empty or literal directives, simply call its bind()
    // and we're done.
    if (directive.isEmpty || !directive._update) {
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
                compiler = compiler.parentCompiler
            }
        }
        compiler = compiler || this
        binding = compiler.bindings[key] || compiler.createBinding(key)
    }
    binding.dirs.push(directive)
    directive.binding = binding

    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind()
    }

    // set initial value
    directive.update(binding.val(), true)
}

/**
 *  Create binding and attach getter/setter for a key to the viewmodel object
 */
CompilerProto.createBinding = function (key, isExp, isFn) {

    log('  created binding: ' + key)

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
            } else {
                // normal property
                compiler.defineProp(key, binding)
            }
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
        Observer.convert(data, key)
    }

    binding.value = data[key]

    Object.defineProperty(compiler.vm, key, {
        get: function () {
            return compiler.data[key]
        },
        set: function (val) {
            compiler.data[key] = val
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
    Object.defineProperty(this.vm, key, {
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
        parent = this.parentCompiler,
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
        bindings    = compiler.bindings

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
    while (compiler.parentCompiler) {
        compiler = compiler.parentCompiler
    }
    return compiler
}

module.exports = Compiler
});
require.register("vue/src/viewmodel.js", function(exports, require, module){
var Compiler   = require('./compiler'),
    utils      = require('./utils'),
    transition = require('./transition'),
    def        = utils.defProtected,
    nextTick   = utils.nextTick

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
        obj = this
    for (var d = 0, l = path.length - 1; d < l; d++) {
        obj = obj[path[d]]
    }
    obj[path[d]] = value
})

/**
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
def(VMProto, '$watch', function (key, callback) {
    var self = this
    function on () {
        var args = arguments
        utils.nextTick(function () {
            callback.apply(self, args)
        })
    }
    callback._fn = on
    self.$compiler.observer.on('change:' + key, on)
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
    if (callback) args.push(callback._fn)
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
def(VMProto, '$dispatch', function () {
    var compiler = this.$compiler,
        emitter = compiler.emitter,
        parent = compiler.parentCompiler
    emitter.emit.apply(emitter, arguments)
    if (parent) {
        parent.vm.$dispatch.apply(parent.vm, arguments)
    }
})

/**
 *  delegate on/off/once to the compiler's emitter
 */
;['emit', 'on', 'off', 'once'].forEach(function (method) {
    def(VMProto, '$' + method, function () {
        var emitter = this.$compiler.emitter
        emitter[method].apply(emitter, arguments)
    })
})

// DOM convenience methods

def(VMProto, '$appendTo', function (target, cb) {
    target = query(target)
    var el = this.$el
    transition(el, 1, function () {
        target.appendChild(el)
        if (cb) nextTick(cb)
    }, this.$compiler)
})

def(VMProto, '$remove', function (cb) {
    var el = this.$el,
        parent = el.parentNode
    if (!parent) return
    transition(el, -1, function () {
        parent.removeChild(el)
        if (cb) nextTick(cb)
    }, this.$compiler)
})

def(VMProto, '$before', function (target, cb) {
    target = query(target)
    var el = this.$el,
        parent = target.parentNode
    if (!parent) return
    transition(el, 1, function () {
        parent.insertBefore(el, target)
        if (cb) nextTick(cb)
    }, this.$compiler)
})

def(VMProto, '$after', function (target, cb) {
    target = query(target)
    var el = this.$el,
        parent = target.parentNode,
        next = target.nextSibling
    if (!parent) return
    transition(el, 1, function () {
        if (next) {
            parent.insertBefore(el, next)
        } else {
            parent.appendChild(el)
        }
        if (cb) nextTick(cb)
    }, this.$compiler)
})

function query (el) {
    return typeof el === 'string'
        ? document.querySelector(el)
        : el
}

module.exports = ViewModel
});
require.register("vue/src/binding.js", function(exports, require, module){
var batcher = require('./batcher'),
    id = 0

/**
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (compiler, key, isExp, isFn) {
    this.id = id++
    this.value = undefined
    this.isExp = !!isExp
    this.isFn = isFn
    this.root = !this.isExp && key.indexOf('.') === -1
    this.compiler = compiler
    this.key = key
    this.dirs = []
    this.subs = []
    this.deps = []
    this.unbound = false
}

var BindingProto = Binding.prototype

/**
 *  Update value and queue instance updates.
 */
BindingProto.update = function (value) {
    if (!this.isComputed || this.isFn) {
        this.value = value
    }
    if (this.dirs.length || this.subs.length) {
        batcher.queue(this)
    }
}

/**
 *  Actually update the directives.
 */
BindingProto._update = function () {
    var i = this.dirs.length,
        value = this.val()
    while (i--) {
        this.dirs[i].update(value)
    }
    this.pub()
}

/**
 *  Return the valuated value regardless
 *  of whether it is computed or not
 */
BindingProto.val = function () {
    return this.isComputed && !this.isFn
        ? this.value.$get()
        : this.value
}

/**
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].update()
    }
}

/**
 *  Unbind the binding, remove itself from all of its dependencies
 */
BindingProto.unbind = function () {
    // Indicate this has been unbound.
    // It's possible this binding will be in
    // the batcher's flush queue when its owner
    // compiler has already been destroyed.
    this.unbound = true
    var i = this.dirs.length
    while (i--) {
        this.dirs[i].unbind()
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
require.register("vue/src/observer.js", function(exports, require, module){
/* jshint proto:true */

var Emitter  = require('./emitter'),
    utils    = require('./utils'),

    // cache methods
    typeOf   = utils.typeOf,
    def      = utils.defProtected,
    slice    = [].slice,

    // types
    OBJECT   = 'Object',
    ARRAY    = 'Array',

    // Array mutation methods to wrap
    methods  = ['push','pop','shift','unshift','splice','sort','reverse'],

    // fix for IE + __proto__ problem
    // define methods as inenumerable if __proto__ is present,
    // otherwise enumerable so we can loop through and manually
    // attach to array instances
    hasProto = ({}).__proto__,

    // lazy load
    ViewModel

// The proxy prototype to replace the __proto__ of
// an observed array
var ArrayProxy = Object.create(Array.prototype)

// Define mutation interceptors so we can emit the mutation info
methods.forEach(function (method) {
    def(ArrayProxy, method, function () {
        var result = Array.prototype[method].apply(this, arguments)
        this.__emitter__.emit('mutate', null, this, {
            method: method,
            args: slice.call(arguments),
            result: result
        })
        return result
    }, !hasProto)
})

/**
 *  Convenience method to remove an element in an Array
 *  This will be attached to observed Array instances
 */
function removeElement (index) {
    if (typeof index === 'function') {
        var i = this.length,
            removed = []
        while (i--) {
            if (index(this[i])) {
                removed.push(this.splice(i, 1)[0])
            }
        }
        return removed.reverse()
    } else {
        if (typeof index !== 'number') {
            index = this.indexOf(index)
        }
        if (index > -1) {
            return this.splice(index, 1)[0]
        }
    }
}

/**
 *  Convenience method to replace an element in an Array
 *  This will be attached to observed Array instances
 */
function replaceElement (index, data) {
    if (typeof index === 'function') {
        var i = this.length,
            replaced = [],
            replacer
        while (i--) {
            replacer = index(this[i])
            if (replacer !== undefined) {
                replaced.push(this.splice(i, 1, replacer)[0])
            }
        }
        return replaced.reverse()
    } else {
        if (typeof index !== 'number') {
            index = this.indexOf(index)
        }
        if (index > -1) {
            return this.splice(index, 1, data)[0]
        }
    }
}

// Augment the ArrayProxy with convenience methods
def(ArrayProxy, 'remove', removeElement, !hasProto)
def(ArrayProxy, 'set', replaceElement, !hasProto)
def(ArrayProxy, 'replace', replaceElement, !hasProto)

/**
 *  Watch an Object, recursive.
 */
function watchObject (obj) {
    for (var key in obj) {
        convert(obj, key)
    }
}

/**
 *  Watch an Array, overload mutation methods
 *  and add augmentations by intercepting the prototype chain
 */
function watchArray (arr) {
    var emitter = arr.__emitter__
    if (!emitter) {
        emitter = new Emitter()
        def(arr, '__emitter__', emitter)
    }
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
function convert (obj, key) {
    var keyPrefix = key.charAt(0)
    if (
        (keyPrefix === '$' || keyPrefix === '_') &&
        key !== '$index' &&
        key !== '$key' &&
        key !== '$value'
    ) {
        return
    }
    // emit set on bind
    // this means when an object is observed it will emit
    // a first batch of set events.
    var emitter = obj.__emitter__,
        values  = emitter.values

    init(obj[key])

    Object.defineProperty(obj, key, {
        get: function () {
            var value = values[key]
            // only emit get on tip values
            if (pub.shouldGet && typeOf(value) !== OBJECT) {
                emitter.emit('get', key)
            }
            return value
        },
        set: function (newVal) {
            var oldVal = values[key]
            unobserve(oldVal, key, emitter)
            copyPaths(newVal, oldVal)
            // an immediate property should notify its parent
            // to emit set for itself too
            init(newVal, true)
        }
    })

    function init (val, propagate) {
        values[key] = val
        emitter.emit('set', key, val, propagate)
        if (Array.isArray(val)) {
            emitter.emit('set', key + '.length', val.length)
        }
        observe(val, key, emitter)
    }
}

/**
 *  Check if a value is watchable
 */
function isWatchable (obj) {
    ViewModel = ViewModel || require('./viewmodel')
    var type = typeOf(obj)
    return (type === OBJECT || type === ARRAY) && !(obj instanceof ViewModel)
}

/**
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
function emitSet (obj) {
    var type = typeOf(obj),
        emitter = obj && obj.__emitter__
    if (type === ARRAY) {
        emitter.emit('set', 'length', obj.length)
    } else if (type === OBJECT) {
        var key, val
        for (key in obj) {
            val = obj[key]
            emitter.emit('set', key, val)
            emitSet(val)
        }
    }
}

/**
 *  Make sure all the paths in an old object exists
 *  in a new object.
 *  So when an object changes, all missing keys will
 *  emit a set event with undefined value.
 */
function copyPaths (newObj, oldObj) {
    if (typeOf(oldObj) !== OBJECT || typeOf(newObj) !== OBJECT) {
        return
    }
    var path, type, oldVal, newVal
    for (path in oldObj) {
        if (!(path in newObj)) {
            oldVal = oldObj[path]
            type = typeOf(oldVal)
            if (type === OBJECT) {
                newVal = newObj[path] = {}
                copyPaths(newVal, oldVal)
            } else if (type === ARRAY) {
                newObj[path] = []
            } else {
                newObj[path] = undefined
            }
        }
    }
}

/**
 *  walk along a path and make sure it can be accessed
 *  and enumerated in that object
 */
function ensurePath (obj, key) {
    var path = key.split('.'), sec
    for (var i = 0, d = path.length - 1; i < d; i++) {
        sec = path[i]
        if (!obj[sec]) {
            obj[sec] = {}
            if (obj.__emitter__) convert(obj, sec)
        }
        obj = obj[sec]
    }
    if (typeOf(obj) === OBJECT) {
        sec = path[i]
        if (!(sec in obj)) {
            obj[sec] = undefined
            if (obj.__emitter__) convert(obj, sec)
        }
    }
}

/**
 *  Observe an object with a given path,
 *  and proxy get/set/mutate events to the provided observer.
 */
function observe (obj, rawPath, observer) {

    if (!isWatchable(obj)) return

    var path = rawPath ? rawPath + '.' : '',
        alreadyConverted = !!obj.__emitter__,
        emitter

    if (!alreadyConverted) {
        def(obj, '__emitter__', new Emitter())
    }

    emitter = obj.__emitter__
    emitter.values = emitter.values || utils.hash()

    // setup proxy listeners on the parent observer.
    // we need to keep reference to them so that they
    // can be removed when the object is un-observed.
    observer.proxies = observer.proxies || {}
    var proxies = observer.proxies[path] = {
        get: function (key) {
            observer.emit('get', path + key)
        },
        set: function (key, val, propagate) {
            observer.emit('set', path + key, val)
            // also notify observer that the object itself changed
            // but only do so when it's a immediate property. this
            // avoids duplicate event firing.
            if (rawPath && propagate) {
                observer.emit('set', rawPath, obj, true)
            }
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

    // attach the listeners to the child observer.
    // now all the events will propagate upwards.
    emitter
        .on('get', proxies.get)
        .on('set', proxies.set)
        .on('mutate', proxies.mutate)

    if (alreadyConverted) {
        // for objects that have already been converted,
        // emit set events for everything inside
        emitSet(obj)
    } else {
        var type = typeOf(obj)
        if (type === OBJECT) {
            watchObject(obj)
        } else if (type === ARRAY) {
            watchArray(obj)
        }
    }
}

/**
 *  Cancel observation, turn off the listeners.
 */
function unobserve (obj, path, observer) {

    if (!obj || !obj.__emitter__) return

    path = path ? path + '.' : ''
    var proxies = observer.proxies[path]
    if (!proxies) return

    // turn off listeners
    obj.__emitter__
        .off('get', proxies.get)
        .off('set', proxies.set)
        .off('mutate', proxies.mutate)

    // remove reference
    observer.proxies[path] = null
}

var pub = module.exports = {

    // whether to emit get events
    // only enabled during dependency parsing
    shouldGet   : false,

    observe     : observe,
    unobserve   : unobserve,
    ensurePath  : ensurePath,
    convert     : convert,
    copyPaths   : copyPaths,
    watchArray  : watchArray
}
});
require.register("vue/src/directive.js", function(exports, require, module){
var utils      = require('./utils'),
    directives = require('./directives'),
    filters    = require('./filters'),

    // Regexes!

    // regex to split multiple directive expressions
    // split by commas, but ignore commas within quotes, parens and escapes.
    SPLIT_RE        = /(?:['"](?:\\.|[^'"])*['"]|\((?:\\.|[^\)])*\)|\\.|[^,])+/g,

    // match up to the first single pipe, ignore those within quotes.
    KEY_RE          = /^(?:['"](?:\\.|[^'"])*['"]|\\.|[^\|]|\|\|)+/,

    ARG_RE          = /^([\w-$ ]+):(.+)$/,
    FILTERS_RE      = /\|[^\|]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    NESTING_RE      = /^\$(parent|root)\./,
    SINGLE_VAR_RE   = /^[\w\.$]+$/

/**
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (definition, expression, rawKey, compiler, node) {

    this.compiler = compiler
    this.vm       = compiler.vm
    this.el       = node

    var isEmpty  = expression === ''

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this[isEmpty ? 'bind' : '_update'] = definition
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
    if (isEmpty) {
        this.isEmpty = true
        return
    }

    this.expression = expression.trim()
    this.rawKey     = rawKey
    
    parseKey(this, rawKey)

    this.isExp = !SINGLE_VAR_RE.test(this.key) || NESTING_RE.test(this.key)
    
    var filterExps = this.expression.slice(rawKey.length).match(FILTERS_RE)
    if (filterExps) {
        this.filters = []
        for (var i = 0, l = filterExps.length, filter; i < l; i++) {
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
    var key = rawKey
    if (rawKey.indexOf(':') > -1) {
        var argMatch = rawKey.match(ARG_RE)
        key = argMatch
            ? argMatch[2].trim()
            : key
        dir.arg = argMatch
            ? argMatch[1].trim()
            : null
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
    var type = utils.typeOf(value)
    if (init || value !== this.value || type === 'Object' || type === 'Array') {
        this.value = value
        if (this._update) {
            this._update(
                this.filters
                    ? this.applyFilters(value)
                    : value,
                init
            )
        }
    }
}

/**
 *  pipe the value through filters
 */
DirProto.applyFilters = function (value) {
    var filtered = value, filter
    for (var i = 0, l = this.filters.length; i < l; i++) {
        filter = this.filters[i]
        filtered = filter.apply.call(this.vm, filtered, filter.args)
    }
    return filtered
}

/**
 *  Unbind diretive
 */
DirProto.unbind = function () {
    // this can be called before the el is even assigned...
    if (!this.el || !this.vm) return
    if (this._unbind) this._unbind()
    this.vm = this.el = this.binding = this.compiler = null
}

// exposed methods ------------------------------------------------------------

/**
 *  split a unquoted-comma separated expression into
 *  multiple clauses
 */
Directive.split = function (exp) {
    return exp.indexOf(',') > -1
        ? exp.match(SPLIT_RE) || ['']
        : [exp]
}

/**
 *  make sure the directive and expression is valid
 *  before we create an instance
 */
Directive.parse = function (dirname, expression, compiler, node) {

    var dir = compiler.getOption('directives', dirname) || directives[dirname]
    if (!dir) return utils.warn('unknown directive: ' + dirname)

    var rawKey
    if (expression.indexOf('|') > -1) {
        var keyMatch = expression.match(KEY_RE)
        if (keyMatch) {
            rawKey = keyMatch[0].trim()
        }
    } else {
        rawKey = expression.trim()
    }
    
    // have a valid raw key, or be an empty directive
    return (rawKey || expression === '')
        ? new Directive(dir, expression, rawKey, compiler, node)
        : utils.warn('invalid directive expression: ' + expression)
}

module.exports = Directive
});
require.register("vue/src/exp-parser.js", function(exports, require, module){
var utils           = require('./utils'),
    stringSaveRE    = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g,
    stringRestoreRE = /"(\d+)"/g,
    constructorRE   = new RegExp('constructor'.split('').join('[\'"+, ]*')),
    unicodeRE       = /\\u\d\d\d\d/

// Variable extraction scooped from https://github.com/RubyLouvre/avalon

var KEYWORDS =
        // keywords
        'break,case,catch,continue,debugger,default,delete,do,else,false' +
        ',finally,for,function,if,in,instanceof,new,null,return,switch,this' +
        ',throw,true,try,typeof,var,void,while,with,undefined' +
        // reserved
        ',abstract,boolean,byte,char,class,const,double,enum,export,extends' +
        ',final,float,goto,implements,import,int,interface,long,native' +
        ',package,private,protected,public,short,static,super,synchronized' +
        ',throws,transient,volatile' +
        // ECMA 5 - use strict
        ',arguments,let,yield' +
        // allow using Math in expressions
        ',Math',
        
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
 *  A given path could potentially exist not on the
 *  current compiler, but up in the parent chain somewhere.
 *  This function generates an access relationship string
 *  that can be used in the getter function by walking up
 *  the parent chain to check for key existence.
 *
 *  It stops at top parent if no vm in the chain has the
 *  key. It then creates any missing bindings on the
 *  final resolved vm.
 */
function getRel (path, compiler) {
    var rel  = '',
        dist = 0,
        self = compiler
    while (compiler) {
        if (compiler.hasKey(path)) {
            break
        } else {
            compiler = compiler.parentCompiler
            dist++
        }
    }
    if (compiler) {
        while (dist--) {
            rel += '$parent.'
        }
        if (!compiler.bindings[path] && path.charAt(0) !== '$') {
            compiler.createBinding(path)
        }
    } else {
        self.createBinding(path)
    }
    return rel
}

/**
 *  Create a function from a string...
 *  this looks like evil magic but since all variables are limited
 *  to the VM's data it's actually properly sandboxed
 */
function makeGetter (exp, raw) {
    /* jshint evil: true */
    var fn
    try {
        fn = new Function(exp)
    } catch (e) {
        utils.warn('Invalid expression: ' + raw)
    }
    return fn
}

/**
 *  Escape a leading dollar sign for regex construction
 */
function escapeDollar (v) {
    return v.charAt(0) === '$'
        ? '\\' + v
        : v
}

module.exports = {

    /**
     *  Parse and return an anonymous computed property getter function
     *  from an arbitrary expression, together with a list of paths to be
     *  created as bindings.
     */
    parse: function (exp, compiler) {
        // unicode and 'constructor' are not allowed for XSS security.
        if (unicodeRE.test(exp) || constructorRE.test(exp)) {
            utils.warn('Unsafe expression: ' + exp)
            return function () {}
        }
        // extract variable names
        var vars = getVariables(exp)
        if (!vars.length) {
            return makeGetter('return ' + exp, exp)
        }
        vars = utils.unique(vars)
        var accessors = '',
            has       = utils.hash(),
            strings   = [],
            // construct a regex to extract all valid variable paths
            // ones that begin with "$" are particularly tricky
            // because we can't use \b for them
            pathRE = new RegExp(
                "[^$\\w\\.](" +
                vars.map(escapeDollar).join('|') +
                ")[$\\w\\.]*\\b", 'g'
            ),
            body = ('return ' + exp)
                .replace(stringSaveRE, saveStrings)
                .replace(pathRE, replacePath)
                .replace(stringRestoreRE, restoreStrings)
        body = accessors + body

        function saveStrings (str) {
            var i = strings.length
            strings[i] = str
            return '"' + i + '"'
        }

        function replacePath (path) {
            // keep track of the first char
            var c = path.charAt(0)
            path = path.slice(1)
            var val = 'this.' + getRel(path, compiler) + path
            if (!has[path]) {
                accessors += val + ';'
                has[path] = 1
            }
            // don't forget to put that first char back
            return c + val
        }

        function restoreStrings (str, i) {
            return strings[i]
        }

        return makeGetter(body, exp)
    }
}
});
require.register("vue/src/text-parser.js", function(exports, require, module){
var BINDING_RE = /{{{?([^{}]+?)}?}}/,
    TRIPLE_RE = /{{{[^{}]+}}}/

/**
 *  Parse a piece of text, return an array of tokens
 */
function parse (text) {
    if (!BINDING_RE.test(text)) return null
    var m, i, token, tokens = []
    /* jshint boss: true */
    while (m = text.match(BINDING_RE)) {
        i = m.index
        if (i > 0) tokens.push(text.slice(0, i))
        token = { key: m[1].trim() }
        if (TRIPLE_RE.test(m[0])) token.html = true
        tokens.push(token)
        text = text.slice(i + m[0].length)
    }
    if (text.length) tokens.push(text)
    return tokens
}

/**
 *  Parse an attribute value with possible interpolation tags
 *  return a Directive-friendly expression
 */
function parseAttr (attr) {
    var tokens = parse(attr)
    if (!tokens) return null
    var res = [], token
    for (var i = 0, l = tokens.length; i < l; i++) {
        token = tokens[i]
        res.push(token.key || ('"' + token + '"'))
    }
    return res.join('+')
}

exports.parse = parse
exports.parseAttr = parseAttr
});
require.register("vue/src/deps-parser.js", function(exports, require, module){
var Emitter  = require('./emitter'),
    utils    = require('./utils'),
    Observer = require('./observer'),
    catcher  = new Emitter()

/**
 *  Auto-extract the dependencies of a computed property
 *  by recording the getters triggered when evaluating it.
 */
function catchDeps (binding) {
    if (binding.isFn) return
    utils.log('\n- ' + binding.key)
    var got = utils.hash()
    binding.deps = []
    catcher.on('get', function (dep) {
        var has = got[dep.key]
        if (has && has.compiler === dep.compiler) return
        got[dep.key] = dep
        utils.log('  - ' + dep.key)
        binding.deps.push(dep)
        dep.subs.push(binding)
    })
    binding.value.$get()
    catcher.off('get')
}

module.exports = {

    /**
     *  the observer that catches events triggered by getters
     */
    catcher: catcher,

    /**
     *  parse a list of computed property bindings
     */
    parse: function (bindings) {
        utils.log('\nparsing dependencies...')
        Observer.shouldGet = true
        bindings.forEach(catchDeps)
        Observer.shouldGet = false
        utils.log('\ndone.')
    }
    
}
});
require.register("vue/src/filters.js", function(exports, require, module){
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
require.register("vue/src/transition.js", function(exports, require, module){
var endEvent   = sniffTransitionEndEvent(),
    config     = require('./config'),
    // exit codes for testing
    codes = {
        CSS_E     : 1,
        CSS_L     : 2,
        JS_E      : 3,
        JS_L      : 4,
        CSS_SKIP  : -1,
        JS_SKIP   : -2,
        JS_SKIP_E : -3,
        JS_SKIP_L : -4,
        INIT      : -5,
        SKIP      : -6
    }

/**
 *  stage:
 *    1 = enter
 *    2 = leave
 */
var transition = module.exports = function (el, stage, cb, compiler) {

    var changeState = function () {
        cb()
        compiler.execHook(stage > 0 ? 'attached' : 'detached')
    }

    if (compiler.init) {
        changeState()
        return codes.INIT
    }

    var transitionId = el.vue_trans

    if (transitionId) {
        return applyTransitionFunctions(
            el,
            stage,
            changeState,
            transitionId,
            compiler
        )
    } else if (transitionId === '') {
        return applyTransitionClass(
            el,
            stage,
            changeState
        )
    } else {
        changeState()
        return codes.SKIP
    }

}

transition.codes = codes

/**
 *  Togggle a CSS class to trigger transition
 */
function applyTransitionClass (el, stage, changeState) {

    if (!endEvent) {
        changeState()
        return codes.CSS_SKIP
    }

    // if the browser supports transition,
    // it must have classList...
    var classList         = el.classList,
        lastLeaveCallback = el.vue_trans_cb

    if (stage > 0) { // enter

        // cancel unfinished leave transition
        if (lastLeaveCallback) {
            el.removeEventListener(endEvent, lastLeaveCallback)
            el.vue_trans_cb = null
        }

        // set to hidden state before appending
        classList.add(config.enterClass)
        // append
        changeState()
        // force a layout so transition can be triggered
        /* jshint unused: false */
        var forceLayout = el.clientHeight
        // trigger transition
        classList.remove(config.enterClass)
        return codes.CSS_E

    } else { // leave

        if (el.offsetWidth || el.offsetHeight) {
            // trigger hide transition
            classList.add(config.leaveClass)
            var onEnd = function (e) {
                if (e.target === el) {
                    el.removeEventListener(endEvent, onEnd)
                    el.vue_trans_cb = null
                    // actually remove node here
                    changeState()
                    classList.remove(config.leaveClass)
                }
            }
            // attach transition end listener
            el.addEventListener(endEvent, onEnd)
            el.vue_trans_cb = onEnd
        } else {
            // directly remove invisible elements
            changeState()
        }
        return codes.CSS_L
        
    }

}

function applyTransitionFunctions (el, stage, changeState, functionId, compiler) {

    var funcs = compiler.getOption('transitions', functionId)
    if (!funcs) {
        changeState()
        return codes.JS_SKIP
    }

    var enter = funcs.enter,
        leave = funcs.leave

    if (stage > 0) { // enter
        if (typeof enter !== 'function') {
            changeState()
            return codes.JS_SKIP_E
        }
        enter(el, changeState)
        return codes.JS_E
    } else { // leave
        if (typeof leave !== 'function') {
            changeState()
            return codes.JS_SKIP_L
        }
        leave(el, changeState)
        return codes.JS_L
    }

}

/**
 *  Sniff proper transition end event name
 */
function sniffTransitionEndEvent () {
    var el = document.createElement('vue'),
        defaultEvent = 'transitionend',
        events = {
            'transition'       : defaultEvent,
            'mozTransition'    : defaultEvent,
            'webkitTransition' : 'webkitTransitionEnd'
        }
    for (var name in events) {
        if (el.style[name] !== undefined) {
            return events[name]
        }
    }
}
});
require.register("vue/src/batcher.js", function(exports, require, module){
var utils = require('./utils'),
    queue, has, waiting

reset()

exports.queue = function (binding) {
    if (!has[binding.id]) {
        queue.push(binding)
        has[binding.id] = true
        if (!waiting) {
            waiting = true
            utils.nextTick(flush)
        }
    }
}

function flush () {
    for (var i = 0; i < queue.length; i++) {
        var b = queue[i]
        if (b.unbound) continue
        b._update()
        has[b.id] = false
    }
    reset()
}

function reset () {
    queue = []
    has = utils.hash()
    waiting = false
}
});
require.register("vue/src/directives/index.js", function(exports, require, module){
var utils      = require('../utils'),
    config     = require('../config'),
    transition = require('../transition'),
    NumberRE   = /^[\d\.]+$/,
    CommaRE    = /\\,/g

module.exports = {

    on        : require('./on'),
    repeat    : require('./repeat'),
    model     : require('./model'),
    'if'      : require('./if'),
    'with'    : require('./with'),
    html      : require('./html'),
    style     : require('./style'),

    attr: function (value) {
        if (value || value === 0) {
            this.el.setAttribute(this.arg, value)
        } else {
            this.el.removeAttribute(this.arg)
        }
    },

    text: function (value) {
        this.el.textContent = utils.toText(value)
    },

    show: function (value) {
        var el = this.el,
            target = value ? '' : 'none',
            change = function () {
                el.style.display = target
            }
        transition(el, value ? 1 : -1, change, this.compiler)
    },

    'class': function (value) {
        if (this.arg) {
            utils[value ? 'addClass' : 'removeClass'](this.el, this.arg)
        } else {
            if (this.lastVal) {
                utils.removeClass(this.el, this.lastVal)
            }
            if (value) {
                utils.addClass(this.el, value)
                this.lastVal = value
            }
        }
    },

    cloak: {
        bind: function () {
            var el = this.el
            this.compiler.observer.once('hook:ready', function () {
                el.removeAttribute(config.prefix + '-cloak')
            })
        }
    },

    data: {
        bind: function () {
            var val = this.key
            this.vm.$set(
                this.arg,
                NumberRE.test(val)
                    ? +val
                    : val.replace(CommaRE, ',')
            )
        }
    }

}
});
require.register("vue/src/directives/if.js", function(exports, require, module){
var config = require('../config'),
    transition = require('../transition')

module.exports = {

    bind: function () {
        this.parent = this.el.parentNode
        this.ref = document.createComment(config.prefix + '-if-' + this.key)
        this.el.vue_ref = this.ref
    },

    update: function (value) {

        var el       = this.el

        if (!this.parent) { // the node was detached when bound
            if (!el.parentNode) {
                return
            } else {
                this.parent = el.parentNode
            }
        }

        // should always have this.parent if we reach here
        var parent   = this.parent,
            ref      = this.ref,
            compiler = this.compiler

        if (!value) {
            transition(el, -1, remove, compiler)
        } else {
            transition(el, 1, insert, compiler)
        }

        function remove () {
            if (!el.parentNode) return
            // insert the reference node
            var next = el.nextSibling
            if (next) {
                parent.insertBefore(ref, next)
            } else {
                parent.appendChild(ref)
            }
            parent.removeChild(el)
        }

        function insert () {
            if (el.parentNode) return
            parent.insertBefore(el, ref)
            parent.removeChild(ref)
        }
    },

    unbind: function () {
        this.el.vue_ref = null
        var ref = this.ref
        if (ref.parentNode) {
            ref.parentNode.removeChild(ref)
        }
    }
}
});
require.register("vue/src/directives/repeat.js", function(exports, require, module){
var Observer   = require('../observer'),
    utils      = require('../utils'),
    config     = require('../config'),
    transition = require('../transition'),
    def        = utils.defProtected,
    ViewModel // lazy def to avoid circular dependency

/**
 *  Mathods that perform precise DOM manipulation
 *  based on mutator method triggered
 */
var mutationHandlers = {

    push: function (m) {
        var l = m.args.length,
            base = this.collection.length - l
        for (var i = 0; i < l; i++) {
            this.buildItem(m.args[i], base + i)
            this.updateObject(m.args[i], 1)
        }
    },

    pop: function () {
        var vm = this.vms.pop()
        if (vm) {
            vm.$destroy()
            this.updateObject(vm.$data, -1)
        }
    },

    unshift: function (m) {
        for (var i = 0, l = m.args.length; i < l; i++) {
            this.buildItem(m.args[i], i)
            this.updateObject(m.args[i], 1)
        }
    },

    shift: function () {
        var vm = this.vms.shift()
        if (vm) {
            vm.$destroy()
            this.updateObject(vm.$data, -1)
        }
    },

    splice: function (m) {
        var i, l,
            index = m.args[0],
            removed = m.args[1],
            added = m.args.length - 2,
            removedVMs = this.vms.splice(index, removed)
        for (i = 0, l = removedVMs.length; i < l; i++) {
            removedVMs[i].$destroy()
            this.updateObject(removedVMs[i].$data, -1)
        }
        for (i = 0; i < added; i++) {
            this.buildItem(m.args[i + 2], index + i)
            this.updateObject(m.args[i + 2], 1)
        }
    },

    sort: function () {
        var vms = this.vms,
            col = this.collection,
            l = col.length,
            sorted = new Array(l),
            i, j, vm, data
        for (i = 0; i < l; i++) {
            data = col[i]
            for (j = 0; j < l; j++) {
                vm = vms[j]
                if (vm.$data === data) {
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

/**
 *  Convert an Object to a v-repeat friendly Array
 */
function objectToArray (obj) {
    var res = [], val, data
    for (var key in obj) {
        val = obj[key]
        data = utils.typeOf(val) === 'Object'
            ? val
            : { $value: val }
        def(data, '$key', key, false, true)
        res.push(data)
    }
    return res
}

/**
 *  Find an object or a wrapped data object
 *  from an Array
 */
function indexOf (arr, obj) {
    for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] === obj || (obj.$value && arr[i].$value === obj.$value)) {
            return i
        }
    }
    return -1
}

module.exports = {

    bind: function () {

        var el   = this.el,
            ctn  = this.container = el.parentNode

        // extract child VM information, if any
        ViewModel = ViewModel || require('../viewmodel')
        this.Ctor = this.Ctor || ViewModel
        // extract transition information
        this.hasTrans = el.hasAttribute(config.attrs.transition)
        // extract child Id, if any
        this.childId = utils.attr(el, 'ref')

        // create a comment node as a reference node for DOM insertions
        this.ref = document.createComment(config.prefix + '-repeat-' + this.key)
        ctn.insertBefore(this.ref, el)
        ctn.removeChild(el)

        this.initiated = false
        this.collection = null
        this.vms = null

        var self = this
        this.mutationListener = function (path, arr, mutation) {
            var method = mutation.method
            mutationHandlers[method].call(self, mutation)
            if (method !== 'push' && method !== 'pop') {
                // update index
                var i = arr.length
                while (i--) {
                    arr[i].$index = i
                }
            }
            if (method === 'push' || method === 'unshift' || method === 'splice') {
                // recalculate dependency
                self.changed()
            }
        }

    },

    update: function (collection, init) {

        if (
            collection === this.collection ||
            collection === this.object
        ) return

        if (utils.typeOf(collection) === 'Object') {
            if (this.object) {
                delete this.object.$repeater
            }
            this.object = collection
            collection = objectToArray(collection)
            def(this.object, '$repeater', collection, false, true)
        }

        this.reset()
        // attach an object to container to hold handlers
        this.container.vue_dHandlers = utils.hash()
        // if initiating with an empty collection, we need to
        // force a compile so that we get all the bindings for
        // dependency extraction.
        if (!this.initiated && (!collection || !collection.length)) {
            this.buildItem()
            this.initiated = true
        }

        // keep reference of old data and VMs
        // so we can reuse them if possible
        this.old = this.collection
        var oldVMs = this.oldVMs = this.vms

        collection = this.collection = collection || []
        this.vms = []
        if (this.childId) {
            this.vm.$[this.childId] = this.vms
        }

        // listen for collection mutation events
        // the collection has been augmented during Binding.set()
        if (!collection.__emitter__) Observer.watchArray(collection)
        collection.__emitter__.on('mutate', this.mutationListener)

        // create new VMs and append to DOM
        if (collection.length) {
            collection.forEach(this.buildItem, this)
            if (!init) this.changed()
        }

        // destroy unused old VMs
        if (oldVMs) {
            var i = oldVMs.length, vm
            while (i--) {
                vm = oldVMs[i]
                if (vm.$reused) {
                    vm.$reused = false
                } else {
                    vm.$destroy()
                }
            }
        }
        this.old = this.oldVMs = null
    },

    /**
     *  Notify parent compiler that new items
     *  have been added to the collection, it needs
     *  to re-calculate computed property dependencies.
     *  Batched to ensure it's called only once every event loop.
     */
    changed: function () {
        if (this.queued) return
        this.queued = true
        var self = this
        setTimeout(function () {
            if (!self.compiler) return
            self.compiler.parseDeps()
            self.queued = false
        }, 0)
    },

    /**
     *  Create a new child VM from a data object
     *  passing along compiler options indicating this
     *  is a v-repeat item.
     */
    buildItem: function (data, index) {

        var ctn = this.container,
            vms = this.vms,
            col = this.collection,
            el, i, ref, item, primitive, detached

        // append node into DOM first
        // so v-if can get access to parentNode
        if (data) {

            if (this.old) {
                i = indexOf(this.old, data)
            }

            if (i > -1) { // existing, reuse the old VM

                item = this.oldVMs[i]
                // mark, so it won't be destroyed
                item.$reused = true
                el = item.$el
                // don't forget to update index
                data.$index = index
                // existing VM's el can possibly be detached by v-if.
                // in that case don't insert.
                detached = !el.parentNode

            } else { // new data, need to create new VM

                el = this.el.cloneNode(true)
                // process transition info before appending
                el.vue_trans = utils.attr(el, 'transition', true)
                // wrap primitive element in an object
                if (utils.typeOf(data) !== 'Object') {
                    primitive = true
                    data = { $value: data }
                }
                // define index
                def(data, '$index', index, false, true)

            }

            ref = vms.length > index
                ? vms[index].$el
                : this.ref
            // make sure it works with v-if
            if (!ref.parentNode) ref = ref.vue_ref
            if (!detached) {
                if (i > -1) {
                    // no need to transition existing node
                    ctn.insertBefore(el, ref)
                } else {
                    // insert new node with transition
                    transition(el, 1, function () {
                        ctn.insertBefore(el, ref)
                    }, this.compiler)
                }
            } else {
                // detached by v-if
                // just move the comment ref node
                ctn.insertBefore(el.vue_ref, ref)
            }
        }

        item = item || new this.Ctor({
            el: el,
            data: data,
            compilerOptions: {
                repeat: true,
                parentCompiler: this.compiler,
                delegator: ctn
            }
        })

        if (!data) {
            // this is a forced compile for an empty collection.
            // let's remove it...
            item.$destroy()
        } else {
            vms.splice(index, 0, item)
            // for primitive values, listen for value change
            if (primitive) {
                data.__emitter__.on('set', function (key, val) {
                    if (key === '$value') {
                        col[item.$index] = val
                    }
                })
            }
        }
    },

    /**
     *  Sync changes in the $repeater Array
     *  back to the represented Object
     */
    updateObject: function (data, action) {
        if (this.object && data.$key) {
            var key = data.$key,
                val = data.$value || data
            if (action > 0) { // new property
                // make key ienumerable
                delete data.$key
                def(data, '$key', key, false, true)
                this.object[key] = val
            } else {
                delete this.object[key]
            }
            this.object.__emitter__.emit('set', key, val, true)
        }
    },

    reset: function (destroyAll) {
        if (this.childId) {
            delete this.vm.$[this.childId]
        }
        if (this.collection) {
            this.collection.__emitter__.off('mutate', this.mutationListener)
            if (destroyAll) {
                var i = this.vms.length
                while (i--) {
                    this.vms[i].$destroy()
                }
            }
        }
        var ctn = this.container,
            handlers = ctn.vue_dHandlers
        for (var key in handlers) {
            ctn.removeEventListener(handlers[key].event, handlers[key])
        }
        ctn.vue_dHandlers = null
    },

    unbind: function () {
        this.reset(true)
    }
}
});
require.register("vue/src/directives/on.js", function(exports, require, module){
var utils = require('../utils')

function delegateCheck (el, root, identifier) {
    while (el && el !== root) {
        if (el[identifier]) return el
        el = el.parentNode
    }
}

module.exports = {

    isFn: true,

    bind: function () {
        if (this.compiler.repeat) {
            // attach an identifier to the el
            // so it can be matched during event delegation
            this.el[this.expression] = true
            // attach the owner viewmodel of this directive
            this.el.vue_viewmodel = this.vm
        }
    },

    update: function (handler) {
        this.reset()
        if (typeof handler !== 'function') {
            return utils.warn('Directive "on" expects a function value.')
        }

        var compiler = this.compiler,
            event    = this.arg,
            isExp    = this.binding.isExp,
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
                dHandler   = delegator.vue_dHandlers[identifier]

            if (dHandler) return

            // the following only gets run once for the entire each block
            dHandler = delegator.vue_dHandlers[identifier] = function (e) {
                var target = delegateCheck(e.target, delegator, identifier)
                if (target) {
                    e.el = target
                    e.targetVM = target.vue_viewmodel
                    handler.call(isExp ? e.targetVM : ownerVM, e)
                }
            }
            dHandler.event = event
            delegator.addEventListener(event, dHandler)

        } else {

            // a normal, single element handler
            var vm = this.vm
            this.handler = function (e) {
                e.el = e.currentTarget
                e.targetVM = vm
                handler.call(ownerVM, e)
            }
            this.el.addEventListener(event, this.handler)

        }
    },

    reset: function () {
        this.el.removeEventListener(this.arg, this.handler)
        this.handler = null
    },

    unbind: function () {
        this.reset()
        this.el.vue_viewmodel = null
    }
}
});
require.register("vue/src/directives/model.js", function(exports, require, module){
var utils = require('../utils'),
    isIE9 = navigator.userAgent.indexOf('MSIE 9.0') > 0,
    filter = [].filter

/**
 *  Returns an array of values from a multiple select
 */
function getMultipleSelectOptions (select) {
    return filter
        .call(select.options, function (option) {
            return option.selected
        })
        .map(function (option) {
            return option.value || option.text
        })
}

module.exports = {

    bind: function () {

        var self = this,
            el   = self.el,
            type = el.type,
            tag  = el.tagName

        self.lock = false
        self.ownerVM = self.binding.compiler.vm

        // determine what event to listen to
        self.event =
            (self.compiler.options.lazy ||
            tag === 'SELECT' ||
            type === 'checkbox' || type === 'radio')
                ? 'change'
                : 'input'

        // determine the attribute to change when updating
        self.attr = type === 'checkbox'
            ? 'checked'
            : (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA')
                ? 'value'
                : 'innerHTML'

        // select[multiple] support
        if(tag === 'SELECT' && el.hasAttribute('multiple')) {
            this.multi = true
        }

        var compositionLock = false
        self.cLock = function () {
            compositionLock = true
        }
        self.cUnlock = function () {
            compositionLock = false
        }
        el.addEventListener('compositionstart', this.cLock)
        el.addEventListener('compositionend', this.cUnlock)

        // attach listener
        self.set = self.filters
            ? function () {
                if (compositionLock) return
                // if this directive has filters
                // we need to let the vm.$set trigger
                // update() so filters are applied.
                // therefore we have to record cursor position
                // so that after vm.$set changes the input
                // value we can put the cursor back at where it is
                var cursorPos
                try { cursorPos = el.selectionStart } catch (e) {}

                self._set()

                // since updates are async
                // we need to reset cursor position async too
                utils.nextTick(function () {
                    if (cursorPos !== undefined) {
                        el.setSelectionRange(cursorPos, cursorPos)
                    }
                })
            }
            : function () {
                if (compositionLock) return
                // no filters, don't let it trigger update()
                self.lock = true

                self._set()

                utils.nextTick(function () {
                    self.lock = false
                })
            }
        el.addEventListener(self.event, self.set)

        // fix shit for IE9
        // since it doesn't fire input on backspace / del / cut
        if (isIE9) {
            self.onCut = function () {
                // cut event fires before the value actually changes
                utils.nextTick(function () {
                    self.set()
                })
            }
            self.onDel = function (e) {
                if (e.keyCode === 46 || e.keyCode === 8) {
                    self.set()
                }
            }
            el.addEventListener('cut', self.onCut)
            el.addEventListener('keyup', self.onDel)
        }
    },

    _set: function () {
        this.ownerVM.$set(
            this.key, this.multi
                ? getMultipleSelectOptions(this.el)
                : this.el[this.attr]
        )
    },

    update: function (value, init) {
        /* jshint eqeqeq: false */
        // sync back inline value if initial data is undefined
        if (init && value === undefined) {
            return this._set()
        }
        if (this.lock) return
        var el = this.el
        if (el.tagName === 'SELECT') { // select dropdown
            el.selectedIndex = -1
            if(this.multi && Array.isArray(value)) {
                value.forEach(this.updateSelect, this)
            } else {
                this.updateSelect(value)
            }
        } else if (el.type === 'radio') { // radio button
            el.checked = value == el.value
        } else if (el.type === 'checkbox') { // checkbox
            el.checked = !!value
        } else {
            el[this.attr] = utils.toText(value)
        }
    },

    updateSelect: function (value) {
        /* jshint eqeqeq: false */
        // setting <select>'s value in IE9 doesn't work
        // we have to manually loop through the options
        var options = this.el.options,
            i = options.length
        while (i--) {
            if (options[i].value == value) {
                options[i].selected = true
                break
            }
        }
    },

    unbind: function () {
        var el = this.el
        el.removeEventListener(this.event, this.set)
        el.removeEventListener('compositionstart', this.cLock)
        el.removeEventListener('compositionend', this.cUnlock)
        if (isIE9) {
            el.removeEventListener('cut', this.onCut)
            el.removeEventListener('keyup', this.onDel)
        }
    }
}
});
require.register("vue/src/directives/with.js", function(exports, require, module){
var ViewModel

module.exports = {

    bind: function () {
        if (this.isEmpty) {
            this.build()
        }
    },

    update: function (value) {
        if (!this.component) {
            this.build(value)
        } else {
            this.component.$data = value
        }
    },

    build: function (value) {
        ViewModel = ViewModel || require('../viewmodel')
        var Ctor = this.Ctor || ViewModel
        this.component = new Ctor({
            el: this.el,
            data: value,
            compilerOptions: {
                parentCompiler: this.compiler
            }
        })
    },

    unbind: function () {
        this.component.$destroy()
    }

}
});
require.register("vue/src/directives/html.js", function(exports, require, module){
var toText = require('../utils').toText,
    slice = [].slice

module.exports = {

    bind: function () {
        // a comment node means this is a binding for
        // {{{ inline unescaped html }}}
        if (this.el.nodeType === 8) {
            // hold nodes
            this.holder = document.createElement('div')
            this.nodes = []
        }
    },

    update: function (value) {
        value = toText(value)
        if (this.holder) {
            this.swap(value)
        } else {
            this.el.innerHTML = value
        }
    },

    swap: function (value) {
        var parent = this.el.parentNode,
            holder = this.holder,
            nodes = this.nodes,
            i = nodes.length, l
        while (i--) {
            parent.removeChild(nodes[i])
        }
        holder.innerHTML = value
        nodes = this.nodes = slice.call(holder.childNodes)
        for (i = 0, l = nodes.length; i < l; i++) {
            parent.insertBefore(nodes[i], this.el)
        }
    }
}
});
require.register("vue/src/directives/style.js", function(exports, require, module){
var camelRE = /-([a-z])/g,
    prefixes = ['webkit', 'moz', 'ms']

function camelReplacer (m) {
    return m[1].toUpperCase()
}

module.exports = {

    bind: function () {
        var prop = this.arg
        if (!prop) return
        var first = prop.charAt(0)
        if (first === '$') {
            // properties that start with $ will be auto-prefixed
            prop = prop.slice(1)
            this.prefixed = true
        } else if (first === '-') {
            // normal starting hyphens should not be converted
            prop = prop.slice(1)
        }
        this.prop = prop.replace(camelRE, camelReplacer)
    },

    update: function (value) {
        var prop = this.prop
        if (prop) {
            this.el.style[prop] = value
            if (this.prefixed) {
                prop = prop.charAt(0).toUpperCase() + prop.slice(1)
                var i = prefixes.length
                while (i--) {
                    this.el.style[prefixes[i] + prop] = value
                }
            }
        } else {
            this.el.style.cssText = value
        }
    }

}
});
require.alias("component-emitter/index.js", "vue/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("vue/src/main.js", "vue/index.js");
if (typeof exports == 'object') {
  module.exports = require('vue');
} else if (typeof define == 'function' && define.amd) {
  define(function(){ return require('vue'); });
} else {
  window['Vue'] = require('vue');
}})();