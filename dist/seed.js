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
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n  if (arr.indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("seed/src/main.js", Function("exports, require, module",
"var config      = require('./config'),\n    Seed        = require('./seed'),\n    directives  = require('./directives'),\n    filters     = require('./filters'),\n    textParser  = require('./text-parser')\n\nvar controllers = config.controllers,\n    datum       = config.datum,\n    api         = {},\n    reserved    = ['datum', 'controllers'],\n    booted      = false\n\n/*\n *  Store a piece of plain data in config.datum\n *  so it can be consumed by sd-data\n */\napi.data = function (id, data) {\n    if (!data) return datum[id]\n    datum[id] = data\n}\n\n/*\n *  Store a controller function in config.controllers\n *  so it can be consumed by sd-controller\n */\napi.controller = function (id, extensions) {\n    if (!extensions) return controllers[id]\n    controllers[id] = extensions\n}\n\n/*\n *  Allows user to create a custom directive\n */\napi.directive = function (name, fn) {\n    if (!fn) return directives[name]\n    directives[name] = fn\n}\n\n/*\n *  Allows user to create a custom filter\n */\napi.filter = function (name, fn) {\n    if (!fn) return filters[name]\n    filters[name] = fn\n}\n\n/*\n *  Bootstrap the whole thing\n *  by creating a Seed instance for top level nodes\n *  that has either sd-controller or sd-data\n */\napi.bootstrap = function (opts) {\n    if (booted) return\n    if (opts) {\n        for (var key in opts) {\n            if (reserved.indexOf(key) === -1) {\n                config[key] = opts[key]\n            }\n        }\n    }\n    textParser.buildRegex()\n    var el,\n        ctrlSlt = '[' + config.prefix + '-controller]',\n        dataSlt = '[' + config.prefix + '-data]',\n        seeds   = []\n    /* jshint boss: true */\n    while (el = document.querySelector(ctrlSlt) || document.querySelector(dataSlt)) {\n        seeds.push((new Seed(el)).scope)\n    }\n    booted = true\n    return seeds.length > 1 ? seeds : seeds[0]\n}\n\nmodule.exports = api//@ sourceURL=seed/src/main.js"
));
require.register("seed/src/config.js", Function("exports, require, module",
"module.exports = {\n\n    prefix      : 'sd',\n    debug       : false,\n    datum       : {},\n    controllers : {},\n\n    interpolateTags : {\n        open  : '{{',\n        close : '}}'\n    }\n}//@ sourceURL=seed/src/config.js"
));
require.register("seed/src/utils.js", Function("exports, require, module",
"var Emitter       = require('emitter'),\n    toString      = Object.prototype.toString,\n    aproto        = Array.prototype,\n    arrayMutators = ['push','pop','shift','unshift','splice','sort','reverse']\n\nvar arrayAugmentations = {\n    remove: function (index) {\n        if (typeof index !== 'number') index = index.$index\n        this.splice(index, 1)\n    },\n    replace: function (index, data) {\n        if (typeof index !== 'number') index = index.$index\n        this.splice(index, 1, data)\n    }\n}\n\n/*\n *  get accurate type of an object\n */\nfunction typeOf (obj) {\n    return toString.call(obj).slice(8, -1)\n}\n\n/*\n *  Recursively dump stuff...\n */\nfunction dumpValue (val) {\n    var type = typeOf(val)\n    if (type === 'Array') {\n        return val.map(dumpValue)\n    } else if (type === 'Object') {\n        if (val.get) { // computed property\n            return val.get()\n        } else { // object / child scope\n            var ret = {}\n            for (var key in val) {\n                if (val.hasOwnProperty(key) &&\n                    typeof val[key] !== 'function' &&\n                    key.charAt(0) !== '$')\n                {\n                    ret[key] = dumpValue(val[key])\n                }\n            }\n            return ret\n        }\n    } else if (type !== 'Function') {\n        return val\n    }\n}\n\nmodule.exports = {\n\n    typeOf: typeOf,\n    dumpValue: dumpValue,\n\n    /*\n     *  Get a value from an object based on a path array\n     */\n    getNestedValue: function (obj, path) {\n        if (path.length === 1) return obj[path[0]]\n        var i = 0\n        /* jshint boss: true */\n        while (obj[path[i]]) {\n            obj = obj[path[i]]\n            i++\n        }\n        return i === path.length ? obj : undefined\n    },\n\n    /*\n     *  augment an Array so that it emit events when mutated\n     */\n    watchArray: function (collection) {\n        Emitter(collection)\n        arrayMutators.forEach(function (method) {\n            collection[method] = function () {\n                var result = aproto[method].apply(this, arguments)\n                collection.emit('mutate', {\n                    method: method,\n                    args: aproto.slice.call(arguments),\n                    result: result\n                })\n            }\n        })\n        for (var method in arrayAugmentations) {\n            collection[method] = arrayAugmentations[method]\n        }\n    }\n}//@ sourceURL=seed/src/utils.js"
));
require.register("seed/src/seed.js", Function("exports, require, module",
"var config          = require('./config'),\n    Scope           = require('./scope'),\n    Binding         = require('./binding'),\n    DirectiveParser = require('./directive-parser'),\n    TextParser      = require('./text-parser'),\n    depsParser      = require('./deps-parser')\n\nvar slice           = Array.prototype.slice,\n    ctrlAttr        = config.prefix + '-controller',\n    eachAttr        = config.prefix + '-each'\n\n/*\n *  The main ViewModel class\n *  scans a node and parse it to populate data bindings\n */\nfunction Seed (el, options) {\n\n    if (typeof el === 'string') {\n        el = document.querySelector(el)\n    }\n\n    this.el         = el\n    el.seed         = this\n    this._bindings  = {}\n    this._computed  = []\n\n    // copy options\n    options = options || {}\n    for (var op in options) {\n        this[op] = options[op]\n    }\n\n    // check if there's passed in data\n    var dataAttr = config.prefix + '-data',\n        dataId = el.getAttribute(dataAttr),\n        data = (options && options.data) || config.datum[dataId]\n    if (config.debug && dataId && !data) {\n        console.warn('data \"' + dataId + '\" is not defined.')\n    }\n    data = data || {}\n    el.removeAttribute(dataAttr)\n\n    // if the passed in data is the scope of a Seed instance,\n    // make a copy from it\n    if (data.$seed instanceof Seed) {\n        data = data.$dump()\n    }\n\n    // initialize the scope object\n    var scope = this.scope = new Scope(this, options)\n\n    // copy data\n    for (var key in data) {\n        scope[key] = data[key]\n    }\n\n    // if has controller function, apply it so we have all the user definitions\n    var ctrlID = el.getAttribute(ctrlAttr)\n    if (ctrlID) {\n        el.removeAttribute(ctrlAttr)\n        var factory = config.controllers[ctrlID]\n        if (factory) {\n            factory(this.scope)\n        } else if (config.debug) {\n            console.warn('controller \"' + ctrlID + '\" is not defined.')\n        }\n    }\n\n    // now parse the DOM\n    this._compileNode(el, true)\n\n    // extract dependencies for computed properties\n    depsParser.parse(this._computed)\n    delete this._computed\n}\n\n// for better compression\nvar SeedProto = Seed.prototype\n\n/*\n *  Compile a DOM node (recursive)\n */\nSeedProto._compileNode = function (node, root) {\n    var seed = this\n\n    if (node.nodeType === 3) { // text node\n\n        seed._compileTextNode(node)\n\n    } else if (node.nodeType === 1) {\n\n        var eachExp = node.getAttribute(eachAttr),\n            ctrlExp = node.getAttribute(ctrlAttr)\n\n        if (eachExp) { // each block\n\n            var directive = DirectiveParser.parse(eachAttr, eachExp)\n            if (directive) {\n                directive.el = node\n                seed._bind(directive)\n            }\n\n        } else if (ctrlExp && !root) { // nested controllers\n\n            new Seed(node, {\n                child: true,\n                parentSeed: seed\n            })\n\n        } else { // normal node\n\n            // parse if has attributes\n            if (node.attributes && node.attributes.length) {\n                // forEach vs for loop perf comparison: http://jsperf.com/for-vs-foreach-case\n                // takeaway: not worth it to wrtie manual loops.\n                slice.call(node.attributes).forEach(function (attr) {\n                    if (attr.name === ctrlAttr) return\n                    var valid = false\n                    attr.value.split(',').forEach(function (exp) {\n                        var directive = DirectiveParser.parse(attr.name, exp)\n                        if (directive) {\n                            valid = true\n                            directive.el = node\n                            seed._bind(directive)\n                        }\n                    })\n                    if (valid) node.removeAttribute(attr.name)\n                })\n            }\n\n            // recursively compile childNodes\n            if (node.childNodes.length) {\n                slice.call(node.childNodes).forEach(seed._compileNode, seed)\n            }\n        }\n    }\n}\n\n/*\n *  Compile a text node\n */\nSeedProto._compileTextNode = function (node) {\n    var tokens = TextParser.parse(node)\n    if (!tokens) return\n    var seed = this,\n        dirname = config.prefix + '-text',\n        el, token, directive\n    for (var i = 0, l = tokens.length; i < l; i++) {\n        token = tokens[i]\n        el = document.createTextNode()\n        if (token.key) {\n            directive = DirectiveParser.parse(dirname, token.key)\n            if (directive) {\n                directive.el = el\n                seed._bind(directive)\n            }\n        } else {\n            el.nodeValue = token\n        }\n        node.parentNode.insertBefore(el, node)\n    }\n    node.parentNode.removeChild(node)\n}\n\n/*\n *  Add a directive instance to the correct binding & scope\n */\nSeedProto._bind = function (directive) {\n\n    var key = directive.key,\n        seed = directive.seed = this\n\n    // deal with each block\n    if (this.each) {\n        if (key.indexOf(this.eachPrefix) === 0) {\n            key = directive.key = key.replace(this.eachPrefix, '')\n        } else {\n            seed = this.parentSeed\n        }\n    }\n\n    // deal with nesting\n    seed = traceOwnerSeed(directive, seed)\n    var binding = seed._bindings[key] || seed._createBinding(key)\n\n    // add directive to this binding\n    binding.instances.push(directive)\n    directive.binding = binding\n\n    // invoke bind hook if exists\n    if (directive.bind) {\n        directive.bind(binding.value)\n    }\n\n    // set initial value\n    directive.update(binding.value)\n    if (binding.isComputed) {\n        directive.refresh()\n    }\n}\n\n/*\n *  Create binding and attach getter/setter for a key to the scope object\n */\nSeedProto._createBinding = function (key) {\n    var binding = new Binding(this, key)\n    this._bindings[key] = binding\n    if (binding.isComputed) this._computed.push(binding)\n    return binding\n}\n\n/*\n *  Call unbind() of all directive instances\n *  to remove event listeners, destroy child seeds, etc.\n */\nSeedProto._unbind = function () {\n    var i, ins\n    for (var key in this._bindings) {\n        ins = this._bindings[key].instances\n        i = ins.length\n        while (i--) {\n            if (ins[i].unbind) ins[i].unbind()\n        }\n    }\n}\n\n/*\n *  Unbind and remove element\n */\nSeedProto._destroy = function () {\n    this._unbind()\n    this.el.parentNode.removeChild(this.el)\n}\n\n// Helpers --------------------------------------------------------------------\n\n/*\n *  determine which scope a key belongs to based on nesting symbols\n */\nfunction traceOwnerSeed (key, seed) {\n    if (key.nesting) {\n        var levels = key.nesting\n        while (seed.parentSeed && levels--) {\n            seed = seed.parentSeed\n        }\n    } else if (key.root) {\n        while (seed.parentSeed) {\n            seed = seed.parentSeed\n        }\n    }\n    return seed\n}\n\nmodule.exports = Seed//@ sourceURL=seed/src/seed.js"
));
require.register("seed/src/scope.js", Function("exports, require, module",
"var utils   = require('./utils')\n\nfunction Scope (seed, options) {\n    this.$seed     = seed\n    this.$el       = seed.el\n    this.$index    = options.index\n    this.$parent   = options.parentSeed && options.parentSeed.scope\n    this.$watchers = {}\n}\n\nvar ScopeProto = Scope.prototype\n\n/*\n *  watch a key on the scope for changes\n *  fire callback with new value\n */\nScopeProto.$watch = function (key, callback) {\n    var self = this\n    // yield and wait for seed to finish compiling\n    setTimeout(function () {\n        var scope   = self.$seed.scope,\n            binding = self.$seed._bindings[key],\n            watcher = self.$watchers[key] = {\n                refresh: function () {\n                    callback(scope[key])\n                },\n                deps: binding.deps\n            }\n        binding.deps.forEach(function (dep) {\n            dep.subs.push(watcher)\n        })\n    }, 0)\n}\n\n/*\n *  remove watcher\n */\nScopeProto.$unwatch = function (key) {\n    var self = this\n    setTimeout(function () {\n        var watcher = self.$watchers[key]\n        if (!watcher) return\n        watcher.deps.forEach(function (dep) {\n            dep.subs.splice(dep.subs.indexOf(watcher))\n        })\n        delete self.$watchers[key]\n    }, 0)\n}\n\n/*\n *  Dump a copy of current scope data, excluding seed-exposed properties.\n *  @param key (optional): key for the value to dump\n */\nScopeProto.$dump = function (key) {\n    var bindings = this.$seed._bindings\n    return utils.dumpValue(key ? bindings[key].value : this)\n}\n\n/*\n *  stringify the result from $dump\n */\nScopeProto.$serialize = function (key) {\n    return JSON.stringify(this.$dump(key))\n}\n\n/*\n *  unbind everything, remove everything\n */\nScopeProto.$destroy = function () {\n    this.$seed._destroy()\n}\n\nmodule.exports = Scope//@ sourceURL=seed/src/scope.js"
));
require.register("seed/src/binding.js", Function("exports, require, module",
"var utils    = require('./utils'),\n    observer = require('./deps-parser').observer,\n    def      = Object.defineProperty\n\n/*\n *  Binding class.\n *\n *  each property on the scope has one corresponding Binding object\n *  which has multiple directive instances on the DOM\n *  and multiple computed property dependents\n */\nfunction Binding (seed, key) {\n    this.seed = seed\n    this.key  = key\n    var path = key.split('.')\n    this.inspect(utils.getNestedValue(seed.scope, path))\n    this.def(seed.scope, path)\n    this.instances = []\n    this.subs = []\n    this.deps = []\n}\n\nvar BindingProto = Binding.prototype\n\n/*\n *  Pre-process a passed in value based on its type\n */\nBindingProto.inspect = function (value) {\n    var type = utils.typeOf(value),\n        self = this\n    // preprocess the value depending on its type\n    if (type === 'Object') {\n        if (value.get || value.set) { // computed property\n            self.isComputed = true\n        }\n    } else if (type === 'Array') {\n        utils.watchArray(value)\n        value.on('mutate', function () {\n            self.pub()\n        })\n    }\n    self.value = value\n}\n\n/*\n *  Define getter/setter for this binding on scope\n *  recursive for nested objects\n */\nBindingProto.def = function (scope, path) {\n    var self = this,\n        key = path[0]\n    if (path.length === 1) {\n        // here we are! at the end of the path!\n        // define the real value accessors.\n        def(scope, key, {\n            get: function () {\n                if (observer.isObserving) {\n                    observer.emit('get', self)\n                }\n                return self.isComputed\n                    ? self.value.get()\n                    : self.value\n            },\n            set: function (value) {\n                if (self.isComputed) {\n                    // computed properties cannot be redefined\n                    // no need to call binding.update() here,\n                    // as dependency extraction has taken care of that\n                    if (self.value.set) {\n                        self.value.set(value)\n                    }\n                } else if (value !== self.value) {\n                    self.update(value)\n                }\n            }\n        })\n    } else {\n        // we are not there yet!!!\n        // create an intermediate subscope\n        // which also has its own getter/setters\n        var subScope = scope[key]\n        if (!subScope) {\n            subScope = {}\n            def(scope, key, {\n                get: function () {\n                    return subScope\n                },\n                set: function (value) {\n                    // when the subScope is given a new value,\n                    // copy everything over to trigger the setters\n                    for (var prop in value) {\n                        subScope[prop] = value[prop]\n                    }\n                }\n            })\n        }\n        // recurse\n        this.def(subScope, path.slice(1))\n    }\n}\n\n/*\n *  Process the value, then trigger updates on all dependents\n */\nBindingProto.update = function (value) {\n    this.inspect(value)\n    var i = this.instances.length\n    while (i--) {\n        this.instances[i].update(value)\n    }\n    this.pub()\n}\n\n/*\n *  Notify computed properties that depend on this binding\n *  to update themselves\n */\nBindingProto.pub = function () {\n    var i = this.subs.length\n    while (i--) {\n        this.subs[i].refresh()\n    }\n}\n\nmodule.exports = Binding//@ sourceURL=seed/src/binding.js"
));
require.register("seed/src/directive-parser.js", Function("exports, require, module",
"var config     = require('./config'),\n    directives = require('./directives'),\n    filters    = require('./filters')\n\nvar KEY_RE          = /^[^\\|<]+/,\n    ARG_RE          = /([^:]+):(.+)$/,\n    FILTERS_RE      = /\\|[^\\|<]+/g,\n    FILTER_TOKEN_RE = /[^\\s']+|'[^']+'/g,\n    INVERSE_RE      = /^!/,\n    NESTING_RE      = /^\\^+/,\n    ONEWAY_RE       = /-oneway$/\n\n/*\n *  Directive class\n *  represents a single directive instance in the DOM\n */\nfunction Directive (directiveName, expression, oneway) {\n\n    var prop,\n        definition = directives[directiveName]\n\n    // mix in properties from the directive definition\n    if (typeof definition === 'function') {\n        this._update = definition\n    } else {\n        this._update = definition.update\n        for (prop in definition) {\n            if (prop !== 'update') {\n                this[prop] = definition[prop]\n            }\n        }\n    }\n\n    this.oneway        = !!oneway\n    this.directiveName = directiveName\n    this.expression    = expression.trim()\n    this.rawKey        = expression.match(KEY_RE)[0].trim()\n    \n    this.parseKey(this.rawKey)\n    \n    var filterExps = expression.match(FILTERS_RE)\n    this.filters = filterExps\n        ? filterExps.map(parseFilter)\n        : null\n}\n\nvar DirProto = Directive.prototype\n\n/*\n *  called when a new value is set \n *  for computed properties, this will only be called once\n *  during initialization.\n */\nDirProto.update = function (value) {\n    if (value && (value === this.value)) return\n    this.value = value\n    this.apply(value)\n}\n\n/*\n *  called when a dependency has changed\n *  computed properties only\n */\nDirProto.refresh = function () {\n    var value = this.value.get()\n    if (value === this.computedValue) return\n    this.computedValue = value\n    this.apply(value)\n    this.binding.pub()\n}\n\n/*\n *  Actually invoking the _update from the directive's definition\n */\nDirProto.apply = function (value) {\n    if (this.inverse) value = !value\n    this._update(\n        this.filters\n        ? this.applyFilters(value)\n        : value\n    )\n}\n\n/*\n *  pipe the value through filters\n */\nDirProto.applyFilters = function (value) {\n    var filtered = value\n    this.filters.forEach(function (filter) {\n        if (!filter.apply) throw new Error('Unknown filter: ' + filter.name)\n        filtered = filter.apply(filtered, filter.args)\n    })\n    return filtered\n}\n\n/*\n *  parse a key, extract argument and nesting/root info\n */\nDirProto.parseKey = function (rawKey) {\n\n    var argMatch = rawKey.match(ARG_RE)\n\n    var key = argMatch\n        ? argMatch[2].trim()\n        : rawKey.trim()\n\n    this.arg = argMatch\n        ? argMatch[1].trim()\n        : null\n\n    this.inverse = INVERSE_RE.test(key)\n    if (this.inverse) {\n        key = key.slice(1)\n    }\n\n    var nesting = key.match(NESTING_RE)\n    this.nesting = nesting\n        ? nesting[0].length\n        : false\n\n    this.root = key.charAt(0) === '$'\n\n    if (this.nesting) {\n        key = key.replace(NESTING_RE, '')\n    } else if (this.root) {\n        key = key.slice(1)\n    }\n\n    this.key = key\n}\n\n/*\n *  parse a filter expression\n */\nfunction parseFilter (filter) {\n\n    var tokens = filter.slice(1)\n        .match(FILTER_TOKEN_RE)\n        .map(function (token) {\n            return token.replace(/'/g, '').trim()\n        })\n\n    return {\n        name  : tokens[0],\n        apply : filters[tokens[0]],\n        args  : tokens.length > 1\n                ? tokens.slice(1)\n                : null\n    }\n}\n\nmodule.exports = {\n\n    /*\n     *  make sure the directive and expression is valid\n     *  before we create an instance\n     */\n    parse: function (dirname, expression) {\n\n        var prefix = config.prefix\n        if (dirname.indexOf(prefix) === -1) return null\n        dirname = dirname.slice(prefix.length + 1)\n\n        var oneway = ONEWAY_RE.test(dirname)\n        if (oneway) {\n            dirname = dirname.slice(0, -7)\n        }\n\n        var dir   = directives[dirname],\n            valid = KEY_RE.test(expression)\n\n        if (config.debug) {\n            if (!dir) console.warn('unknown directive: ' + dirname)\n            if (!valid) console.warn('invalid directive expression: ' + expression)\n        }\n\n        return dir && valid\n            ? new Directive(dirname, expression, oneway)\n            : null\n    }\n}//@ sourceURL=seed/src/directive-parser.js"
));
require.register("seed/src/text-parser.js", Function("exports, require, module",
"var config     = require('./config'),\n    ESCAPE_RE  = /[-.*+?^${}()|[\\]\\/\\\\]/g,\n    BINDING_RE\n\n/*\n *  Escapes a string so that it can be used to construct RegExp\n */\nfunction escapeRegex (val) {\n    return val.replace(ESCAPE_RE, '\\\\$&')\n}\n\nmodule.exports = {\n\n    /*\n     *  Parse a piece of text, return an array of tokens\n     */\n    parse: function (node) {\n        var text = node.nodeValue\n        if (!BINDING_RE.test(text)) return null\n        var m, i, tokens = []\n        do {\n            m = text.match(BINDING_RE)\n            if (!m) break\n            i = m.index\n            if (i > 0) tokens.push(text.slice(0, i))\n            tokens.push({ key: m[1] })\n            text = text.slice(i + m[0].length)\n        } while (true)\n        if (text.length) tokens.push(text)\n        return tokens\n    },\n\n    /*\n     *  Build interpolate tag regex from config settings\n     */\n    buildRegex: function () {\n        var open = escapeRegex(config.interpolateTags.open),\n            close = escapeRegex(config.interpolateTags.close)\n        BINDING_RE = new RegExp(open + '(.+?)' + close)\n    }\n}//@ sourceURL=seed/src/text-parser.js"
));
require.register("seed/src/deps-parser.js", Function("exports, require, module",
"var Emitter  = require('emitter'),\n    observer = new Emitter()\n\n/*\n *  Auto-extract the dependencies of a computed property\n *  by recording the getters triggered when evaluating it.\n *\n *  However, the first pass will contain duplicate dependencies\n *  for computed properties. It is therefore necessary to do a\n *  second pass in injectDeps()\n */\nfunction catchDeps (binding) {\n    observer.on('get', function (dep) {\n        binding.deps.push(dep)\n    })\n    binding.value.get()\n    observer.off('get')\n}\n\n/*\n *  The second pass of dependency extraction.\n *  Only include dependencies that don't have dependencies themselves.\n */\nfunction filterDeps (binding) {\n    var i = binding.deps.length, dep\n    while (i--) {\n        dep = binding.deps[i]\n        if (!dep.deps.length) {\n            dep.subs.push.apply(dep.subs, binding.instances)\n        } else {\n            binding.deps.splice(i, 1)\n        }\n    }\n}\n\nmodule.exports = {\n\n    /*\n     *  the observer that catches events triggered by getters\n     */\n    observer: observer,\n\n    /*\n     *  parse a list of computed property bindings\n     */\n    parse: function (bindings) {\n        observer.isObserving = true\n        bindings.forEach(catchDeps)\n        bindings.forEach(filterDeps)\n        observer.isObserving = false\n    }\n}//@ sourceURL=seed/src/deps-parser.js"
));
require.register("seed/src/filters.js", Function("exports, require, module",
"var keyCodes = {\n    enter: 13,\n    tab: 9,\n    'delete': 46,\n    up: 38,\n    left: 37,\n    right: 39,\n    down: 40\n}\n\nmodule.exports = {\n\n    capitalize: function (value) {\n        value = value.toString()\n        return value.charAt(0).toUpperCase() + value.slice(1)\n    },\n\n    uppercase: function (value) {\n        return value.toString().toUpperCase()\n    },\n\n    lowercase: function (value) {\n        return value.toString().toLowerCase()\n    },\n\n    currency: function (value, args) {\n        if (!value) return value\n        var sign = (args && args[0]) || '$',\n            i = value % 3,\n            f = '.' + value.toFixed(2).slice(-2),\n            s = Math.floor(value).toString()\n        return sign + s.slice(0, i) + s.slice(i).replace(/(\\d{3})(?=\\d)/g, '$1,') + f\n    },\n\n    key: function (handler, args) {\n        var code = keyCodes[args[0]]\n        if (!code) {\n            code = parseInt(args[0], 10)\n        }\n        return function (e) {\n            if (e.originalEvent.keyCode === code) {\n                handler.call(this, e)\n            }\n        }\n    }\n\n}//@ sourceURL=seed/src/filters.js"
));
require.register("seed/src/directives/index.js", Function("exports, require, module",
"module.exports = {\n\n    on    : require('./on'),\n    each  : require('./each'),\n\n    attr: function (value) {\n        this.el.setAttribute(this.arg, value)\n    },\n\n    text: function (value) {\n        this.el.textContent =\n            (typeof value === 'string' || typeof value === 'number')\n            ? value : ''\n    },\n\n    html: function (value) {\n        this.el.innerHTML =\n            (typeof value === 'string' || typeof value === 'number')\n            ? value : ''\n    },\n\n    show: function (value) {\n        this.el.style.display = value ? '' : 'none'\n    },\n\n    visible: function (value) {\n        this.el.style.visibility = value ? '' : 'hidden'\n    },\n    \n    focus: function (value) {\n        // yield so it work when toggling visibility\n        var el = this.el\n        setTimeout(function () {\n            el[value ? 'focus' : 'blur']()\n        }, 0)\n    },\n\n    class: function (value) {\n        if (this.arg) {\n            this.el.classList[value ? 'add' : 'remove'](this.arg)\n        } else {\n            if (this.lastVal) {\n                this.el.classList.remove(this.lastVal)\n            }\n            this.el.classList.add(value)\n            this.lastVal = value\n        }\n    },\n\n    value: {\n        bind: function () {\n            if (this.oneway) return\n            var el = this.el, self = this\n            this.change = function () {\n                self.seed.scope[self.key] = el.value\n            }\n            el.addEventListener('change', this.change)\n        },\n        update: function (value) {\n            this.el.value = value\n        },\n        unbind: function () {\n            if (this.oneway) return\n            this.el.removeEventListener('change', this.change)\n        }\n    },\n\n    checked: {\n        bind: function () {\n            if (this.oneway) return\n            var el = this.el, self = this\n            this.change = function () {\n                self.seed.scope[self.key] = el.checked\n            }\n            el.addEventListener('change', this.change)\n        },\n        update: function (value) {\n            this.el.checked = !!value\n        },\n        unbind: function () {\n            if (this.oneway) return\n            this.el.removeEventListener('change', this.change)\n        }\n    },\n\n    'if': {\n        bind: function () {\n            this.parent = this.el.parentNode\n            this.ref = document.createComment('sd-if-' + this.key)\n            var next = this.el.nextSibling\n            if (next) {\n                this.parent.insertBefore(this.ref, next)\n            } else {\n                this.parent.appendChild(this.ref)\n            }\n        },\n        update: function (value) {\n            if (!value) {\n                if (this.el.parentNode) {\n                    this.parent.removeChild(this.el)\n                }\n            } else {\n                if (!this.el.parentNode) {\n                    this.parent.insertBefore(this.el, this.ref)\n                }\n            }\n        }\n    },\n\n    style: {\n        bind: function () {\n            this.arg = convertCSSProperty(this.arg)\n        },\n        update: function (value) {\n            this.el.style[this.arg] = value\n        }\n    }\n}\n\n/*\n *  convert hyphen style CSS property to Camel style\n */\nvar CONVERT_RE = /-(.)/g\nfunction convertCSSProperty (prop) {\n    if (prop.charAt(0) === '-') prop = prop.slice(1)\n    return prop.replace(CONVERT_RE, function (m, char) {\n        return char.toUpperCase()\n    })\n}//@ sourceURL=seed/src/directives/index.js"
));
require.register("seed/src/directives/each.js", Function("exports, require, module",
"var config = require('../config')\n\n/*\n *  Mathods that perform precise DOM manipulation\n *  based on mutator method triggered\n */\nvar mutationHandlers = {\n\n    push: function (m) {\n        var self = this\n        m.args.forEach(function (data, i) {\n            var seed = self.buildItem(data, self.collection.length + i)\n            self.container.insertBefore(seed.el, self.ref)\n        })\n    },\n\n    pop: function (m) {\n        m.result.$destroy()\n    },\n\n    unshift: function (m) {\n        var self = this\n        m.args.forEach(function (data, i) {\n            var seed = self.buildItem(data, i),\n                ref  = self.collection.length > m.args.length\n                     ? self.collection[m.args.length].$el\n                     : self.ref\n            self.container.insertBefore(seed.el, ref)\n        })\n        self.updateIndexes()\n    },\n\n    shift: function (m) {\n        m.result.$destroy()\n        var self = this\n        self.updateIndexes()\n    },\n\n    splice: function (m) {\n        var self    = this,\n            index   = m.args[0],\n            removed = m.args[1],\n            added   = m.args.length - 2\n        m.result.forEach(function (scope) {\n            scope.$destroy()\n        })\n        if (added > 0) {\n            m.args.slice(2).forEach(function (data, i) {\n                var seed = self.buildItem(data, index + i),\n                    pos  = index - removed + added + 1,\n                    ref  = self.collection[pos]\n                         ? self.collection[pos].$el\n                         : self.ref\n                self.container.insertBefore(seed.el, ref)\n            })\n        }\n        if (removed !== added) {\n            self.updateIndexes()\n        }\n    },\n\n    sort: function () {\n        var self = this\n        self.collection.forEach(function (scope, i) {\n            scope.$index = i\n            self.container.insertBefore(scope.$el, self.ref)\n        })\n    }\n}\n\nmutationHandlers.reverse = mutationHandlers.sort\n\nmodule.exports = {\n\n    bind: function () {\n        this.el.removeAttribute(config.prefix + '-each')\n        var ctn = this.container = this.el.parentNode\n        // create a comment node as a reference node for DOM insertions\n        this.ref = document.createComment('sd-each-' + this.arg)\n        ctn.insertBefore(this.ref, this.el)\n        ctn.removeChild(this.el)\n    },\n\n    update: function (collection) {\n\n        this.unbind(true)\n        if (!Array.isArray(collection)) return\n        this.collection = collection\n\n        // attach an object to container to hold handlers\n        this.container.sd_dHandlers = {}\n\n        // listen for collection mutation events\n        // the collection has been augmented during Binding.set()\n        var self = this\n        collection.on('mutate', function (mutation) {\n            mutationHandlers[mutation.method].call(self, mutation)\n        })\n\n        // create child-seeds and append to DOM\n        collection.forEach(function (data, i) {\n            var seed = self.buildItem(data, i)\n            self.container.insertBefore(seed.el, self.ref)\n        })\n    },\n\n    buildItem: function (data, index) {\n        var Seed = require('../seed'),\n            node = this.el.cloneNode(true)\n        var spore = new Seed(node, {\n                each: true,\n                eachPrefix: this.arg + '.',\n                parentSeed: this.seed,\n                index: index,\n                data: data,\n                delegator: this.container\n            })\n        this.collection[index] = spore.scope\n        return spore\n    },\n\n    updateIndexes: function () {\n        this.collection.forEach(function (scope, i) {\n            scope.$index = i\n        })\n    },\n\n    unbind: function (reset) {\n        if (this.collection && this.collection.length) {\n            var fn = reset ? '_destroy' : '_unbind'\n            this.collection.forEach(function (scope) {\n                scope.$seed[fn]()\n            })\n            this.collection = null\n        }\n        var ctn = this.container,\n            handlers = ctn.sd_dHandlers\n        for (var key in handlers) {\n            ctn.removeEventListener(handlers[key].event, handlers[key])\n        }\n        delete ctn.sd_dHandlers\n    }\n}//@ sourceURL=seed/src/directives/each.js"
));
require.register("seed/src/directives/on.js", Function("exports, require, module",
"function delegateCheck (current, top, identifier) {\n    if (current[identifier]) {\n        return current\n    } else if (current === top) {\n        return false\n    } else {\n        return delegateCheck(current.parentNode, top, identifier)\n    }\n}\n\nmodule.exports = {\n\n    expectFunction : true,\n\n    bind: function () {\n        if (this.seed.each) {\n            // attach an identifier to the el\n            // so it can be matched during event delegation\n            this.el[this.expression] = true\n            // attach the owner scope of this directive\n            this.el.sd_scope = this.seed.scope\n        }\n    },\n\n    update: function (handler) {\n\n        this.unbind()\n        if (!handler) return\n\n        var seed  = this.seed,\n            event = this.arg\n\n        if (seed.each && event !== 'blur' && event !== 'blur') {\n\n            // for each blocks, delegate for better performance\n            // focus and blur events dont bubble so exclude them\n            var delegator  = seed.delegator,\n                identifier = this.expression,\n                dHandler   = delegator.sd_dHandlers[identifier]\n\n            if (dHandler) return\n\n            // the following only gets run once for the entire each block\n            dHandler = delegator.sd_dHandlers[identifier] = function (e) {\n                var target = delegateCheck(e.target, delegator, identifier)\n                if (target) {\n                    handler.call(seed.scope, {\n                        el: target,\n                        scope: target.sd_scope,\n                        originalEvent: e\n                    })\n                }\n            }\n            dHandler.event = event\n            delegator.addEventListener(event, dHandler)\n\n        } else {\n\n            // a normal, single element handler\n            this.handler = function (e) {\n                handler.call(seed.scope, {\n                    el: e.currentTarget,\n                    scope: seed.scope,\n                    originalEvent: e\n                })\n            }\n            this.el.addEventListener(event, this.handler)\n\n        }\n    },\n\n    unbind: function () {\n        this.el.removeEventListener(this.arg, this.handler)\n    }\n}//@ sourceURL=seed/src/directives/on.js"
));
require.alias("component-emitter/index.js", "seed/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("seed/src/main.js", "seed/index.js");

window.Seed = window.Seed || require('seed')
Seed.version = 'dev'
})();