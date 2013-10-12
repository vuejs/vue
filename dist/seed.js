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
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("seed/src/main.js", Function("exports, require, module",
"var config      = require('./config'),\n\
    ViewModel   = require('./viewmodel'),\n\
    directives  = require('./directives'),\n\
    filters     = require('./filters'),\n\
    textParser  = require('./text-parser'),\n\
    utils       = require('./utils')\n\
\n\
/*\n\
 *  Set config options\n\
 */\n\
ViewModel.config = function (opts) {\n\
    if (opts) {\n\
        utils.extend(config, opts)\n\
        textParser.buildRegex()\n\
    }\n\
}\n\
\n\
/*\n\
 *  Allows user to register/retrieve a directive definition\n\
 */\n\
ViewModel.directive = function (id, fn) {\n\
    if (!fn) return directives[id]\n\
    directives[id] = fn\n\
}\n\
\n\
/*\n\
 *  Allows user to register/retrieve a filter function\n\
 */\n\
ViewModel.filter = function (id, fn) {\n\
    if (!fn) return filters[id]\n\
    filters[id] = fn\n\
}\n\
\n\
/*\n\
 *  Allows user to register/retrieve a ViewModel constructor\n\
 */\n\
ViewModel.vm = function (id, Ctor) {\n\
    if (!Ctor) return utils.vms[id]\n\
    utils.vms[id] = Ctor\n\
}\n\
\n\
/*\n\
 *  Allows user to register/retrieve a template partial\n\
 */\n\
ViewModel.partial = function (id, partial) {\n\
    if (!partial) return utils.partials[id]\n\
    utils.partials[id] = templateToFragment(partial)\n\
}\n\
\n\
/*\n\
 *  Allows user to register/retrieve a transition definition object\n\
 */\n\
ViewModel.transition = function (id, transition) {\n\
    if (!transition) return utils.transitions[id]\n\
    utils.transitions[id] = transition\n\
}\n\
\n\
ViewModel.extend = extend\n\
\n\
/*\n\
 *  Expose the main ViewModel class\n\
 *  and add extend method\n\
 */\n\
function extend (options) {\n\
    var ParentVM = this\n\
    // inherit options\n\
    options = inheritOptions(options, ParentVM.options, true)\n\
    var ExtendedVM = function (opts) {\n\
        opts = inheritOptions(opts, options, true)\n\
        ParentVM.call(this, opts)\n\
    }\n\
    // inherit prototype props\n\
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)\n\
    utils.defProtected(proto, 'constructor', ExtendedVM)\n\
    // copy prototype props\n\
    var protoMixins = options.proto\n\
    if (protoMixins) {\n\
        for (var key in protoMixins) {\n\
            if (!(key in ViewModel.prototype)) {\n\
                proto[key] = protoMixins[key]\n\
            }\n\
        }\n\
    }\n\
    // convert template to documentFragment\n\
    if (options.template) {\n\
        options.templateFragment = templateToFragment(options.template)\n\
    }\n\
    // allow extended VM to be further extended\n\
    ExtendedVM.extend = extend\n\
    ExtendedVM.super = ParentVM\n\
    ExtendedVM.options = options\n\
    return ExtendedVM\n\
}\n\
\n\
/*\n\
 *  Inherit options\n\
 *\n\
 *  For options such as `scope`, `vms`, `directives`, 'partials',\n\
 *  they should be further extended. However extending should only\n\
 *  be done at top level.\n\
 *  \n\
 *  `proto` is an exception because it's handled directly on the\n\
 *  prototype.\n\
 *\n\
 *  `el` is an exception because it's not allowed as an\n\
 *  extension option, but only as an instance option.\n\
 */\n\
function inheritOptions (child, parent, topLevel) {\n\
    child = child || {}\n\
    convertPartials(child.partials)\n\
    if (!parent) return child\n\
    for (var key in parent) {\n\
        if (key === 'el' || key === 'proto') continue\n\
        if (!child[key]) { // child has priority\n\
            child[key] = parent[key]\n\
        } else if (topLevel && utils.typeOf(child[key]) === 'Object') {\n\
            inheritOptions(child[key], parent[key], false)\n\
        }\n\
    }\n\
    return child\n\
}\n\
\n\
/*\n\
 *  Convert an object of partials to dom fragments\n\
 */\n\
function convertPartials (partials) {\n\
    if (!partials) return\n\
    for (var key in partials) {\n\
        if (typeof partials[key] === 'string') {\n\
            partials[key] = templateToFragment(partials[key])\n\
        }\n\
    }\n\
}\n\
\n\
/*\n\
 *  Convert a string template to a dom fragment\n\
 */\n\
function templateToFragment (template) {\n\
    if (template.charAt(0) === '#') {\n\
        var templateNode = document.querySelector(template)\n\
        if (!templateNode) return\n\
        template = templateNode.innerHTML\n\
    }\n\
    var node = document.createElement('div'),\n\
        frag = document.createDocumentFragment(),\n\
        child\n\
    node.innerHTML = template.trim()\n\
    /* jshint boss: true */\n\
    while (child = node.firstChild) {\n\
        frag.appendChild(child)\n\
    }\n\
    return frag\n\
}\n\
\n\
module.exports = ViewModel//@ sourceURL=seed/src/main.js"
));
require.register("seed/src/emitter.js", Function("exports, require, module",
"// shiv to make this work for Component, Browserify and Node at the same time.\n\
var Emitter,\n\
    componentEmitter = 'emitter'\n\
\n\
try {\n\
    // Requiring without a string literal will make browserify\n\
    // unable to parse the dependency, thus preventing it from\n\
    // stopping the compilation after a failed lookup.\n\
    Emitter = require(componentEmitter)\n\
} catch (e) {}\n\
\n\
module.exports = Emitter || require('events').EventEmitter//@ sourceURL=seed/src/emitter.js"
));
require.register("seed/src/config.js", Function("exports, require, module",
"module.exports = {\n\
\n\
    prefix      : 'sd',\n\
    debug       : false,\n\
\n\
    interpolateTags : {\n\
        open  : '{{',\n\
        close : '}}'\n\
    }\n\
}//@ sourceURL=seed/src/config.js"
));
require.register("seed/src/utils.js", Function("exports, require, module",
"var config    = require('./config'),\n\
    toString  = Object.prototype.toString\n\
\n\
module.exports = {\n\
\n\
    // global storage for user-registered\n\
    // vms, partials and transitions\n\
    vms         : {},\n\
    partials    : {},\n\
    transitions : {},\n\
\n\
    /*\n\
     *  Define an ienumerable property\n\
     *  This avoids it being included in JSON.stringify\n\
     *  or for...in loops.\n\
     */\n\
    defProtected: function (obj, key, val) {\n\
        if (obj.hasOwnProperty(key)) return\n\
        Object.defineProperty(obj, key, {\n\
            enumerable: false,\n\
            configurable: false,\n\
            value: val\n\
        })\n\
    },\n\
\n\
    /*\n\
     *  Accurate type check\n\
     */\n\
    typeOf: function (obj) {\n\
        return toString.call(obj).slice(8, -1)\n\
    },\n\
\n\
    /*\n\
     *  simple extend\n\
     */\n\
    extend: function (obj, ext) {\n\
        for (var key in ext) {\n\
            obj[key] = ext[key]\n\
        }\n\
    },\n\
\n\
    /*\n\
     *  log for debugging\n\
     */\n\
    log: function () {\n\
        if (config.debug) console.log.apply(console, arguments)\n\
        return this\n\
    },\n\
    \n\
    /*\n\
     *  warn for debugging\n\
     */\n\
    warn: function() {\n\
        if (config.debug) console.warn.apply(console, arguments)\n\
        return this\n\
    }\n\
}//@ sourceURL=seed/src/utils.js"
));
require.register("seed/src/compiler.js", Function("exports, require, module",
"var Emitter     = require('./emitter'),\n\
    Observer    = require('./observer'),\n\
    config      = require('./config'),\n\
    utils       = require('./utils'),\n\
    Binding     = require('./binding'),\n\
    Directive   = require('./directive'),\n\
    TextParser  = require('./text-parser'),\n\
    DepsParser  = require('./deps-parser'),\n\
    ExpParser   = require('./exp-parser'),\n\
    slice       = Array.prototype.slice,\n\
    vmAttr,\n\
    repeatAttr,\n\
    partialAttr,\n\
    transitionAttr\n\
\n\
/*\n\
 *  The DOM compiler\n\
 *  scans a DOM node and compile bindings for a ViewModel\n\
 */\n\
function Compiler (vm, options) {\n\
\n\
    refreshPrefix()\n\
\n\
    var compiler = this\n\
\n\
    // extend options\n\
    options = compiler.options = options || {}\n\
    utils.extend(compiler, options.compilerOptions || {})\n\
\n\
    // initialize element\n\
    compiler.setupElement(options)\n\
    utils.log('\\n\
new VM instance: ', compiler.el, '\\n\
')\n\
\n\
    // copy scope properties to vm\n\
    var scope = options.scope\n\
    if (scope) utils.extend(vm, scope)\n\
\n\
    compiler.vm  = vm\n\
    vm.$compiler = compiler\n\
    vm.$el       = compiler.el\n\
\n\
    // keep track of directives and expressions\n\
    // so they can be unbound during destroy()\n\
    compiler.dirs = []\n\
    compiler.exps = []\n\
    compiler.childCompilers = [] // keep track of child compilers\n\
    compiler.emitter = new Emitter() // the emitter used for nested VM communication\n\
\n\
    // Store things during parsing to be processed afterwards,\n\
    // because we want to have created all bindings before\n\
    // observing values / parsing dependencies.\n\
    var observables = compiler.observables = [],\n\
        computed    = compiler.computed    = [],\n\
        ctxBindings = compiler.ctxBindings = []\n\
\n\
    // prototypal inheritance of bindings\n\
    var parent = compiler.parentCompiler\n\
    compiler.bindings = parent\n\
        ? Object.create(parent.bindings)\n\
        : {}\n\
    compiler.rootCompiler = parent\n\
        ? getRoot(parent)\n\
        : compiler\n\
\n\
    // setup observer\n\
    compiler.setupObserver()\n\
\n\
    // call user init. this will capture some initial values.\n\
    if (options.init) {\n\
        options.init.apply(vm, options.args || [])\n\
    }\n\
\n\
    // create bindings for keys set on the vm by the user\n\
    var key, keyPrefix\n\
    for (key in vm) {\n\
        keyPrefix = key.charAt(0)\n\
        if (keyPrefix !== '$' && keyPrefix !== '_') {\n\
            compiler.createBinding(key)\n\
        }\n\
    }\n\
\n\
    // for repeated items, create an index binding\n\
    if (compiler.repeat) {\n\
        vm[compiler.repeatPrefix].$index = compiler.repeatIndex\n\
    }\n\
\n\
    // now parse the DOM, during which we will create necessary bindings\n\
    // and bind the parsed directives\n\
    compiler.compile(compiler.el, true)\n\
\n\
    // observe root values so that they emit events when\n\
    // their nested values change (for an Object)\n\
    // or when they mutate (for an Array)\n\
    var i = observables.length, binding\n\
    while (i--) {\n\
        binding = observables[i]\n\
        Observer.observe(binding.value, binding.key, compiler.observer)\n\
    }\n\
    // extract dependencies for computed properties\n\
    if (computed.length) DepsParser.parse(computed)\n\
    // extract dependencies for computed properties with dynamic context\n\
    if (ctxBindings.length) compiler.bindContexts(ctxBindings)\n\
    // unset these no longer needed stuff\n\
    compiler.observables = compiler.computed = compiler.ctxBindings = compiler.arrays = null\n\
}\n\
\n\
var CompilerProto = Compiler.prototype\n\
\n\
/*\n\
 *  Initialize the VM/Compiler's element.\n\
 *  Fill it in with the template if necessary.\n\
 */\n\
CompilerProto.setupElement = function (options) {\n\
    // create the node first\n\
    var el = this.el = typeof options.el === 'string'\n\
        ? document.querySelector(options.el)\n\
        : options.el || document.createElement(options.tagName || 'div')\n\
\n\
    // apply element options\n\
    if (options.id) el.id = options.id\n\
    if (options.className) el.className = options.className\n\
    var attrs = options.attributes\n\
    if (attrs) {\n\
        for (var attr in attrs) {\n\
            el.setAttribute(attr, attrs[attr])\n\
        }\n\
    }\n\
\n\
    // initialize template\n\
    var template = options.template\n\
    if (typeof template === 'string') {\n\
        if (template.charAt(0) === '#') {\n\
            var templateNode = document.querySelector(template)\n\
            if (templateNode) {\n\
                el.innerHTML = templateNode.innerHTML\n\
            }\n\
        } else {\n\
            el.innerHTML = template\n\
        }\n\
    } else if (options.templateFragment) {\n\
        el.innerHTML = ''\n\
        el.appendChild(options.templateFragment.cloneNode(true))\n\
    }\n\
}\n\
\n\
/*\n\
 *  Setup observer.\n\
 *  The observer listens for get/set/mutate events on all VM\n\
 *  values/objects and trigger corresponding binding updates.\n\
 */\n\
CompilerProto.setupObserver = function () {\n\
\n\
    var bindings = this.bindings,\n\
        observer = this.observer = new Emitter(),\n\
        depsOb   = DepsParser.observer\n\
\n\
    // a hash to hold event proxies for each root level key\n\
    // so they can be referenced and removed later\n\
    observer.proxies = {}\n\
\n\
    // add own listeners which trigger binding updates\n\
    observer\n\
        .on('get', function (key) {\n\
            if (bindings[key] && depsOb.isObserving) {\n\
                depsOb.emit('get', bindings[key])\n\
            }\n\
        })\n\
        .on('set', function (key, val) {\n\
            observer.emit('change:' + key, val)\n\
            if (bindings[key]) bindings[key].update(val)\n\
        })\n\
        .on('mutate', function (key, val, mutation) {\n\
            observer.emit('change:' + key, val, mutation)\n\
            if (bindings[key]) bindings[key].pub()\n\
        })\n\
}\n\
\n\
/*\n\
 *  Compile a DOM node (recursive)\n\
 */\n\
CompilerProto.compile = function (node, root) {\n\
    var compiler = this\n\
    if (node.nodeType === 1) {\n\
        // a normal node\n\
        var repeatExp    = node.getAttribute(repeatAttr),\n\
            vmId       = node.getAttribute(vmAttr),\n\
            partialId  = node.getAttribute(partialAttr)\n\
        // we need to check for any possbile special directives\n\
        // e.g. sd-repeat, sd-viewmodel & sd-partial\n\
        if (repeatExp) { // repeat block\n\
            var directive = Directive.parse(repeatAttr, repeatExp, compiler, node)\n\
            if (directive) {\n\
                compiler.bindDirective(directive)\n\
            }\n\
        } else if (vmId && !root) { // child ViewModels\n\
            node.removeAttribute(vmAttr)\n\
            var ChildVM = compiler.getOption('vms', vmId)\n\
            if (ChildVM) {\n\
                var child = new ChildVM({\n\
                    el: node,\n\
                    child: true,\n\
                    compilerOptions: {\n\
                        parentCompiler: compiler\n\
                    }\n\
                })\n\
                compiler.childCompilers.push(child.$compiler)\n\
            }\n\
        } else {\n\
            if (partialId) { // replace innerHTML with partial\n\
                node.removeAttribute(partialAttr)\n\
                var partial = compiler.getOption('partials', partialId)\n\
                if (partial) {\n\
                    node.innerHTML = ''\n\
                    node.appendChild(partial.cloneNode(true))\n\
                }\n\
            }\n\
            // finally, only normal directives left!\n\
            compiler.compileNode(node)\n\
        }\n\
    } else if (node.nodeType === 3) { // text node\n\
        compiler.compileTextNode(node)\n\
    }\n\
}\n\
\n\
/*\n\
 *  Compile a normal node\n\
 */\n\
CompilerProto.compileNode = function (node) {\n\
    var i, j\n\
    // parse if has attributes\n\
    if (node.attributes && node.attributes.length) {\n\
        var attrs = slice.call(node.attributes),\n\
            attr, valid, exps, exp\n\
        // loop through all attributes\n\
        i = attrs.length\n\
        while (i--) {\n\
            attr = attrs[i]\n\
            valid = false\n\
            exps = attr.value.split(',')\n\
            // loop through clauses (separated by \",\")\n\
            // inside each attribute\n\
            j = exps.length\n\
            while (j--) {\n\
                exp = exps[j]\n\
                var directive = Directive.parse(attr.name, exp, this, node)\n\
                if (directive) {\n\
                    valid = true\n\
                    this.bindDirective(directive)\n\
                }\n\
            }\n\
            if (valid) node.removeAttribute(attr.name)\n\
        }\n\
    }\n\
    // recursively compile childNodes\n\
    if (node.childNodes.length) {\n\
        var nodes = slice.call(node.childNodes)\n\
        for (i = 0, j = nodes.length; i < j; i++) {\n\
            this.compile(nodes[i])\n\
        }\n\
    }\n\
}\n\
\n\
/*\n\
 *  Compile a text node\n\
 */\n\
CompilerProto.compileTextNode = function (node) {\n\
    var tokens = TextParser.parse(node.nodeValue)\n\
    if (!tokens) return\n\
    var dirname = config.prefix + '-text',\n\
        el, token, directive\n\
    for (var i = 0, l = tokens.length; i < l; i++) {\n\
        token = tokens[i]\n\
        if (token.key) { // a binding\n\
            if (token.key.charAt(0) === '>') { // a partial\n\
                var partialId = token.key.slice(1).trim(),\n\
                    partial = this.getOption('partials', partialId)\n\
                if (partial) {\n\
                    el = partial.cloneNode(true)\n\
                    this.compileNode(el)\n\
                }\n\
            } else { // a binding\n\
                el = document.createTextNode('')\n\
                directive = Directive.parse(dirname, token.key, this, el)\n\
                if (directive) {\n\
                    this.bindDirective(directive)\n\
                }\n\
            }\n\
        } else { // a plain string\n\
            el = document.createTextNode(token)\n\
        }\n\
        node.parentNode.insertBefore(el, node)\n\
    }\n\
    node.parentNode.removeChild(node)\n\
}\n\
\n\
/*\n\
 *  Add a directive instance to the correct binding & viewmodel\n\
 */\n\
CompilerProto.bindDirective = function (directive) {\n\
\n\
    var binding,\n\
        compiler      = this,\n\
        key           = directive.key,\n\
        baseKey       = key.split('.')[0],\n\
        ownerCompiler = traceOwnerCompiler(directive, compiler)\n\
\n\
    compiler.dirs.push(directive)\n\
\n\
    if (directive.isExp) {\n\
        binding = compiler.createBinding(key, true)\n\
    } else if (ownerCompiler.vm.hasOwnProperty(baseKey)) {\n\
        // if the value is present in the target VM, we create the binding on its compiler\n\
        binding = ownerCompiler.bindings.hasOwnProperty(key)\n\
            ? ownerCompiler.bindings[key]\n\
            : ownerCompiler.createBinding(key)\n\
    } else {\n\
        // due to prototypal inheritance of bindings, if a key doesn't exist here,\n\
        // it doesn't exist in the whole prototype chain. Therefore in that case\n\
        // we create the new binding at the root level.\n\
        binding = ownerCompiler.bindings[key] || compiler.rootCompiler.createBinding(key)\n\
    }\n\
\n\
    binding.instances.push(directive)\n\
    directive.binding = binding\n\
\n\
    // for newly inserted sub-VMs (repeat items), need to bind deps\n\
    // because they didn't get processed when the parent compiler\n\
    // was binding dependencies.\n\
    var i, dep, deps = binding.contextDeps\n\
    if (deps) {\n\
        i = deps.length\n\
        while (i--) {\n\
            dep = compiler.bindings[deps[i]]\n\
            dep.subs.push(directive)\n\
        }\n\
    }\n\
\n\
    var value = binding.value\n\
    // invoke bind hook if exists\n\
    if (directive.bind) {\n\
        directive.bind(value)\n\
    }\n\
\n\
    // set initial value\n\
    if (binding.isComputed) {\n\
        directive.refresh(value)\n\
    } else {\n\
        directive.update(value, true)\n\
    }\n\
}\n\
\n\
/*\n\
 *  Create binding and attach getter/setter for a key to the viewmodel object\n\
 */\n\
CompilerProto.createBinding = function (key, isExp) {\n\
\n\
    var compiler = this,\n\
        bindings = compiler.bindings,\n\
        binding  = new Binding(compiler, key, isExp)\n\
\n\
    if (isExp) {\n\
        // a complex expression binding\n\
        // we need to generate an anonymous computed property for it\n\
        var result = ExpParser.parse(key)\n\
        if (result) {\n\
            utils.log('  created anonymous binding: ' + key)\n\
            binding.value = { get: result.getter }\n\
            compiler.markComputed(binding)\n\
            compiler.exps.push(binding)\n\
            // need to create the bindings for keys\n\
            // that do not exist yet\n\
            var i = result.vars.length, v\n\
            while (i--) {\n\
                v = result.vars[i]\n\
                if (!bindings[v]) {\n\
                    compiler.rootCompiler.createBinding(v)\n\
                }\n\
            }\n\
        } else {\n\
            utils.warn('  invalid expression: ' + key)\n\
        }\n\
    } else {\n\
        utils.log('  created binding: ' + key)\n\
        bindings[key] = binding\n\
        // make sure the key exists in the object so it can be observed\n\
        // by the Observer!\n\
        compiler.ensurePath(key)\n\
        if (binding.root) {\n\
            // this is a root level binding. we need to define getter/setters for it.\n\
            compiler.define(key, binding)\n\
        } else {\n\
            var parentKey = key.slice(0, key.lastIndexOf('.'))\n\
            if (!bindings.hasOwnProperty(parentKey)) {\n\
                // this is a nested value binding, but the binding for its parent\n\
                // has not been created yet. We better create that one too.\n\
                compiler.createBinding(parentKey)\n\
            }\n\
        }\n\
    }\n\
    return binding\n\
}\n\
\n\
/*\n\
 *  Sometimes when a binding is found in the template, the value might\n\
 *  have not been set on the VM yet. To ensure computed properties and\n\
 *  dependency extraction can work, we have to create a dummy value for\n\
 *  any given path.\n\
 */\n\
CompilerProto.ensurePath = function (key) {\n\
    var path = key.split('.'), sec, obj = this.vm\n\
    for (var i = 0, d = path.length - 1; i < d; i++) {\n\
        sec = path[i]\n\
        if (!obj[sec]) obj[sec] = {}\n\
        obj = obj[sec]\n\
    }\n\
    if (utils.typeOf(obj) === 'Object') {\n\
        sec = path[i]\n\
        if (!(sec in obj)) obj[sec] = undefined\n\
    }\n\
}\n\
\n\
/*\n\
 *  Defines the getter/setter for a root-level binding on the VM\n\
 *  and observe the initial value\n\
 */\n\
CompilerProto.define = function (key, binding) {\n\
\n\
    utils.log('    defined root binding: ' + key)\n\
\n\
    var compiler = this,\n\
        vm = compiler.vm,\n\
        ob = compiler.observer,\n\
        value = binding.value = vm[key], // save the value before redefinening it\n\
        type = utils.typeOf(value)\n\
\n\
    if (type === 'Object' && value.get) {\n\
        // computed property\n\
        compiler.markComputed(binding)\n\
    } else if (type === 'Object' || type === 'Array') {\n\
        // observe objects later, becase there might be more keys\n\
        // to be added to it. we also want to emit all the set events\n\
        // after all values are available.\n\
        compiler.observables.push(binding)\n\
    }\n\
\n\
    Object.defineProperty(vm, key, {\n\
        enumerable: true,\n\
        get: function () {\n\
            var value = binding.value\n\
            if ((!binding.isComputed && (!value || !value.__observer__)) ||\n\
                Array.isArray(value)) {\n\
                // only emit non-computed, non-observed (primitive) values, or Arrays.\n\
                // because these are the cleanest dependencies\n\
                ob.emit('get', key)\n\
            }\n\
            return binding.isComputed\n\
                ? value.get({\n\
                    el: compiler.el,\n\
                    vm: vm,\n\
                    item: compiler.repeat\n\
                        ? vm[compiler.repeatPrefix]\n\
                        : null\n\
                })\n\
                : value\n\
        },\n\
        set: function (newVal) {\n\
            var value = binding.value\n\
            if (binding.isComputed) {\n\
                if (value.set) {\n\
                    value.set(newVal)\n\
                }\n\
            } else if (newVal !== value) {\n\
                // unwatch the old value\n\
                Observer.unobserve(value, key, ob)\n\
                // set new value\n\
                binding.value = newVal\n\
                ob.emit('set', key, newVal)\n\
                // now watch the new value, which in turn emits 'set'\n\
                // for all its nested values\n\
                Observer.observe(newVal, key, ob)\n\
            }\n\
        }\n\
    })\n\
}\n\
\n\
/*\n\
 *  Process a computed property binding\n\
 */\n\
CompilerProto.markComputed = function (binding) {\n\
    var value = binding.value,\n\
        vm    = this.vm\n\
    binding.isComputed = true\n\
    // keep a copy of the raw getter\n\
    // for extracting contextual dependencies\n\
    binding.rawGet = value.get\n\
    // bind the accessors to the vm\n\
    value.get = value.get.bind(vm)\n\
    if (value.set) value.set = value.set.bind(vm)\n\
    // keep track for dep parsing later\n\
    this.computed.push(binding)\n\
}\n\
\n\
/*\n\
 *  Process subscriptions for computed properties that has\n\
 *  dynamic context dependencies\n\
 */\n\
CompilerProto.bindContexts = function (bindings) {\n\
    var i = bindings.length, j, k, binding, depKey, dep, ins\n\
    while (i--) {\n\
        binding = bindings[i]\n\
        j = binding.contextDeps.length\n\
        while (j--) {\n\
            depKey = binding.contextDeps[j]\n\
            k = binding.instances.length\n\
            while (k--) {\n\
                ins = binding.instances[k]\n\
                dep = ins.compiler.bindings[depKey]\n\
                dep.subs.push(ins)\n\
            }\n\
        }\n\
    }\n\
}\n\
\n\
/*\n\
 *  Retrive an option from the compiler\n\
 */\n\
CompilerProto.getOption = function (type, id) {\n\
    var opts = this.options\n\
    return (opts[type] && opts[type][id]) || (utils[type] && utils[type][id])\n\
}\n\
\n\
/*\n\
 *  Unbind and remove element\n\
 */\n\
CompilerProto.destroy = function () {\n\
    var compiler = this\n\
    utils.log('compiler destroyed: ', compiler.vm.$el)\n\
    // unwatch\n\
    compiler.observer.off()\n\
    var i, key, dir, inss, binding,\n\
        el         = compiler.el,\n\
        directives = compiler.dirs,\n\
        exps       = compiler.exps,\n\
        bindings   = compiler.bindings\n\
    // remove all directives that are instances of external bindings\n\
    i = directives.length\n\
    while (i--) {\n\
        dir = directives[i]\n\
        if (dir.binding.compiler !== compiler) {\n\
            inss = dir.binding.instances\n\
            if (inss) inss.splice(inss.indexOf(dir), 1)\n\
        }\n\
        dir.unbind()\n\
    }\n\
    // unbind all expressions (anonymous bindings)\n\
    i = exps.length\n\
    while (i--) {\n\
        exps[i].unbind()\n\
    }\n\
    // unbind/unobserve all own bindings\n\
    for (key in bindings) {\n\
        if (bindings.hasOwnProperty(key)) {\n\
            binding = bindings[key]\n\
            if (binding.root) {\n\
                Observer.unobserve(binding.value, binding.key, compiler.observer)\n\
            }\n\
            binding.unbind()\n\
        }\n\
    }\n\
    // remove self from parentCompiler\n\
    var parent = compiler.parentCompiler\n\
    if (parent) {\n\
        parent.childCompilers.splice(parent.childCompilers.indexOf(compiler), 1)\n\
    }\n\
    // remove el\n\
    if (el === document.body) {\n\
        el.innerHTML = ''\n\
    } else if (el.parentNode) {\n\
        el.parentNode.removeChild(el)\n\
    }\n\
}\n\
\n\
// Helpers --------------------------------------------------------------------\n\
\n\
/*\n\
 *  Refresh prefix in case it has been changed\n\
 *  during compilations\n\
 */\n\
function refreshPrefix () {\n\
    var prefix     = config.prefix\n\
    repeatAttr       = prefix + '-repeat'\n\
    vmAttr         = prefix + '-viewmodel'\n\
    partialAttr    = prefix + '-partial'\n\
    transitionAttr = prefix + '-transition'\n\
}\n\
\n\
/*\n\
 *  determine which viewmodel a key belongs to based on nesting symbols\n\
 */\n\
function traceOwnerCompiler (key, compiler) {\n\
    if (key.nesting) {\n\
        var levels = key.nesting\n\
        while (compiler.parentCompiler && levels--) {\n\
            compiler = compiler.parentCompiler\n\
        }\n\
    } else if (key.root) {\n\
        while (compiler.parentCompiler) {\n\
            compiler = compiler.parentCompiler\n\
        }\n\
    }\n\
    return compiler\n\
}\n\
\n\
/*\n\
 *  shorthand for getting root compiler\n\
 */\n\
function getRoot (compiler) {\n\
    return traceOwnerCompiler({ root: true }, compiler)\n\
}\n\
\n\
module.exports = Compiler//@ sourceURL=seed/src/compiler.js"
));
require.register("seed/src/viewmodel.js", Function("exports, require, module",
"var Compiler = require('./compiler')\n\
\n\
/*\n\
 *  ViewModel exposed to the user that holds data,\n\
 *  computed properties, event handlers\n\
 *  and a few reserved methods\n\
 */\n\
function ViewModel (options) {\n\
    // just compile. options are passed directly to compiler\n\
    new Compiler(this, options)\n\
}\n\
\n\
var VMProto = ViewModel.prototype\n\
\n\
/*\n\
 *  Convenience function to set an actual nested value\n\
 *  from a flat key string. Used in directives.\n\
 */\n\
VMProto.$set = function (key, value) {\n\
    var path = key.split('.'),\n\
        obj = getTargetVM(this, path)\n\
    if (!obj) return\n\
    for (var d = 0, l = path.length - 1; d < l; d++) {\n\
        obj = obj[path[d]]\n\
    }\n\
    obj[path[d]] = value\n\
}\n\
\n\
/*\n\
 *  The function for getting a key\n\
 *  which will go up along the prototype chain of the bindings\n\
 *  Used in exp-parser.\n\
 */\n\
VMProto.$get = function (key) {\n\
    var path = key.split('.'),\n\
        obj = getTargetVM(this, path),\n\
        vm = obj\n\
    if (!obj) return\n\
    for (var d = 0, l = path.length; d < l; d++) {\n\
        obj = obj[path[d]]\n\
    }\n\
    if (typeof obj === 'function') obj = obj.bind(vm)\n\
    return obj\n\
}\n\
\n\
/*\n\
 *  watch a key on the viewmodel for changes\n\
 *  fire callback with new value\n\
 */\n\
VMProto.$watch = function (key, callback) {\n\
    this.$compiler.observer.on('change:' + key, callback)\n\
}\n\
\n\
/*\n\
 *  unwatch a key\n\
 */\n\
VMProto.$unwatch = function (key, callback) {\n\
    // workaround here\n\
    // since the emitter module checks callback existence\n\
    // by checking the length of arguments\n\
    var args = ['change:' + key],\n\
        ob = this.$compiler.observer\n\
    if (callback) args.push(callback)\n\
    ob.off.apply(ob, args)\n\
}\n\
\n\
/*\n\
 *  unbind everything, remove everything\n\
 */\n\
VMProto.$destroy = function () {\n\
    this.$compiler.destroy()\n\
    this.$compiler = null\n\
}\n\
\n\
/*\n\
 *  broadcast an event to all child VMs recursively.\n\
 */\n\
VMProto.$broadcast = function () {\n\
    var children = this.$compiler.childCompilers,\n\
        i = children.length,\n\
        child\n\
    while (i--) {\n\
        child = children[i]\n\
        child.emitter.emit.apply(child.emitter, arguments)\n\
        child.vm.$broadcast.apply(child.vm, arguments)\n\
    }\n\
}\n\
\n\
/*\n\
 *  emit an event that propagates all the way up to parent VMs.\n\
 */\n\
VMProto.$emit = function () {\n\
    var parent = this.$compiler.parentCompiler\n\
    if (parent) {\n\
        parent.emitter.emit.apply(parent.emitter, arguments)\n\
        parent.vm.$emit.apply(parent.vm, arguments)\n\
    }\n\
}\n\
\n\
/*\n\
 *  listen for a broadcasted/emitted event\n\
 */\n\
VMProto.$on = function () {\n\
    var emitter = this.$compiler.emitter\n\
    emitter.on.apply(emitter, arguments)\n\
}\n\
\n\
/*\n\
 *  stop listening\n\
 */\n\
VMProto.$off = function () {\n\
    var emitter = this.$compiler.emitter\n\
    emitter.off.apply(emitter, arguments)\n\
}\n\
\n\
/*\n\
 *  If a VM doesn't contain a path, go up the prototype chain\n\
 *  to locate the ancestor that has it.\n\
 */\n\
function getTargetVM (vm, path) {\n\
    var baseKey = path[0],\n\
        binding = vm.$compiler.bindings[baseKey]\n\
    return binding\n\
        ? binding.compiler.vm\n\
        : null\n\
}\n\
\n\
module.exports = ViewModel//@ sourceURL=seed/src/viewmodel.js"
));
require.register("seed/src/binding.js", Function("exports, require, module",
"/*\n\
 *  Binding class.\n\
 *\n\
 *  each property on the viewmodel has one corresponding Binding object\n\
 *  which has multiple directive instances on the DOM\n\
 *  and multiple computed property dependents\n\
 */\n\
function Binding (compiler, key, isExp) {\n\
    this.value = undefined\n\
    this.isExp = !!isExp\n\
    this.root = !this.isExp && key.indexOf('.') === -1\n\
    this.compiler = compiler\n\
    this.key = key\n\
    this.instances = []\n\
    this.subs = []\n\
    this.deps = []\n\
}\n\
\n\
var BindingProto = Binding.prototype\n\
\n\
/*\n\
 *  Process the value, then trigger updates on all dependents\n\
 */\n\
BindingProto.update = function (value) {\n\
    this.value = value\n\
    var i = this.instances.length\n\
    while (i--) {\n\
        this.instances[i].update(value)\n\
    }\n\
    this.pub()\n\
}\n\
\n\
/*\n\
 *  -- computed property only --    \n\
 *  Force all instances to re-evaluate themselves\n\
 */\n\
BindingProto.refresh = function () {\n\
    var i = this.instances.length\n\
    while (i--) {\n\
        this.instances[i].refresh()\n\
    }\n\
    this.pub()\n\
}\n\
\n\
/*\n\
 *  Notify computed properties that depend on this binding\n\
 *  to update themselves\n\
 */\n\
BindingProto.pub = function () {\n\
    var i = this.subs.length\n\
    while (i--) {\n\
        this.subs[i].refresh()\n\
    }\n\
}\n\
\n\
/*\n\
 *  Unbind the binding, remove itself from all of its dependencies\n\
 */\n\
BindingProto.unbind = function () {\n\
    var i = this.instances.length\n\
    while (i--) {\n\
        this.instances[i].unbind()\n\
    }\n\
    i = this.deps.length\n\
    var subs\n\
    while (i--) {\n\
        subs = this.deps[i].subs\n\
        subs.splice(subs.indexOf(this), 1)\n\
    }\n\
    this.compiler = this.pubs = this.subs = this.instances = this.deps = null\n\
}\n\
\n\
module.exports = Binding//@ sourceURL=seed/src/binding.js"
));
require.register("seed/src/observer.js", Function("exports, require, module",
"var Emitter = require('./emitter'),\n\
    utils   = require('./utils'),\n\
    typeOf  = utils.typeOf,\n\
    def     = utils.defProtected,\n\
    slice   = Array.prototype.slice,\n\
    methods = ['push','pop','shift','unshift','splice','sort','reverse']\n\
\n\
// The proxy prototype to replace the __proto__ of\n\
// an observed array\n\
var ArrayProxy = Object.create(Array.prototype)\n\
\n\
// Define mutation interceptors so we can emit the mutation info\n\
methods.forEach(function (method) {\n\
    utils.defProtected(ArrayProxy, method, function () {\n\
        var result = Array.prototype[method].apply(this, arguments)\n\
        this.__observer__.emit('mutate', this.__observer__.path, this, {\n\
            method: method,\n\
            args: slice.call(arguments),\n\
            result: result\n\
        })\n\
        return result\n\
    })\n\
})\n\
\n\
// Augment it with several convenience methods\n\
var extensions = {\n\
    remove: function (index) {\n\
        if (typeof index !== 'number') index = this.indexOf(index)\n\
        return this.splice(index, 1)[0]\n\
    },\n\
    replace: function (index, data) {\n\
        if (typeof index !== 'number') index = this.indexOf(index)\n\
        if (this[index] !== undefined) return this.splice(index, 1, data)[0]\n\
    },\n\
    mutateFilter: function (fn) {\n\
        var i = this.length\n\
        while (i--) {\n\
            if (!fn(this[i])) this.splice(i, 1)\n\
        }\n\
        return this\n\
    }\n\
}\n\
\n\
for (var method in extensions) {\n\
    utils.defProtected(ArrayProxy, method, extensions[method])\n\
}\n\
\n\
/*\n\
 *  Watch an object based on type\n\
 */\n\
function watch (obj, path, observer) {\n\
    var type = typeOf(obj)\n\
    if (type === 'Object') {\n\
        watchObject(obj, path, observer)\n\
    } else if (type === 'Array') {\n\
        watchArray(obj, path, observer)\n\
    }\n\
}\n\
\n\
/*\n\
 *  Watch an Object, recursive.\n\
 */\n\
function watchObject (obj, path, observer) {\n\
    for (var key in obj) {\n\
        bind(obj, key, path, observer)\n\
    }\n\
}\n\
\n\
/*\n\
 *  Watch an Array, overload mutation methods\n\
 *  and add augmentations by intercepting the prototype chain\n\
 */\n\
function watchArray (arr, path, observer) {\n\
    def(arr, '__observer__', observer)\n\
    observer.path = path\n\
    /* jshint proto:true */\n\
    arr.__proto__ = ArrayProxy\n\
}\n\
\n\
/*\n\
 *  Define accessors for a property on an Object\n\
 *  so it emits get/set events.\n\
 *  Then watch the value itself.\n\
 */\n\
function bind (obj, key, path, observer) {\n\
    var val       = obj[key],\n\
        watchable = isWatchable(val),\n\
        values    = observer.values,\n\
        fullKey   = (path ? path + '.' : '') + key\n\
    values[fullKey] = val\n\
    // emit set on bind\n\
    // this means when an object is observed it will emit\n\
    // a first batch of set events.\n\
    observer.emit('set', fullKey, val)\n\
    Object.defineProperty(obj, key, {\n\
        enumerable: true,\n\
        get: function () {\n\
            // only emit get on tip values\n\
            if (!watchable) observer.emit('get', fullKey)\n\
            return values[fullKey]\n\
        },\n\
        set: function (newVal) {\n\
            values[fullKey] = newVal\n\
            observer.emit('set', fullKey, newVal)\n\
            watch(newVal, fullKey, observer)\n\
        }\n\
    })\n\
    watch(val, fullKey, observer)\n\
}\n\
\n\
/*\n\
 *  Check if a value is watchable\n\
 */\n\
function isWatchable (obj) {\n\
    var type = typeOf(obj)\n\
    return type === 'Object' || type === 'Array'\n\
}\n\
\n\
/*\n\
 *  When a value that is already converted is\n\
 *  observed again by another observer, we can skip\n\
 *  the watch conversion and simply emit set event for\n\
 *  all of its properties.\n\
 */\n\
function emitSet (obj, observer) {\n\
    if (typeOf(obj) === 'Array') {\n\
        observer.emit('set', 'length', obj.length)\n\
    } else {\n\
        var key, val, values = observer.values\n\
        for (key in observer.values) {\n\
            val = values[key]\n\
            observer.emit('set', key, val)\n\
        }\n\
    }\n\
}\n\
\n\
module.exports = {\n\
\n\
    // used in sd-repeat\n\
    watchArray: watchArray,\n\
\n\
    /*\n\
     *  Observe an object with a given path,\n\
     *  and proxy get/set/mutate events to the provided observer.\n\
     */\n\
    observe: function (obj, rawPath, observer) {\n\
        if (isWatchable(obj)) {\n\
            var path = rawPath + '.',\n\
                ob, alreadyConverted = !!obj.__observer__\n\
            if (!alreadyConverted) {\n\
                def(obj, '__observer__', new Emitter())\n\
            }\n\
            ob = obj.__observer__\n\
            ob.values = ob.values || {}\n\
            var proxies = observer.proxies[path] = {\n\
                get: function (key) {\n\
                    observer.emit('get', path + key)\n\
                },\n\
                set: function (key, val) {\n\
                    observer.emit('set', path + key, val)\n\
                },\n\
                mutate: function (key, val, mutation) {\n\
                    // if the Array is a root value\n\
                    // the key will be null\n\
                    var fixedPath = key ? path + key : rawPath\n\
                    observer.emit('mutate', fixedPath, val, mutation)\n\
                    // also emit set for Array's length when it mutates\n\
                    var m = mutation.method\n\
                    if (m !== 'sort' && m !== 'reverse') {\n\
                        observer.emit('set', fixedPath + '.length', val.length)\n\
                    }\n\
                }\n\
            }\n\
            ob\n\
                .on('get', proxies.get)\n\
                .on('set', proxies.set)\n\
                .on('mutate', proxies.mutate)\n\
            if (alreadyConverted) {\n\
                emitSet(obj, ob, rawPath)\n\
            } else {\n\
                watch(obj, null, ob)\n\
            }\n\
        }\n\
    },\n\
\n\
    /*\n\
     *  Cancel observation, turn off the listeners.\n\
     */\n\
    unobserve: function (obj, path, observer) {\n\
        if (!obj || !obj.__observer__) return\n\
        path = path + '.'\n\
        var proxies = observer.proxies[path]\n\
        obj.__observer__\n\
            .off('get', proxies.get)\n\
            .off('set', proxies.set)\n\
            .off('mutate', proxies.mutate)\n\
        observer.proxies[path] = null\n\
    }\n\
}//@ sourceURL=seed/src/observer.js"
));
require.register("seed/src/directive.js", Function("exports, require, module",
"var config     = require('./config'),\n\
    utils      = require('./utils'),\n\
    directives = require('./directives'),\n\
    filters    = require('./filters')\n\
\n\
var KEY_RE          = /^[^\\|]+/,\n\
    ARG_RE          = /([^:]+):(.+)$/,\n\
    FILTERS_RE      = /\\|[^\\|]+/g,\n\
    FILTER_TOKEN_RE = /[^\\s']+|'[^']+'/g,\n\
    NESTING_RE      = /^\\^+/,\n\
    SINGLE_VAR_RE   = /^[\\w\\.\\$]+$/\n\
\n\
/*\n\
 *  Directive class\n\
 *  represents a single directive instance in the DOM\n\
 */\n\
function Directive (definition, directiveName, expression, rawKey, compiler, node) {\n\
\n\
    this.compiler = compiler\n\
    this.vm       = compiler.vm\n\
    this.el       = node\n\
\n\
    // mix in properties from the directive definition\n\
    if (typeof definition === 'function') {\n\
        this._update = definition\n\
    } else {\n\
        for (var prop in definition) {\n\
            if (prop === 'unbind' || prop === 'update') {\n\
                this['_' + prop] = definition[prop]\n\
            } else {\n\
                this[prop] = definition[prop]\n\
            }\n\
        }\n\
    }\n\
\n\
    this.name       = directiveName\n\
    this.expression = expression.trim()\n\
    this.rawKey     = rawKey\n\
    \n\
    parseKey(this, rawKey)\n\
\n\
    this.isExp = !SINGLE_VAR_RE.test(this.key)\n\
    \n\
    var filterExps = expression.match(FILTERS_RE)\n\
    if (filterExps) {\n\
        this.filters = []\n\
        var i = 0, l = filterExps.length, filter\n\
        for (; i < l; i++) {\n\
            filter = parseFilter(filterExps[i], this.compiler)\n\
            if (filter) this.filters.push(filter)\n\
        }\n\
        if (!this.filters.length) this.filters = null\n\
    } else {\n\
        this.filters = null\n\
    }\n\
}\n\
\n\
var DirProto = Directive.prototype\n\
\n\
/*\n\
 *  parse a key, extract argument and nesting/root info\n\
 */\n\
function parseKey (dir, rawKey) {\n\
\n\
    var argMatch = rawKey.match(ARG_RE)\n\
\n\
    var key = argMatch\n\
        ? argMatch[2].trim()\n\
        : rawKey.trim()\n\
\n\
    dir.arg = argMatch\n\
        ? argMatch[1].trim()\n\
        : null\n\
\n\
    var nesting = key.match(NESTING_RE)\n\
    dir.nesting = nesting\n\
        ? nesting[0].length\n\
        : false\n\
\n\
    dir.root = key.charAt(0) === '$'\n\
\n\
    if (dir.nesting) {\n\
        key = key.replace(NESTING_RE, '')\n\
    } else if (dir.root) {\n\
        key = key.slice(1)\n\
    }\n\
\n\
    dir.key = key\n\
}\n\
\n\
/*\n\
 *  parse a filter expression\n\
 */\n\
function parseFilter (filter, compiler) {\n\
\n\
    var tokens = filter.slice(1).match(FILTER_TOKEN_RE)\n\
    if (!tokens) return\n\
    tokens = tokens.map(function (token) {\n\
        return token.replace(/'/g, '').trim()\n\
    })\n\
\n\
    var name = tokens[0],\n\
        apply = compiler.getOption('filters', name) || filters[name]\n\
    if (!apply) {\n\
        utils.warn('Unknown filter: ' + name)\n\
        return\n\
    }\n\
\n\
    return {\n\
        name  : name,\n\
        apply : apply,\n\
        args  : tokens.length > 1\n\
                ? tokens.slice(1)\n\
                : null\n\
    }\n\
}\n\
\n\
/*\n\
 *  called when a new value is set \n\
 *  for computed properties, this will only be called once\n\
 *  during initialization.\n\
 */\n\
DirProto.update = function (value, init) {\n\
    if (!init && value === this.value) return\n\
    this.value = value\n\
    this.apply(value)\n\
}\n\
\n\
/*\n\
 *  -- computed property only --\n\
 *  called when a dependency has changed\n\
 */\n\
DirProto.refresh = function (value) {\n\
    // pass element and viewmodel info to the getter\n\
    // enables context-aware bindings\n\
    if (value) this.value = value\n\
    value = this.value.get({\n\
        el: this.el,\n\
        vm: this.vm\n\
    })\n\
    if (value && value === this.computedValue) return\n\
    this.computedValue = value\n\
    this.apply(value)\n\
}\n\
\n\
/*\n\
 *  Actually invoking the _update from the directive's definition\n\
 */\n\
DirProto.apply = function (value) {\n\
    this._update(\n\
        this.filters\n\
        ? this.applyFilters(value)\n\
        : value\n\
    )\n\
}\n\
\n\
/*\n\
 *  pipe the value through filters\n\
 */\n\
DirProto.applyFilters = function (value) {\n\
    var filtered = value, filter\n\
    for (var i = 0, l = this.filters.length; i < l; i++) {\n\
        filter = this.filters[i]\n\
        filtered = filter.apply(filtered, filter.args)\n\
    }\n\
    return filtered\n\
}\n\
\n\
/*\n\
 *  Unbind diretive\n\
 *  @ param {Boolean} update\n\
 *    Sometimes we call unbind before an update (i.e. not destroy)\n\
 *    just to teardown previousstuff, in that case we do not want\n\
 *    to null everything.\n\
 */\n\
DirProto.unbind = function (update) {\n\
    // this can be called before the el is even assigned...\n\
    if (!this.el) return\n\
    if (this._unbind) this._unbind(update)\n\
    if (!update) this.vm = this.el = this.binding = this.compiler = null\n\
}\n\
\n\
/*\n\
 *  make sure the directive and expression is valid\n\
 *  before we create an instance\n\
 */\n\
Directive.parse = function (dirname, expression, compiler, node) {\n\
\n\
    var prefix = config.prefix\n\
    if (dirname.indexOf(prefix) === -1) return null\n\
    dirname = dirname.slice(prefix.length + 1)\n\
\n\
    var dir = compiler.getOption('directives', dirname) || directives[dirname],\n\
        keyMatch = expression.match(KEY_RE),\n\
        rawKey = keyMatch && keyMatch[0].trim()\n\
\n\
    if (!dir) utils.warn('unknown directive: ' + dirname)\n\
    if (!rawKey) utils.warn('invalid directive expression: ' + expression)\n\
\n\
    return dir && rawKey\n\
        ? new Directive(dir, dirname, expression, rawKey, compiler, node)\n\
        : null\n\
}\n\
\n\
module.exports = Directive//@ sourceURL=seed/src/directive.js"
));
require.register("seed/src/exp-parser.js", Function("exports, require, module",
"// Variable extraction scooped from https://github.com/RubyLouvre/avalon \n\
var KEYWORDS =\n\
        // keywords\n\
        'break,case,catch,continue,debugger,default,delete,do,else,false'\n\
        + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'\n\
        + ',throw,true,try,typeof,var,void,while,with'\n\
        // reserved\n\
        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'\n\
        + ',final,float,goto,implements,import,int,interface,long,native'\n\
        + ',package,private,protected,public,short,static,super,synchronized'\n\
        + ',throws,transient,volatile'\n\
        // ECMA 5 - use strict\n\
        + ',arguments,let,yield'\n\
        + ',undefined',\n\
    KEYWORDS_RE = new RegExp([\"\\\\b\" + KEYWORDS.replace(/,/g, '\\\\b|\\\\b') + \"\\\\b\"].join('|'), 'g'),\n\
    REMOVE_RE   = /\\/\\*(?:.|\\n\
)*?\\*\\/|\\/\\/[^\\n\
]*\\n\
|\\/\\/[^\\n\
]*$|'[^']*'|\"[^\"]*\"|[\\s\\t\\n\
]*\\.[\\s\\t\\n\
]*[$\\w\\.]+/g,\n\
    SPLIT_RE    = /[^\\w$]+/g,\n\
    NUMBER_RE   = /\\b\\d[^,]*/g,\n\
    BOUNDARY_RE = /^,+|,+$/g\n\
\n\
function getVariables (code) {\n\
    code = code\n\
        .replace(REMOVE_RE, '')\n\
        .replace(SPLIT_RE, ',')\n\
        .replace(KEYWORDS_RE, '')\n\
        .replace(NUMBER_RE, '')\n\
        .replace(BOUNDARY_RE, '')\n\
    return code\n\
        ? code.split(/,+/)\n\
        : []\n\
}\n\
\n\
module.exports = {\n\
\n\
    /*\n\
     *  Parse and create an anonymous computed property getter function\n\
     *  from an arbitrary expression.\n\
     */\n\
    parse: function (exp) {\n\
        // extract variable names\n\
        var vars = getVariables(exp)\n\
        if (!vars.length) return null\n\
        var args = [],\n\
            v, i, keyPrefix,\n\
            l = vars.length,\n\
            hash = {}\n\
        for (i = 0; i < l; i++) {\n\
            v = vars[i]\n\
            // avoid duplicate keys\n\
            if (hash[v]) continue\n\
            hash[v] = v\n\
            // push assignment\n\
            keyPrefix = v.charAt(0)\n\
            args.push(v + (\n\
                (keyPrefix === '$' || keyPrefix === '_')\n\
                    ? '=this.' + v\n\
                    : '=this.$get(\"' + v + '\")'\n\
                ))\n\
        }\n\
        args = 'var ' + args.join(',') + ';return ' + exp\n\
        /* jshint evil: true */\n\
        return {\n\
            getter: new Function(args),\n\
            vars: Object.keys(hash)\n\
        }\n\
    }\n\
}//@ sourceURL=seed/src/exp-parser.js"
));
require.register("seed/src/text-parser.js", Function("exports, require, module",
"var config     = require('./config'),\n\
    ESCAPE_RE  = /[-.*+?^${}()|[\\]\\/\\\\]/g,\n\
    BINDING_RE = build()\n\
\n\
/*\n\
 *  Build interpolate tag regex from config settings\n\
 */\n\
function build () {\n\
    var open = escapeRegex(config.interpolateTags.open),\n\
        close = escapeRegex(config.interpolateTags.close)\n\
    return new RegExp(open + '(.+?)' + close)\n\
}\n\
\n\
/*\n\
 *  Escapes a string so that it can be used to construct RegExp\n\
 */\n\
function escapeRegex (val) {\n\
    return val.replace(ESCAPE_RE, '\\\\$&')\n\
}\n\
\n\
module.exports = {\n\
\n\
    /*\n\
     *  Parse a piece of text, return an array of tokens\n\
     */\n\
    parse: function (text) {\n\
        if (!BINDING_RE.test(text)) return null\n\
        var m, i, tokens = []\n\
        do {\n\
            m = text.match(BINDING_RE)\n\
            if (!m) break\n\
            i = m.index\n\
            if (i > 0) tokens.push(text.slice(0, i))\n\
            tokens.push({ key: m[1].trim() })\n\
            text = text.slice(i + m[0].length)\n\
        } while (true)\n\
        if (text.length) tokens.push(text)\n\
        return tokens\n\
    },\n\
\n\
    /*\n\
     *  External build\n\
     */\n\
    buildRegex: function () {\n\
        BINDING_RE = build()\n\
    }\n\
}//@ sourceURL=seed/src/text-parser.js"
));
require.register("seed/src/deps-parser.js", Function("exports, require, module",
"var Emitter  = require('./emitter'),\n\
    utils    = require('./utils'),\n\
    observer = new Emitter()\n\
\n\
var dummyEl = document.createElement('div'),\n\
    ARGS_RE = /^function\\s*?\\((.+?)[\\),]/,\n\
    SCOPE_RE_STR = '\\\\.vm\\\\.[\\\\.\\\\w][\\\\.\\\\w$]*',\n\
    noop = function () {}\n\
\n\
/*\n\
 *  Auto-extract the dependencies of a computed property\n\
 *  by recording the getters triggered when evaluating it.\n\
 *\n\
 *  However, the first pass will contain duplicate dependencies\n\
 *  for computed properties. It is therefore necessary to do a\n\
 *  second pass in injectDeps()\n\
 */\n\
function catchDeps (binding) {\n\
    utils.log('\\n\
─ ' + binding.key)\n\
    var depsHash = {}\n\
    observer.on('get', function (dep) {\n\
        if (depsHash[dep.key]) return\n\
        depsHash[dep.key] = 1\n\
        utils.log('  └─ ' + dep.key)\n\
        binding.deps.push(dep)\n\
        dep.subs.push(binding)\n\
    })\n\
    parseContextDependency(binding)\n\
    binding.value.get({\n\
        vm: createDummyVM(binding),\n\
        el: dummyEl\n\
    })\n\
    observer.off('get')\n\
}\n\
\n\
/*\n\
 *  We need to invoke each binding's getter for dependency parsing,\n\
 *  but we don't know what sub-viewmodel properties the user might try\n\
 *  to access in that getter. To avoid thowing an error or forcing\n\
 *  the user to guard against an undefined argument, we staticly\n\
 *  analyze the function to extract any possible nested properties\n\
 *  the user expects the target viewmodel to possess. They are all assigned\n\
 *  a noop function so they can be invoked with no real harm.\n\
 */\n\
function createDummyVM (binding) {\n\
    var viewmodel = {},\n\
        deps = binding.contextDeps\n\
    if (!deps) return viewmodel\n\
    var i = binding.contextDeps.length,\n\
        j, level, key, path\n\
    while (i--) {\n\
        level = viewmodel\n\
        path = deps[i].split('.')\n\
        j = 0\n\
        while (j < path.length) {\n\
            key = path[j]\n\
            if (!level[key]) level[key] = noop\n\
            level = level[key]\n\
            j++\n\
        }\n\
    }\n\
    return viewmodel\n\
}\n\
\n\
/*\n\
 *  Extract context dependency paths\n\
 */\n\
function parseContextDependency (binding) {\n\
    var fn   = binding.rawGet,\n\
        str  = fn.toString(),\n\
        args = str.match(ARGS_RE)\n\
    if (!args) return null\n\
    var depsRE = new RegExp(args[1] + SCOPE_RE_STR, 'g'),\n\
        matches = str.match(depsRE),\n\
        base = args[1].length + 4\n\
    if (!matches) return null\n\
    var i = matches.length,\n\
        deps = [], dep\n\
    while (i--) {\n\
        dep = matches[i].slice(base)\n\
        if (deps.indexOf(dep) === -1) {\n\
            deps.push(dep)\n\
        }\n\
    }\n\
    binding.contextDeps = deps\n\
    binding.compiler.contextBindings.push(binding)\n\
}\n\
\n\
module.exports = {\n\
\n\
    /*\n\
     *  the observer that catches events triggered by getters\n\
     */\n\
    observer: observer,\n\
\n\
    /*\n\
     *  parse a list of computed property bindings\n\
     */\n\
    parse: function (bindings) {\n\
        utils.log('\\n\
parsing dependencies...')\n\
        observer.isObserving = true\n\
        bindings.forEach(catchDeps)\n\
        observer.isObserving = false\n\
        utils.log('\\n\
done.')\n\
    },\n\
\n\
    // for testing only\n\
    cdvm: createDummyVM,\n\
    pcd: parseContextDependency\n\
}//@ sourceURL=seed/src/deps-parser.js"
));
require.register("seed/src/filters.js", Function("exports, require, module",
"var keyCodes = {\n\
    enter    : 13,\n\
    tab      : 9,\n\
    'delete' : 46,\n\
    up       : 38,\n\
    left     : 37,\n\
    right    : 39,\n\
    down     : 40,\n\
    esc      : 27\n\
}\n\
\n\
module.exports = {\n\
\n\
    capitalize: function (value) {\n\
        if (!value && value !== 0) return ''\n\
        value = value.toString()\n\
        return value.charAt(0).toUpperCase() + value.slice(1)\n\
    },\n\
\n\
    uppercase: function (value) {\n\
        return (value || value === 0)\n\
            ? value.toString().toUpperCase()\n\
            : ''\n\
    },\n\
\n\
    lowercase: function (value) {\n\
        return (value || value === 0)\n\
            ? value.toString().toLowerCase()\n\
            : ''\n\
    },\n\
\n\
    /*\n\
     *  args: an array of strings corresponding to\n\
     *  the single, double, triple ... forms of the word to\n\
     *  be pluralized. When the number to be pluralized\n\
     *  exceeds the length of the args, it will use the last\n\
     *  entry in the array.\n\
     *\n\
     *  e.g. ['single', 'double', 'triple', 'multiple']\n\
     */\n\
    pluralize: function (value, args) {\n\
        return args.length > 1\n\
            ? (args[value - 1] || args[args.length - 1])\n\
            : (args[value - 1] || args[0] + 's')\n\
    },\n\
\n\
    currency: function (value, args) {\n\
        if (!value && value !== 0) return ''\n\
        var sign = (args && args[0]) || '$',\n\
            s = Math.floor(value).toString(),\n\
            i = s.length % 3,\n\
            h = i > 0 ? (s.slice(0, i) + (s.length > 3 ? ',' : '')) : '',\n\
            f = '.' + value.toFixed(2).slice(-2)\n\
        return sign + h + s.slice(i).replace(/(\\d{3})(?=\\d)/g, '$1,') + f\n\
    },\n\
\n\
    key: function (handler, args) {\n\
        if (!handler) return\n\
        var code = keyCodes[args[0]]\n\
        if (!code) {\n\
            code = parseInt(args[0], 10)\n\
        }\n\
        return function (e) {\n\
            if (e.keyCode === code) {\n\
                handler.call(this, e)\n\
            }\n\
        }\n\
    }\n\
\n\
}//@ sourceURL=seed/src/filters.js"
));
require.register("seed/src/directives/index.js", Function("exports, require, module",
"module.exports = {\n\
\n\
    on     : require('./on'),\n\
    repeat : require('./repeat'),\n\
\n\
    attr: function (value) {\n\
        this.el.setAttribute(this.arg, value)\n\
    },\n\
\n\
    text: function (value) {\n\
        this.el.textContent = isValidTextValue(value)\n\
            ? value\n\
            : ''\n\
    },\n\
\n\
    html: function (value) {\n\
        this.el.innerHTML = isValidTextValue(value)\n\
            ? value\n\
            : ''\n\
    },\n\
\n\
    style: {\n\
        bind: function () {\n\
            this.arg = convertCSSProperty(this.arg)\n\
        },\n\
        update: function (value) {\n\
            this.el.style[this.arg] = value\n\
        }\n\
    },\n\
\n\
    show: function (value) {\n\
        this.el.style.display = value ? '' : 'none'\n\
    },\n\
\n\
    visible: function (value) {\n\
        this.el.style.visibility = value ? '' : 'hidden'\n\
    },\n\
    \n\
    focus: function (value) {\n\
        var el = this.el\n\
        if (value) {\n\
            setTimeout(function () {\n\
                el.focus()\n\
            }, 0)\n\
        }\n\
    },\n\
\n\
    class: function (value) {\n\
        if (this.arg) {\n\
            this.el.classList[value ? 'add' : 'remove'](this.arg)\n\
        } else {\n\
            if (this.lastVal) {\n\
                this.el.classList.remove(this.lastVal)\n\
            }\n\
            this.el.classList.add(value)\n\
            this.lastVal = value\n\
        }\n\
    },\n\
\n\
    value: {\n\
        bind: function () {\n\
            var el = this.el, self = this\n\
            this.change = function () {\n\
                self.vm.$set(self.key, el.value)\n\
            }\n\
            el.addEventListener('keyup', this.change)\n\
        },\n\
        update: function (value) {\n\
            this.el.value = value ? value : ''\n\
        },\n\
        unbind: function () {\n\
            this.el.removeEventListener('keyup', this.change)\n\
        }\n\
    },\n\
\n\
    checked: {\n\
        bind: function () {\n\
            var el = this.el, self = this\n\
            this.change = function () {\n\
                self.vm.$set(self.key, el.checked)\n\
            }\n\
            el.addEventListener('change', this.change)\n\
        },\n\
        update: function (value) {\n\
            this.el.checked = !!value\n\
        },\n\
        unbind: function () {\n\
            this.el.removeEventListener('change', this.change)\n\
        }\n\
    },\n\
\n\
    model: {\n\
        bind: function () {\n\
            var self = this,\n\
                el   = self.el,\n\
                type = el.type,\n\
                lazy = self.compiler.options.lazy\n\
            self.event =\n\
                (lazy ||\n\
                type === 'checkbox' ||\n\
                type === 'select' ||\n\
                type === 'radio')\n\
                    ? 'change'\n\
                    : 'keyup'\n\
            self.attr = type === 'checkbox'\n\
                ? 'checked'\n\
                : 'value'\n\
            self.set = function () {\n\
                self.vm.$set(self.key, el[self.attr])\n\
            }\n\
            el.addEventListener(self.event, self.set)\n\
        },\n\
        update: function (value) {\n\
            this.el[this.attr] = this.attr === 'checked'\n\
                ? !!value\n\
                : isValidTextValue(value)\n\
                    ? value\n\
                    : ''\n\
        },\n\
        unbind: function () {\n\
            this.el.removeEventListener(this.event, this.set)\n\
        }\n\
    },\n\
\n\
    'if': {\n\
        bind: function () {\n\
            this.parent = this.el.parentNode\n\
            this.ref = document.createComment('sd-if-' + this.key)\n\
        },\n\
        update: function (value) {\n\
            var attached = !!this.el.parentNode\n\
            if (!this.parent) { // the node was detached when bound\n\
                if (!attached) {\n\
                    return\n\
                } else {\n\
                    this.parent = this.el.parentNode\n\
                }\n\
            }\n\
            // should always have this.parent if we reach here\n\
            if (!value) {\n\
                if (attached) {\n\
                    // insert the reference node\n\
                    var next = this.el.nextSibling\n\
                    if (next) {\n\
                        this.parent.insertBefore(this.ref, next)\n\
                    } else {\n\
                        this.parent.appendChild(this.ref)\n\
                    }\n\
                    this.parent.removeChild(this.el)\n\
                }\n\
            } else if (!attached) {\n\
                this.parent.insertBefore(this.el, this.ref)\n\
                this.parent.removeChild(this.ref)\n\
            }\n\
        }\n\
    }\n\
}\n\
\n\
/*\n\
 *  convert hyphen style CSS property to Camel style\n\
 */\n\
var CONVERT_RE = /-(.)/g\n\
function convertCSSProperty (prop) {\n\
    if (prop.charAt(0) === '-') prop = prop.slice(1)\n\
    return prop.replace(CONVERT_RE, function (m, char) {\n\
        return char.toUpperCase()\n\
    })\n\
}\n\
\n\
function isValidTextValue (value) {\n\
    return typeof value === 'string' || typeof value === 'number'\n\
}//@ sourceURL=seed/src/directives/index.js"
));
require.register("seed/src/directives/repeat.js", Function("exports, require, module",
"var config   = require('../config'),\n\
    Observer = require('../observer'),\n\
    Emitter  = require('../emitter'),\n\
    ViewModel // lazy def to avoid circular dependency\n\
\n\
/*\n\
 *  Mathods that perform precise DOM manipulation\n\
 *  based on mutator method triggered\n\
 */\n\
var mutationHandlers = {\n\
\n\
    push: function (m) {\n\
        var i, l = m.args.length,\n\
            base = this.collection.length - l\n\
        for (i = 0; i < l; i++) {\n\
            this.buildItem(m.args[i], base + i)\n\
        }\n\
    },\n\
\n\
    pop: function () {\n\
        var vm = this.vms.pop()\n\
        if (vm) vm.$destroy()\n\
    },\n\
\n\
    unshift: function (m) {\n\
        var i, l = m.args.length\n\
        for (i = 0; i < l; i++) {\n\
            this.buildItem(m.args[i], i)\n\
        }\n\
    },\n\
\n\
    shift: function () {\n\
        var vm = this.vms.shift()\n\
        if (vm) vm.$destroy()\n\
    },\n\
\n\
    splice: function (m) {\n\
        var i, l,\n\
            index = m.args[0],\n\
            removed = m.args[1],\n\
            added = m.args.length - 2,\n\
            removedVMs = this.vms.splice(index, removed)\n\
        for (i = 0, l = removedVMs.length; i < l; i++) {\n\
            removedVMs[i].$destroy()\n\
        }\n\
        for (i = 0; i < added; i++) {\n\
            this.buildItem(m.args[i + 2], index + i)\n\
        }\n\
    },\n\
\n\
    sort: function () {\n\
        var key = this.arg,\n\
            vms = this.vms,\n\
            col = this.collection,\n\
            l = col.length,\n\
            sorted = new Array(l),\n\
            i, j, vm, data\n\
        for (i = 0; i < l; i++) {\n\
            data = col[i]\n\
            for (j = 0; j < l; j++) {\n\
                vm = vms[j]\n\
                if (vm[key] === data) {\n\
                    sorted[i] = vm\n\
                    break\n\
                }\n\
            }\n\
        }\n\
        for (i = 0; i < l; i++) {\n\
            this.container.insertBefore(sorted[i].$el, this.ref)\n\
        }\n\
        this.vms = sorted\n\
    },\n\
\n\
    reverse: function () {\n\
        var vms = this.vms\n\
        vms.reverse()\n\
        for (var i = 0, l = vms.length; i < l; i++) {\n\
            this.container.insertBefore(vms[i].$el, this.ref)\n\
        }\n\
    }\n\
}\n\
\n\
module.exports = {\n\
\n\
    bind: function () {\n\
        this.el.removeAttribute(config.prefix + '-repeat')\n\
        var ctn = this.container = this.el.parentNode\n\
        // create a comment node as a reference node for DOM insertions\n\
        this.ref = document.createComment('sd-repeat-' + this.arg)\n\
        ctn.insertBefore(this.ref, this.el)\n\
        ctn.removeChild(this.el)\n\
        this.collection = null\n\
        this.vms = null\n\
        var self = this\n\
        this.mutationListener = function (path, arr, mutation) {\n\
            self.detach()\n\
            var method = mutation.method\n\
            mutationHandlers[method].call(self, mutation)\n\
            if (method !== 'push' && method !== 'pop') {\n\
                self.updateIndexes()\n\
            }\n\
            self.retach()\n\
        }\n\
    },\n\
\n\
    update: function (collection) {\n\
\n\
        this.unbind(true)\n\
        // attach an object to container to hold handlers\n\
        this.container.sd_dHandlers = {}\n\
        // if initiating with an empty collection, we need to\n\
        // force a compile so that we get all the bindings for\n\
        // dependency extraction.\n\
        if (!this.collection && !collection.length) {\n\
            this.buildItem()\n\
        }\n\
        this.collection = collection\n\
        this.vms = []\n\
\n\
        // listen for collection mutation events\n\
        // the collection has been augmented during Binding.set()\n\
        if (!collection.__observer__) Observer.watchArray(collection, null, new Emitter())\n\
        collection.__observer__.on('mutate', this.mutationListener)\n\
\n\
        // create child-seeds and append to DOM\n\
        this.detach()\n\
        for (var i = 0, l = collection.length; i < l; i++) {\n\
            this.buildItem(collection[i], i)\n\
        }\n\
        this.retach()\n\
    },\n\
\n\
    /*\n\
     *  Create a new child VM from a data object\n\
     *  passing along compiler options indicating this\n\
     *  is a sd-repeat item.\n\
     */\n\
    buildItem: function (data, index) {\n\
        ViewModel = ViewModel || require('../viewmodel')\n\
        var node = this.el.cloneNode(true),\n\
            ctn  = this.container,\n\
            vmID = node.getAttribute(config.prefix + '-viewmodel'),\n\
            ChildVM = this.compiler.getOption('vms', vmID) || ViewModel,\n\
            scope = {}\n\
        scope[this.arg] = data || {}\n\
        var item = new ChildVM({\n\
            el: node,\n\
            scope: scope,\n\
            compilerOptions: {\n\
                repeat: true,\n\
                repeatIndex: index,\n\
                repeatPrefix: this.arg,\n\
                parentCompiler: this.compiler,\n\
                delegator: ctn\n\
            }\n\
        })\n\
        if (!data) {\n\
            item.$destroy()\n\
        } else {\n\
            var ref = this.vms.length > index\n\
                ? this.vms[index].$el\n\
                : this.ref\n\
            ctn.insertBefore(node, ref)\n\
            this.vms.splice(index, 0, item)\n\
        }\n\
    },\n\
\n\
    /*\n\
     *  Update index of each item after a mutation\n\
     */\n\
    updateIndexes: function () {\n\
        var i = this.vms.length\n\
        while (i--) {\n\
            this.vms[i][this.arg].$index = i\n\
        }\n\
    },\n\
\n\
    /*\n\
     *  Detach/ the container from the DOM before mutation\n\
     *  so that batch DOM updates are done in-memory and faster\n\
     */\n\
    detach: function () {\n\
        var c = this.container,\n\
            p = this.parent = c.parentNode\n\
        this.next = c.nextSibling\n\
        if (p) p.removeChild(c)\n\
    },\n\
\n\
    retach: function () {\n\
        var n = this.next,\n\
            p = this.parent,\n\
            c = this.container\n\
        if (!p) return\n\
        if (n) {\n\
            p.insertBefore(c, n)\n\
        } else {\n\
            p.appendChild(c)\n\
        }\n\
    },\n\
\n\
    unbind: function () {\n\
        if (this.collection) {\n\
            this.collection.__observer__.off('mutate', this.mutationListener)\n\
            var i = this.vms.length\n\
            while (i--) {\n\
                this.vms[i].$destroy()\n\
            }\n\
        }\n\
        var ctn = this.container,\n\
            handlers = ctn.sd_dHandlers\n\
        for (var key in handlers) {\n\
            ctn.removeEventListener(handlers[key].event, handlers[key])\n\
        }\n\
        ctn.sd_dHandlers = null\n\
    }\n\
}//@ sourceURL=seed/src/directives/repeat.js"
));
require.register("seed/src/directives/on.js", Function("exports, require, module",
"var utils = require('../utils')\n\
\n\
function delegateCheck (current, top, identifier) {\n\
    if (current[identifier]) {\n\
        return current\n\
    } else if (current === top) {\n\
        return false\n\
    } else {\n\
        return delegateCheck(current.parentNode, top, identifier)\n\
    }\n\
}\n\
\n\
module.exports = {\n\
\n\
    bind: function () {\n\
        if (this.compiler.repeat) {\n\
            // attach an identifier to the el\n\
            // so it can be matched during event delegation\n\
            this.el[this.expression] = true\n\
            // attach the owner viewmodel of this directive\n\
            this.el.sd_viewmodel = this.vm\n\
        }\n\
    },\n\
\n\
    update: function (handler) {\n\
\n\
        this.unbind(true)\n\
        if (typeof handler !== 'function') {\n\
            return utils.warn('Directive \"on\" expects a function value.')\n\
        }\n\
\n\
        var compiler = this.compiler,\n\
            event    = this.arg,\n\
            ownerVM  = this.binding.compiler.vm\n\
\n\
        if (compiler.repeat && event !== 'blur' && event !== 'focus') {\n\
\n\
            // for each blocks, delegate for better performance\n\
            // focus and blur events dont bubble so exclude them\n\
            var delegator  = compiler.delegator,\n\
                identifier = this.expression,\n\
                dHandler   = delegator.sd_dHandlers[identifier]\n\
\n\
            if (dHandler) return\n\
\n\
            // the following only gets run once for the entire each block\n\
            dHandler = delegator.sd_dHandlers[identifier] = function (e) {\n\
                var target = delegateCheck(e.target, delegator, identifier)\n\
                if (target) {\n\
                    e.el = target\n\
                    e.vm = target.sd_viewmodel\n\
                    e.item = e.vm[compiler.repeatPrefix]\n\
                    handler.call(ownerVM, e)\n\
                }\n\
            }\n\
            dHandler.event = event\n\
            delegator.addEventListener(event, dHandler)\n\
\n\
        } else {\n\
\n\
            // a normal, single element handler\n\
            var vm = this.vm\n\
            this.handler = function (e) {\n\
                e.el = e.currentTarget\n\
                e.vm = vm\n\
                if (compiler.repeat) {\n\
                    e.item = vm[compiler.repeatPrefix]\n\
                }\n\
                handler.call(ownerVM, e)\n\
            }\n\
            this.el.addEventListener(event, this.handler)\n\
\n\
        }\n\
    },\n\
\n\
    unbind: function (update) {\n\
        this.el.removeEventListener(this.arg, this.handler)\n\
        this.handler = null\n\
        if (!update) this.el.sd_viewmodel = null\n\
    }\n\
}//@ sourceURL=seed/src/directives/on.js"
));
require.alias("component-emitter/index.js", "seed/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("seed/src/main.js", "seed/index.js");if (typeof exports == "object") {
  module.exports = require("seed");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("seed"); });
} else {
  this["Seed"] = require("seed");
}})();