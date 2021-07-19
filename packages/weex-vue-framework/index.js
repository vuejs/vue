'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*  */

// this will be preserved during build
// $flow-disable-line
var VueFactory = require('./factory');

var instanceOptions = {};

/**
 * Create instance context.
 */
function createInstanceContext (
  instanceId,
  runtimeContext,
  data
) {
  if ( data === void 0 ) data = {};

  var weex = runtimeContext.weex;
  var instance = instanceOptions[instanceId] = {
    instanceId: instanceId,
    config: weex.config,
    document: weex.document,
    data: data
  };

  // Each instance has a independent `Vue` module instance
  var Vue = instance.Vue = createVueModuleInstance(instanceId, weex);

  // DEPRECATED
  var timerAPIs = getInstanceTimer(instanceId, weex.requireModule);

  var instanceContext = Object.assign({ Vue: Vue }, timerAPIs);
  Object.freeze(instanceContext);
  return instanceContext
}

/**
 * Destroy an instance with id. It will make sure all memory of
 * this instance released and no more leaks.
 */
function destroyInstance (instanceId) {
  var instance = instanceOptions[instanceId];
  if (instance && instance.app instanceof instance.Vue) {
    try {
      instance.app.$destroy();
      instance.document.destroy();
    } catch (e) {}
    delete instance.document;
    delete instance.app;
  }
  delete instanceOptions[instanceId];
}

/**
 * Refresh an instance with id and new top-level component data.
 * It will use `Vue.set` on all keys of the new data. So it's better
 * define all possible meaningful keys when instance created.
 */
function refreshInstance (
  instanceId,
  data
) {
  var instance = instanceOptions[instanceId];
  if (!instance || !(instance.app instanceof instance.Vue)) {
    return new Error(("refreshInstance: instance " + instanceId + " not found!"))
  }
  if (instance.Vue && instance.Vue.set) {
    for (var key in data) {
      instance.Vue.set(instance.app, key, data[key]);
    }
  }
  // Finally `refreshFinish` signal needed.
  instance.document.taskCenter.send('dom', { action: 'refreshFinish' }, []);
}

/**
 * Create a fresh instance of Vue for each Weex instance.
 */
function createVueModuleInstance (
  instanceId,
  weex
) {
  var exports = {};
  VueFactory(exports, weex.document);
  var Vue = exports.Vue;

  var instance = instanceOptions[instanceId];

  // patch reserved tag detection to account for dynamically registered
  // components
  var weexRegex = /^weex:/i;
  var isReservedTag = Vue.config.isReservedTag || (function () { return false; });
  var isRuntimeComponent = Vue.config.isRuntimeComponent || (function () { return false; });
  Vue.config.isReservedTag = function (name) {
    return (!isRuntimeComponent(name) && weex.supports(("@component/" + name))) ||
      isReservedTag(name) ||
      weexRegex.test(name)
  };
  Vue.config.parsePlatformTagName = function (name) { return name.replace(weexRegex, ''); };

  // expose weex-specific info
  Vue.prototype.$instanceId = instanceId;
  Vue.prototype.$document = instance.document;

  // expose weex native module getter on subVue prototype so that
  // vdom runtime modules can access native modules via vnode.context
  Vue.prototype.$requireWeexModule = weex.requireModule;

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
    },
    mounted: function mounted () {
      var options = this.$options;
      // root component (vm)
      if (options.el && weex.document && instance.app === this) {
        try {
          // Send "createFinish" signal to native.
          weex.document.taskCenter.send('dom', { action: 'createFinish' }, []);
        } catch (e) {}
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
 * DEPRECATED
 * Generate HTML5 Timer APIs. An important point is that the callback
 * will be converted into callback id when sent to native. So the
 * framework can make sure no side effect of the callback happened after
 * an instance destroyed.
 */
function getInstanceTimer (
  instanceId,
  moduleGetter
) {
  var instance = instanceOptions[instanceId];
  var timer = moduleGetter('timer');
  var timerAPIs = {
    setTimeout: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var handler = function () {
        args[0].apply(args, args.slice(2));
      };

      timer.setTimeout(handler, args[1]);
      return instance.document.taskCenter.callbackManager.lastCallbackId.toString()
    },
    setInterval: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var handler = function () {
        args[0].apply(args, args.slice(2));
      };

      timer.setInterval(handler, args[1]);
      return instance.document.taskCenter.callbackManager.lastCallbackId.toString()
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

exports.createInstanceContext = createInstanceContext;
exports.destroyInstance = destroyInstance;
exports.refreshInstance = refreshInstance;
