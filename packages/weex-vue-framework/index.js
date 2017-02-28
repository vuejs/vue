'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var latestNodeId = 1;

function TextNode (text) {
  this.instanceId = '';
  this.nodeId = latestNodeId++;
  this.parentNode = null;
  this.nodeType = 3;
  this.text = text;
}

// this will be preserved during build
var VueFactory = require('./factory');

var instances = {};
var modules = {};
var components = {};

var renderer = {
  TextNode: TextNode,
  instances: instances,
  modules: modules,
  components: components
};

/**
 * Prepare framework config, basically about the virtual-DOM and JS bridge.
 * @param {object} cfg
 */
function init (cfg) {
  renderer.Document = cfg.Document;
  renderer.Element = cfg.Element;
  renderer.Comment = cfg.Comment;
  renderer.sendTasks = cfg.sendTasks;
}

/**
 * Reset framework config and clear all registrations.
 */
function reset () {
  clear(instances);
  clear(modules);
  clear(components);
  delete renderer.Document;
  delete renderer.Element;
  delete renderer.Comment;
  delete renderer.sendTasks;
}

/**
 * Delete all keys of an object.
 * @param {object} obj
 */
function clear (obj) {
  for (var key in obj) {
    delete obj[key];
  }
}

/**
 * Create an instance with id, code, config and external data.
 * @param {string} instanceId
 * @param {string} appCode
 * @param {object} config
 * @param {object} data
 * @param {object} env { info, config, services }
 */
function createInstance (
  instanceId,
  appCode,
  config,
  data,
  env
) {
  if ( appCode === void 0 ) appCode = '';
  if ( config === void 0 ) config = {};
  if ( env === void 0 ) env = {};

  // Virtual-DOM object.
  var document = new renderer.Document(instanceId, config.bundleUrl);

  // All function/callback of parameters before sent to native
  // will be converted as an id. So `callbacks` is used to store
  // these real functions. When a callback invoked and won't be
  // called again, it should be removed from here automatically.
  var callbacks = [];

  // The latest callback id, incremental.
  var callbackId = 1;

  var instance = instances[instanceId] = {
    instanceId: instanceId, config: config, data: data,
    document: document, callbacks: callbacks, callbackId: callbackId
  };

  // Prepare native module getter and HTML5 Timer APIs.
  var moduleGetter = genModuleGetter(instanceId);
  var timerAPIs = getInstanceTimer(instanceId, moduleGetter);

  // Prepare `weex` instance variable.
  var weexInstanceVar = {
    config: config,
    document: document,
    requireModule: moduleGetter
  };
  Object.freeze(weexInstanceVar);

  // Each instance has a independent `Vue` mdoule instance
  var Vue = instance.Vue = createVueModuleInstance(instanceId, moduleGetter);

  // The function which create a closure the JS Bundle will run in.
  // It will declare some instance variables like `Vue`, HTML5 Timer APIs etc.
  var instanceVars = Object.assign({
    Vue: Vue,
    weex: weexInstanceVar,
    // deprecated
    __weex_require_module__: weexInstanceVar.requireModule // eslint-disable-line
  }, timerAPIs);
  callFunction(instanceVars, appCode);

  // Send `createFinish` signal to native.
  renderer.sendTasks(instanceId + '', [{ module: 'dom', method: 'createFinish', args: [] }], -1);
}

/**
 * Destroy an instance with id. It will make sure all memory of
 * this instance released and no more leaks.
 * @param {string} instanceId
 */
function destroyInstance (instanceId) {
  var instance = instances[instanceId];
  if (instance && instance.app instanceof instance.Vue) {
    instance.app.$destroy();
  }
  delete instances[instanceId];
}

/**
 * Refresh an instance with id and new top-level component data.
 * It will use `Vue.set` on all keys of the new data. So it's better
 * define all possible meaningful keys when instance created.
 * @param {string} instanceId
 * @param {object} data
 */
function refreshInstance (instanceId, data) {
  var instance = instances[instanceId];
  if (!instance || !(instance.app instanceof instance.Vue)) {
    return new Error(("refreshInstance: instance " + instanceId + " not found!"))
  }
  for (var key in data) {
    instance.Vue.set(instance.app, key, data[key]);
  }
  // Finally `refreshFinish` signal needed.
  renderer.sendTasks(instanceId + '', [{ module: 'dom', method: 'refreshFinish', args: [] }], -1);
}

/**
 * Get the JSON object of the root element.
 * @param {string} instanceId
 */
function getRoot (instanceId) {
  var instance = instances[instanceId];
  if (!instance || !(instance.app instanceof instance.Vue)) {
    return new Error(("getRoot: instance " + instanceId + " not found!"))
  }
  return instance.app.$el.toJSON()
}

/**
 * Receive tasks from native. Generally there are two types of tasks:
 * 1. `fireEvent`: an device actions or user actions from native.
 * 2. `callback`: invoke function which sent to native as a parameter before.
 * @param {string} instanceId
 * @param {array}  tasks
 */
function receiveTasks (instanceId, tasks) {
  var instance = instances[instanceId];
  if (!instance || !(instance.app instanceof instance.Vue)) {
    return new Error(("receiveTasks: instance " + instanceId + " not found!"))
  }
  var callbacks = instance.callbacks;
  var document = instance.document;
  tasks.forEach(function (task) {
    // `fireEvent` case: find the event target and fire.
    if (task.method === 'fireEvent') {
      var ref = task.args;
      var nodeId = ref[0];
      var type = ref[1];
      var e = ref[2];
      var domChanges = ref[3];
      var el = document.getRef(nodeId);
      document.fireEvent(el, type, e, domChanges);
    }
    // `callback` case: find the callback by id and call it.
    if (task.method === 'callback') {
      var ref$1 = task.args;
      var callbackId = ref$1[0];
      var data = ref$1[1];
      var ifKeepAlive = ref$1[2];
      var callback = callbacks[callbackId];
      if (typeof callback === 'function') {
        callback(data);
        // Remove the callback from `callbacks` if it won't called again.
        if (typeof ifKeepAlive === 'undefined' || ifKeepAlive === false) {
          callbacks[callbackId] = undefined;
        }
      }
    }
  });
  // Finally `updateFinish` signal needed.
  renderer.sendTasks(instanceId + '', [{ module: 'dom', method: 'updateFinish', args: [] }], -1);
}

/**
 * Register native modules information.
 * @param {object} newModules
 */
function registerModules (newModules) {
  var loop = function ( name ) {
    if (!modules[name]) {
      modules[name] = {};
    }
    newModules[name].forEach(function (method) {
      if (typeof method === 'string') {
        modules[name][method] = true;
      } else {
        modules[name][method.name] = method.args;
      }
    });
  };

  for (var name in newModules) loop( name );
}

/**
 * Register native components information.
 * @param {array} newComponents
 */
function registerComponents (newComponents) {
  if (Array.isArray(newComponents)) {
    newComponents.forEach(function (component) {
      if (!component) {
        return
      }
      if (typeof component === 'string') {
        components[component] = true;
      } else if (typeof component === 'object' && typeof component.type === 'string') {
        components[component.type] = component;
      }
    });
  }
}

/**
 * Create a fresh instance of Vue for each Weex instance.
 */
function createVueModuleInstance (instanceId, moduleGetter) {
  var exports = {};
  VueFactory(exports, renderer);
  var Vue = exports.Vue;

  var instance = instances[instanceId];

  // patch reserved tag detection to account for dynamically registered
  // components
  var isReservedTag = Vue.config.isReservedTag || (function () { return false; });
  Vue.config.isReservedTag = function (name) {
    return components[name] || isReservedTag(name)
  };

  // expose weex-specific info
  Vue.prototype.$instanceId = instanceId;
  Vue.prototype.$document = instance.document;

  // expose weex native module getter on subVue prototype so that
  // vdom runtime modules can access native modules via vnode.context
  Vue.prototype.$requireWeexModule = moduleGetter;

  // Hack `Vue` behavior to handle instance information and data
  // before root component created.
  Vue.mixin({
    beforeCreate: function beforeCreate () {
      var options = this.$options;
      // root component (vm)
      if (options.el) {
        // set external data of instance
        var dataOption = options.data;
        var internalData = (typeof dataOption === 'function' ? dataOption() : dataOption) || {};
        options.data = Object.assign(internalData, instance.data);
        // record instance by id
        instance.app = this;
      }
    }
  });

  /**
   * @deprecated Just instance variable `weex.config`
   * Get instance config.
   * @return {object}
   */
  Vue.prototype.$getConfig = function () {
    if (instance.app instanceof Vue) {
      return instance.config
    }
  };

  return Vue
}

/**
 * Generate native module getter. Each native module has several
 * methods to call. And all the hebaviors is instance-related. So
 * this getter will return a set of methods which additionally
 * send current instance id to native when called. Also the args
 * will be normalized into "safe" value. For example function arg
 * will be converted into a callback id.
 * @param  {string}  instanceId
 * @return {function}
 */
function genModuleGetter (instanceId) {
  var instance = instances[instanceId];
  return function (name) {
    var nativeModule = modules[name] || [];
    var output = {};
    var loop = function ( methodName ) {
      output[methodName] = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var finalArgs = args.map(function (value) {
          return normalize(value, instance)
        });
        renderer.sendTasks(instanceId + '', [{ module: name, method: methodName, args: finalArgs }], -1);
      };
    };

    for (var methodName in nativeModule) loop( methodName );
    return output
  }
}

/**
 * Generate HTML5 Timer APIs. An important point is that the callback
 * will be converted into callback id when sent to native. So the
 * framework can make sure no side effect of the callabck happened after
 * an instance destroyed.
 * @param  {[type]} instanceId   [description]
 * @param  {[type]} moduleGetter [description]
 * @return {[type]}              [description]
 */
function getInstanceTimer (instanceId, moduleGetter) {
  var instance = instances[instanceId];
  var timer = moduleGetter('timer');
  var timerAPIs = {
    setTimeout: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var handler = function () {
        args[0].apply(args, args.slice(2));
      };
      timer.setTimeout(handler, args[1]);
      return instance.callbackId.toString()
    },
    setInterval: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var handler = function () {
        args[0].apply(args, args.slice(2));
      };
      timer.setInterval(handler, args[1]);
      return instance.callbackId.toString()
    },
    clearTimeout: function (n) {
      timer.clearTimeout(n);
    },
    clearInterval: function (n) {
      timer.clearInterval(n);
    }
  };
  return timerAPIs
}

/**
 * Call a new function body with some global objects.
 * @param  {object} globalObjects
 * @param  {string} code
 * @return {any}
 */
function callFunction (globalObjects, body) {
  var globalKeys = [];
  var globalValues = [];
  for (var key in globalObjects) {
    globalKeys.push(key);
    globalValues.push(globalObjects[key]);
  }
  globalKeys.push(body);

  var result = new (Function.prototype.bind.apply( Function, [ null ].concat( globalKeys) ));
  return result.apply(void 0, globalValues)
}

/**
 * Convert all type of values into "safe" format to send to native.
 * 1. A `function` will be converted into callback id.
 * 2. An `Element` object will be converted into `ref`.
 * The `instance` param is used to generate callback id and store
 * function if necessary.
 * @param  {any}    v
 * @param  {object} instance
 * @return {any}
 */
function normalize (v, instance) {
  var type = typof(v);

  switch (type) {
    case 'undefined':
    case 'null':
      return ''
    case 'regexp':
      return v.toString()
    case 'date':
      return v.toISOString()
    case 'number':
    case 'string':
    case 'boolean':
    case 'array':
    case 'object':
      if (v instanceof renderer.Element) {
        return v.ref
      }
      return v
    case 'function':
      instance.callbacks[++instance.callbackId] = v;
      return instance.callbackId.toString()
    default:
      return JSON.stringify(v)
  }
}

/**
 * Get the exact type of an object by `toString()`. For example call
 * `toString()` on an array will be returned `[object Array]`.
 * @param  {any}    v
 * @return {string}
 */
function typof (v) {
  var s = Object.prototype.toString.call(v);
  return s.substring(8, s.length - 1).toLowerCase()
}

exports.init = init;
exports.reset = reset;
exports.createInstance = createInstance;
exports.destroyInstance = destroyInstance;
exports.refreshInstance = refreshInstance;
exports.getRoot = getRoot;
exports.receiveTasks = receiveTasks;
exports.registerModules = registerModules;
exports.registerComponents = registerComponents;
