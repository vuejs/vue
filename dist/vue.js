/*!
 * Vue.js v2.0.0-alpha.1
 * (c) 2014-2016 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Vue = factory());
}(this, function () { 'use strict';

  /**
   * Convert a value to a string that is actually rendered.
   */
  function renderString(val) {
    return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
  }

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap(str, expectsLowerCase) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase ? function (val) {
      return map[val.toLowerCase()];
    } : function (val) {
      return map[val];
    };
  }

  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag = makeMap('slot,component,render,transition', true);

  /**
   * Remove an item from an array
   */
  function remove(arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1);
      }
    }
  }

  /**
   * Check whether the object has the property.
   */
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
  }

  /**
   * Check if value is primitive
   */
  function isPrimitive(value) {
    return typeof value === 'string' || typeof value === 'number';
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached(fn) {
    var cache = Object.create(null);
    return function cachedFn(str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  }

  /**
   * Camelize a hyphen-delmited string.
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) {
      return c ? c.toUpperCase() : '';
    });
  });

  /**
   * Capitalize a string.
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE = /([a-z\d])([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '$1-$2').toLowerCase();
  });

  /**
   * Simple bind, faster than native
   */
  function bind(fn, ctx) {
    return function (a) {
      var l = arguments.length;
      return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
    };
  }

  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray(list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret;
  }

  /**
   * Mix properties into target object.
   */
  function extend(to, _from) {
    for (var _key in _from) {
      to[_key] = _from[_key];
    }
    return to;
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  var toString = Object.prototype.toString;
  var OBJECT_STRING = '[object Object]';
  function isPlainObject(obj) {
    return toString.call(obj) === OBJECT_STRING;
  }

  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject(arr) {
    var res = arr[0] || {};
    for (var i = 1; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res;
  }

  /**
   * Perform no operation.
   */
  function noop() {}

  /**
   * Always return false.
   */
  var no = function no() {
    return false;
  };

  /**
   * Generate a static keys string from compiler modules.
   */
  function genStaticKeys(modules) {
    return modules.reduce(function (keys, m) {
      return keys.concat(m.staticKeys || []);
    }, []).join(',');
  }

  var config = {
    /**
     * Option merge strategies (used in core/util/options)
     */
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Error handler for watcher errors
     */
    errorHandler: null,

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * List of asset types that a component can own.
     */
    _assetTypes: ['component', 'directive', 'transition', 'filter'],

    /**
     * List of lifecycle hooks.
     */
    _lifecycleHooks: ['init', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'activated', 'deactivated'],

    /**
     * Max circular updates allowed in a scheduler flush cycle.
     */
    _maxUpdateCount: 100,

    /**
     * Server rendering?
     */
    _isServer: "client" === 'server',

    /**
     * Keeping track of all extended Component constructors
     * so that we can update them in the case of global mixins being applied
     * after their creation.
     */
    _ctors: []
  };

  /**
   * Check if a string starts with $ or _
   */
  function isReserved(str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F;
  }

  /**
   * Define a property.
   */
  function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Parse simple path.
   */
  var bailRE = /[^\w\.]/;
  function parsePath(path) {
    if (bailRE.test(path)) {
      return;
    } else {
      var _ret = function () {
        var segments = path.split('.');
        return {
          v: function v(obj) {
            for (var i = 0; i < segments.length; i++) {
              if (!obj) return;
              obj = obj[segments[i]];
            }
            return obj;
          }
        };
      }();

      if (typeof _ret === "object") return _ret.v;
    }
  }

  /* global MutationObserver */
  // can we use __proto__?
  var hasProto = '__proto__' in {};

  // Browser environment sniffing
  var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

  // detect devtools
  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  // UA sniffing for working around browser-specific quirks
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
  var iosVersionMatch = UA && isIos && UA.match(/os ([\d_]+)/);
  var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_');

  // MutationObserver is unreliable in iOS 9.3 UIWebView
  // detecting it by checking presence of IndexedDB
  // ref #3027
  var hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB;

  /**
   * Defer a task to execute it asynchronously. Ideally this
   * should be executed as a microtask, so we leverage
   * MutationObserver if it's available, and fallback to
   * setTimeout(0).
   *
   * @param {Function} cb
   * @param {Object} ctx
   */
  var nextTick = function () {
    var callbacks = [];
    var pending = false;
    var timerFunc = void 0;
    function nextTickHandler() {
      pending = false;
      var copies = callbacks.slice(0);
      callbacks = [];
      for (var i = 0; i < copies.length; i++) {
        copies[i]();
      }
    }

    /* istanbul ignore else */
    if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
      (function () {
        var counter = 1;
        var observer = new MutationObserver(nextTickHandler);
        var textNode = document.createTextNode(String(counter));
        observer.observe(textNode, {
          characterData: true
        });
        timerFunc = function timerFunc() {
          counter = (counter + 1) % 2;
          textNode.data = String(counter);
        };
      })();
    } else {
      // webpack attempts to inject a shim for setImmediate
      // if it is used as a global, so we have to work around that to
      // avoid bundling unnecessary code.
      var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
      timerFunc = context.setImmediate || setTimeout;
    }
    return function (cb, ctx) {
      var func = ctx ? function () {
        cb.call(ctx);
      } : cb;
      callbacks.push(func);
      if (pending) return;
      pending = true;
      timerFunc(nextTickHandler, 0);
    };
  }();

  var Set$1 = void 0;
  /* istanbul ignore if */
  if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
    // use native Set when available.
    Set$1 = Set;
  } else {
    // a non-standard Set polyfill that only works with primitive keys.
    Set$1 = function () {
      function Set() {
        this.set = Object.create(null);
      }

      Set.prototype.has = function has(key) {
        return this.set[key] !== undefined;
      };

      Set.prototype.add = function add(key) {
        this.set[key] = 1;
      };

      Set.prototype.clear = function clear() {
        this.set = Object.create(null);
      };

      return Set;
    }();
  }

  var hasProxy = void 0;
  var proxyHandlers = void 0;
  var initProxy = void 0;
  if ("development" !== 'production') {
    (function () {
      var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' + 'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' + 'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' + 'require,__webpack_require__' // for Webpack/Browserify
      );

      hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/);

      proxyHandlers = {
        has: function has(target, key) {
          var has = key in target;
          var isAllowedGlobal = allowedGlobals(key);
          if (!has && !isAllowedGlobal) {
            warn('Trying to access non-existent property "' + key + '" while rendering. ' + 'Make sure to declare reactive data properties in the data option.', target);
          }
          return !isAllowedGlobal;
        }
      };

      initProxy = function initProxy(vm) {
        if (hasProxy) {
          vm._renderProxy = new Proxy(vm, proxyHandlers);
        } else {
          vm._renderProxy = vm;
        }
      };
    })();
  }

  var uid$2 = 0;

  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   */

  var Dep = function () {
    function Dep() {
      this.id = uid$2++;
      this.subs = [];
    }

    Dep.prototype.addSub = function addSub(sub) {
      this.subs.push(sub);
    };

    Dep.prototype.removeSub = function removeSub(sub) {
      remove(this.subs, sub);
    };

    Dep.prototype.depend = function depend() {
      if (Dep.target) {
        Dep.target.addDep(this);
      }
    };

    Dep.prototype.notify = function notify() {
      // stablize the subscriber list first
      var subs = this.subs.slice();
      for (var i = 0, l = subs.length; i < l; i++) {
        subs[i].update();
      }
    };

    return Dep;
  }();

  Dep.target = null;

  // we have two separate queues: one for directive updates
  // and one for user watcher registered via $watch().
  // we want to guarantee directive updates to be called
  // before user watchers so that when user watchers are
  // triggered, the DOM would have already been in updated
  // state.

  var queue = [];
  var userQueue = [];
  var has = {};
  var circular = {};
  var waiting = false;

  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState() {
    queue.length = 0;
    userQueue.length = 0;
    has = {};
    if ("development" !== 'production') {
      circular = {};
    }
    waiting = false;
  }

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue() {
    runSchedulerQueue(queue.sort(queueSorter));
    runSchedulerQueue(userQueue);
    // user watchers triggered more watchers,
    // keep flushing until it depletes
    if (queue.length) {
      return flushSchedulerQueue();
    }
    resetSchedulerState();
  }

  /**
   * Sort queue before flush.
   * This ensures components are updated from parent to child
   * so there will be no duplicate updates, e.g. a child was
   * pushed into the queue first and then its parent's props
   * changed.
   */
  function queueSorter(a, b) {
    return a.id - b.id;
  }

  /**
   * Run the watchers in a single queue.
   */
  function runSchedulerQueue(queue) {
    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (var i = 0; i < queue.length; i++) {
      var watcher = queue[i];
      var id = watcher.id;
      has[id] = null;
      watcher.run();
      // in dev build, check and stop circular updates.
      if ("development" !== 'production' && has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > config._maxUpdateCount) {
          warn('You may have an infinite update loop for watcher ' + 'with expression "' + watcher.expression + '"', watcher.vm);
          break;
        }
      }
    }
    queue.length = 0;
  }

  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (has[id] == null) {
      // push watcher into appropriate queue
      var q = watcher.user ? userQueue : queue;
      has[id] = true;
      q.push(watcher);
      // queue the flush
      if (!waiting) {
        waiting = true;
        nextTick(flushSchedulerQueue);
      }
    }
  }

  var uid$1 = 0;
  var prevTarget = void 0;

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */

  var Watcher = function () {
    function Watcher(vm, expOrFn, cb) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      this.vm = vm;
      vm._watchers.push(this);
      // options
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.expression = expOrFn.toString();
      this.cb = cb;
      this.id = ++uid$1; // uid for batching
      this.active = true;
      this.dirty = this.lazy; // for lazy watchers
      this.deps = [];
      this.newDeps = [];
      this.depIds = new Set$1();
      this.newDepIds = new Set$1();
      // parse expression for getter
      if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
      } else {
        this.getter = parsePath(expOrFn);
        if (!this.getter) {
          this.getter = function () {};
          "development" !== 'production' && warn('Failed watching path: ' + expOrFn + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
        }
      }
      this.value = this.lazy ? undefined : this.get();
    }

    /**
     * Evaluate the getter, and re-collect dependencies.
     */


    Watcher.prototype.get = function get() {
      this.beforeGet();
      var value = void 0;
      try {
        value = this.getter.call(this.vm, this.vm);
      } catch (e) {
        if ("development" !== 'production') {
          if (this.user) {
            warn('Error when evaluating watcher with getter: ' + this.expression, this.vm);
          } else {
            warn('Error during component render', this.vm);
          }
          /* istanbul ignore else */
          if (config.errorHandler) {
            config.errorHandler.call(null, e, this.vm);
          } else {
            throw e;
          }
        }
        // return old value when evaluation fails so the current UI is preserved
        // if the error was somehow handled by user
        value = this.value;
      }
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      this.afterGet();
      return value;
    };

    /**
     * Prepare for dependency collection.
     */


    Watcher.prototype.beforeGet = function beforeGet() {
      prevTarget = Dep.target;
      Dep.target = this;
    };

    /**
     * Add a dependency to this directive.
     */


    Watcher.prototype.addDep = function addDep(dep) {
      var id = dep.id;
      if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id);
        this.newDeps.push(dep);
        if (!this.depIds.has(id)) {
          dep.addSub(this);
        }
      }
    };

    /**
     * Clean up for dependency collection.
     */


    Watcher.prototype.afterGet = function afterGet() {
      Dep.target = prevTarget;
      var i = this.deps.length;
      while (i--) {
        var dep = this.deps[i];
        if (!this.newDepIds.has(dep.id)) {
          dep.removeSub(this);
        }
      }
      var tmp = this.depIds;
      this.depIds = this.newDepIds;
      this.newDepIds = tmp;
      this.newDepIds.clear();
      tmp = this.deps;
      this.deps = this.newDeps;
      this.newDeps = tmp;
      this.newDeps.length = 0;
    };

    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */


    Watcher.prototype.update = function update() {
      if (this.lazy) {
        this.dirty = true;
      } else {
        queueWatcher(this);
      }
    };

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */


    Watcher.prototype.run = function run() {
      if (this.active) {
        var value = this.get();
        if (value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) || this.deep) {
          // set new value
          var oldValue = this.value;
          this.value = value;
          this.cb.call(this.vm, value, oldValue);
        }
      }
    };

    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */


    Watcher.prototype.evaluate = function evaluate() {
      // avoid overwriting another watcher that is being
      // collected.
      var current = Dep.target;
      this.value = this.get();
      this.dirty = false;
      Dep.target = current;
    };

    /**
     * Depend on all deps collected by this watcher.
     */


    Watcher.prototype.depend = function depend() {
      var i = this.deps.length;
      while (i--) {
        this.deps[i].depend();
      }
    };

    /**
     * Remove self from all dependencies' subcriber list.
     */


    Watcher.prototype.teardown = function teardown() {
      if (this.active) {
        // remove self from vm's watcher list
        // this is a somewhat expensive operation so we skip it
        // if the vm is being destroyed or is performing a v-for
        // re-render (the watcher list is then filtered by v-for).
        if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
          remove(this.vm._watchers, this);
        }
        var i = this.deps.length;
        while (i--) {
          this.deps[i].removeSub(this);
        }
        this.active = false;
      }
    };

    return Watcher;
  }();

  var seenObjects = new Set$1();
  function traverse(val, seen) {
    var i = void 0,
        keys = void 0;
    if (!seen) {
      seen = seenObjects;
      seen.clear();
    }
    var isA = Array.isArray(val);
    var isO = isObject(val);
    if (isA || isO) {
      if (val.__ob__) {
        var depId = val.__ob__.dep.id;
        if (seen.has(depId)) {
          return;
        } else {
          seen.add(depId);
        }
      }
      if (isA) {
        i = val.length;
        while (i--) {
          traverse(val[i], seen);
        }
      } else if (isO) {
        keys = Object.keys(val);
        i = keys.length;
        while (i--) {
          traverse(val[keys[i]], seen);
        }
      }
    }
  }

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto)

  /**
   * Intercept mutating methods and emit events
   */
  ;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
    // cache original method
    var original = arrayProto[method];
    def(arrayMethods, method, function mutator() {
      // avoid leaking arguments:
      // http://jsperf.com/closure-with-arguments
      var i = arguments.length;
      var args = new Array(i);
      while (i--) {
        args[i] = arguments[i];
      }
      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted = void 0;
      switch (method) {
        case 'push':
          inserted = args;
          break;
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
          break;
      }
      if (inserted) ob.observeArray(inserted);
      // notify change
      ob.dep.notify();
      return result;
    });
  });

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  /**
   * By default, when a reactive property is set, the new value is
   * also converted to become reactive. However when passing down props,
   * we don't want to force conversion because the value may be a nested value
   * under a frozen data structure. Converting it would defeat the optimization.
   */
  var observerState = {
    shouldConvert: true,
    isSettingProps: false
  };

  /**
   * Observer class that are attached to each observed
   * object. Once attached, the observer converts target
   * object's property keys into getter/setters that
   * collect dependencies and dispatches updates.
   */
  var Observer = function () {
    // number of vms that has this object as root $data

    function Observer(value) {
      this.value = value;
      this.dep = new Dep();
      this.vmCount = 0;
      def(value, '__ob__', this);
      if (Array.isArray(value)) {
        var augment = hasProto ? protoAugment : copyAugment;
        augment(value, arrayMethods, arrayKeys);
        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }

    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */


    Observer.prototype.walk = function walk(obj) {
      var val = this.value;
      for (var key in obj) {
        defineReactive(val, key, obj[key]);
      }
    };

    /**
     * Observe a list of Array items.
     */


    Observer.prototype.observeArray = function observeArray(items) {
      for (var i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
      }
    };

    return Observer;
  }();

  // helpers

  /**
   * Augment an target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment(target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment an target Object or Array by defining
   * hidden properties.
   *
   * istanbul ignore next
   */
  function copyAugment(target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
  }

  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe(value) {
    if (!isObject(value)) {
      return;
    }
    var ob = void 0;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (observerState.shouldConvert && !config._isServer && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
      ob = new Observer(value);
    }
    return ob;
  }

  /**
   * Define a reactive property on an Object.
   */
  function defineReactive(obj, key, val, customSetter) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return;
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    var setter = property && property.set;

    var childOb = observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        var value = getter ? getter.call(obj) : val;
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
          }
          if (Array.isArray(value)) {
            for (var e, i = 0, l = value.length; i < l; i++) {
              e = value[i];
              e && e.__ob__ && e.__ob__.dep.depend();
            }
          }
        }
        return value;
      },
      set: function reactiveSetter(newVal) {
        var value = getter ? getter.call(obj) : val;
        if (newVal === value) {
          return;
        }
        if ("development" !== 'production' && customSetter) {
          customSetter();
        }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = observe(newVal);
        dep.notify();
      }
    });
  }

  /**
   * Set a property on an object. Adds the new property and
   * triggers change notification if the property doesn't
   * already exist.
   */
  function set(obj, key, val) {
    if (Array.isArray(obj)) {
      obj.splice(key, 1, val);
      return val;
    }
    if (hasOwn(obj, key)) {
      obj[key] = val;
      return;
    }
    var ob = obj.__ob__;
    if (obj._isVue || ob && ob.vmCount) {
      "development" !== 'production' && warn('Avoid adding reactive properties to a Vue instance or its root $data ' + 'at runtime - delcare it upfront in the data option.');
      return;
    }
    if (!ob) {
      obj[key] = val;
      return;
    }
    defineReactive(ob.value, key, val);
    ob.dep.notify();
    return val;
  }

  /**
   * Delete a property and trigger change if necessary.
   */
  function del(obj, key) {
    var ob = obj.__ob__;
    if (obj._isVue || ob && ob.vmCount) {
      "development" !== 'production' && warn('Avoid deleting properties on a Vue instance or its root $data ' + '- just set it to null.');
      return;
    }
    if (!hasOwn(obj, key)) {
      return;
    }
    delete obj[key];
    if (!ob) {
      return;
    }
    ob.dep.notify();
  }

  function proxy(vm, key) {
    if (!isReserved(key)) {
      Object.defineProperty(vm, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return vm._data[key];
        },
        set: function proxySetter(val) {
          vm._data[key] = val;
        }
      });
    }
  }

  // using Object type to avoid flow complaining
  function unproxy(vm, key) {
    if (!isReserved(key)) {
      delete vm[key];
    }
  }

  function initState(vm) {
    vm._watchers = [];
    initProps(vm);
    initData(vm);
    initComputed(vm);
    initMethods(vm);
    initWatch(vm);
  }

  function initProps(vm) {
    var props = vm.$options.props;
    var propsData = vm.$options.propsData;
    if (props) {
      var keys = vm.$options._propKeys = Object.keys(props);
      var isRoot = !vm.$parent;
      // root instance props should be converted
      observerState.shouldConvert = isRoot;

      var _loop = function _loop(i) {
        var key = keys[i];
        /* istanbul ignore else */
        if ("development" !== 'production') {
          defineReactive(vm, key, validateProp(vm, key, propsData), function () {
            if (vm.$parent && !observerState.isSettingProps) {
              warn('Avoid mutating a prop directly since the value will be ' + 'overwritten whenever the parent component re-renders. ' + 'Instead, use a data or computed property based on the prop\'s ' + ('value. Prop being mutated: "' + key + '"'), vm);
            }
          });
        } else {}
      };

      for (var i = 0; i < keys.length; i++) {
        _loop(i);
      }
      observerState.shouldConvert = true;
    }
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};
    if (!isPlainObject(data)) {
      data = {};
      "development" !== 'production' && warn('data functions should return an object.', vm);
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var i = keys.length;
    while (i--) {
      if (props && hasOwn(props, keys[i])) {
        "development" !== 'production' && warn('The data property "' + keys[i] + '" is already declared as a prop. ' + 'Use prop default value instead.', vm);
      } else {
        proxy(vm, keys[i]);
      }
    }
    // observe data
    observe(data);
    data.__ob__ && data.__ob__.vmCount++;
  }

  var computedSharedDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };

  function initComputed(vm) {
    var computed = vm.$options.computed;
    if (computed) {
      for (var _key in computed) {
        var userDef = computed[_key];
        if (typeof userDef === 'function') {
          computedSharedDefinition.get = makeComputedGetter(userDef, vm);
          computedSharedDefinition.set = noop;
        } else {
          computedSharedDefinition.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, vm) : bind(userDef.get, vm) : noop;
          computedSharedDefinition.set = userDef.set ? bind(userDef.set, vm) : noop;
        }
        Object.defineProperty(vm, _key, computedSharedDefinition);
      }
    }
  }

  function makeComputedGetter(getter, owner) {
    var watcher = new Watcher(owner, getter, noop, {
      lazy: true
    });
    return function computedGetter() {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  function initMethods(vm) {
    var methods = vm.$options.methods;
    if (methods) {
      for (var _key2 in methods) {
        vm[_key2] = bind(methods[_key2], vm);
      }
    }
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;
    if (watch) {
      for (var _key3 in watch) {
        var handler = watch[_key3];
        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, _key3, handler[i]);
          }
        } else {
          createWatcher(vm, _key3, handler);
        }
      }
    }
  }

  function createWatcher(vm, key, handler) {
    var options = void 0;
    if (isPlainObject(handler)) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    vm.$watch(key, handler, options);
  }

  function stateMixin(Vue) {
    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    var dataDef = {};
    dataDef.get = function () {
      return this._data;
    };
    dataDef.set = function (newData) {
      if (newData !== this._data) {
        setData(this, newData);
      }
    };
    Object.defineProperty(Vue.prototype, '$data', dataDef);

    Vue.prototype.$watch = function (expOrFn, cb, options) {
      var vm = this;
      options = options || {};
      options.user = true;
      var watcher = new Watcher(vm, expOrFn, cb, options);
      if (options.immediate) {
        cb.call(vm, watcher.value);
      }
      return function unwatchFn() {
        watcher.teardown();
      };
    };
  }

  function setData(vm, newData) {
    newData = newData || {};
    var oldData = vm._data;
    vm._data = newData;
    var keys = void 0,
        key = void 0,
        i = void 0;
    // unproxy keys not present in new data
    keys = Object.keys(oldData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!(key in newData)) {
        unproxy(vm, key);
      }
    }
    // proxy keys not already proxied,
    // and trigger change for changed values
    keys = Object.keys(newData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!hasOwn(vm, key)) {
        // new property
        proxy(vm, key);
      }
    }
    oldData.__ob__ && oldData.__ob__.vmCount--;
    observe(newData);
    newData.__ob__ && newData.__ob__.vmCount++;
    vm.$forceUpdate();
  }

  var VNode = function () {
    function VNode(tag, data, children, text, elm, ns, context, componentOptions) {
      this.tag = tag;
      this.data = data;
      this.children = children;
      this.text = text;
      this.elm = elm;
      this.ns = ns;
      this.context = context;
      this.key = data && data.key;
      this.componentOptions = componentOptions;
      this.child = undefined;
      this.parent = undefined;
      // apply construct hook.
      // this is applied during render, before patch happens.
      // unlike other hooks, this is applied on both client and server.
      var constructHook = data && data.hook && data.hook.construct;
      if (constructHook) {
        constructHook(this);
      }
    }

    VNode.prototype.setChildren = function setChildren(children) {
      this.children = children;
    };

    return VNode;
  }();

  var emptyVNode = function emptyVNode() {
    return new VNode(undefined, undefined, undefined, '');
  };

  function normalizeChildren(children) {
    // invoke children thunks.
    // components always receive their children as thunks so that they
    // can perform the actual render inside their own dependency collection cycle.
    if (typeof children === 'function') {
      children = children();
    }
    if (typeof children === 'string') {
      return [new VNode(undefined, undefined, undefined, children)];
    }
    if (Array.isArray(children)) {
      var res = [];
      for (var i = 0, l = children.length; i < l; i++) {
        var c = children[i];
        //  nested
        if (Array.isArray(c)) {
          res.push.apply(res, normalizeChildren(c));
        } else if (isPrimitive(c)) {
          // convert primitive to vnode
          res.push(new VNode(undefined, undefined, undefined, c));
        } else if (c instanceof VNode) {
          res.push(c);
        }
      }
      return res;
    }
    return [];
  }

  function updateListeners(on, oldOn, add, remove) {
    var name = void 0,
        cur = void 0,
        old = void 0,
        fn = void 0,
        event = void 0,
        capture = void 0;
    for (name in on) {
      cur = on[name];
      old = oldOn[name];
      if (!old) {
        capture = name.charAt(0) === '!';
        event = capture ? name.slice(1) : name;
        if (Array.isArray(cur)) {
          add(event, cur.invoker = arrInvoker(cur), capture);
        } else {
          fn = cur;
          cur = on[name] = {};
          cur.fn = fn;
          add(event, cur.invoker = fnInvoker(cur), capture);
        }
      } else if (Array.isArray(old)) {
        old.length = cur.length;
        for (var i = 0; i < old.length; i++) {
          old[i] = cur[i];
        }on[name] = old;
      } else {
        old.fn = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (!on[name]) {
        event = name.charAt(0) === '!' ? name.slice(1) : name;
        remove(event, oldOn[name].invoker);
      }
    }
  }

  function arrInvoker(arr) {
    return function (ev) {
      var single = arguments.length === 1;
      for (var i = 0; i < arr.length; i++) {
        single ? arr[i](ev) : arr[i].apply(null, arguments);
      }
    };
  }

  function fnInvoker(o) {
    return function (ev) {
      var single = arguments.length === 1;
      single ? o.fn(ev) : o.fn.apply(null, arguments);
    };
  }

  function initLifecycle(vm) {
    var options = vm.$options;

    vm.$parent = options.parent;
    vm.$root = vm.$parent ? vm.$parent.$root : vm;
    if (vm.$parent && !options._abstract) {
      vm.$parent.$children.push(vm);
    }

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._mount = function (el, hydrating) {
      var vm = this;
      vm.$el = el;
      if (!vm.$options.render) {
        vm.$options.render = emptyVNode;
        if ("development" !== 'production') {
          /* istanbul ignore if */
          if (vm.$options.template) {
            warn('You are using the runtime-only build of Vue where the template ' + 'option is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', vm);
          } else {
            warn('Failed to mount component: template or render function not defined.', vm);
          }
        }
      }
      callHook(vm, 'beforeMount');
      vm._watcher = new Watcher(vm, function () {
        vm._update(vm._render(), hydrating);
      }, noop);
      hydrating = false;
      // root instance, call mounted on self
      // mounted is called for child components in its inserted hook
      if (vm.$root === vm) {
        vm._isMounted = true;
        callHook(vm, 'mounted');
      }
      return vm;
    };

    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate');
      }
      if (!vm._vnode) {
        // Vue.prototype.__patch__ is injected in entry points
        // based on the rendering backend used.
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating);
      } else {
        vm.$el = vm.__patch__(vm._vnode, vnode);
      }
      vm._vnode = vnode;
      // update parent vnode element after patch
      var parentNode = vm.$options._parentVnode;
      if (parentNode) {
        parentNode.elm = vm.$el;
        // update parent $el if the parent is HOC
        // this is necessary because child is updated after parent
        if (vm.$parent && parentNode === vm.$parent._vnode) {
          vm.$parent.$el = vm.$el;
        }
      }
      if (vm._isMounted) {
        callHook(vm, 'updated');
      }
    };

    Vue.prototype._updateFromParent = function (propsData, listeners, parentVnode, renderChildren) {
      var vm = this;
      vm.$options._parentVnode = parentVnode;
      vm.$options._renderChildren = renderChildren;
      // update props
      if (propsData && vm.$options.props) {
        observerState.shouldConvert = false;
        if ("development" !== 'production') {
          observerState.isSettingProps = true;
        }
        var propKeys = vm.$options._propKeys || [];
        for (var i = 0; i < propKeys.length; i++) {
          var key = propKeys[i];
          vm[key] = validateProp(vm, key, propsData);
        }
        observerState.shouldConvert = true;
        if ("development" !== 'production') {
          observerState.isSettingProps = false;
        }
      }
      // update listeners
      if (listeners) {
        var oldListeners = vm.$options._parentListeners;
        vm.$options._parentListeners = listeners;
        vm._updateListeners(listeners, oldListeners);
      }
    };

    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
      if (vm._watchers.length) {
        for (var i = 0; i < vm._watchers.length; i++) {
          vm._watchers[i].update(true /* shallow */);
        }
      }
    };

    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return;
      }
      callHook(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // remove self from parent
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options._abstract) {
        remove(parent.$children, vm);
      }
      // teardown watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      // call the last hook...
      vm._isDestroyed = true;
      callHook(vm, 'destroyed');
      // turn off all instance listeners.
      vm.$off();
    };
  }

  function callHook(vm, hook) {
    vm.$emit('pre-hook:' + hook);
    var handlers = vm.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(vm);
      }
    }
    vm.$emit('hook:' + hook);
  }

  var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy };
  var hooksToMerge = Object.keys(hooks);

  function createComponent(Ctor, data, parent, context, tag) {
    if (!Ctor) {
      return;
    }
    if (isObject(Ctor)) {
      Ctor = Vue.extend(Ctor);
    }
    if (typeof Ctor !== 'function') {
      if ("development" !== 'production') {
        warn('Invalid Component definition: ' + Ctor, parent);
      }
      return;
    }

    // async component
    if (!Ctor.cid) {
      if (Ctor.resolved) {
        Ctor = Ctor.resolved;
      } else {
        Ctor = resolveAsyncComponent(Ctor, function () {
          // it's ok to queue this on every render because
          // $forceUpdate is buffered. this is only called
          // if the
          parent.$forceUpdate();
        });
        if (!Ctor) {
          // return nothing if this is indeed an async component
          // wait for the callback to trigger parent update.
          return;
        }
      }
    }

    data = data || {};

    // merge component management hooks onto the placeholder node
    mergeHooks(data);

    // extract props
    var propsData = extractProps(data, Ctor);

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    var listeners = data.on;
    if (listeners) {
      delete data.on;
    }

    // return a placeholder vnode
    var name = Ctor.options.name || tag;
    var vnode = new VNode('vue-component-' + Ctor.cid + (name ? '-' + name : ''), data, undefined, undefined, undefined, undefined, context, { Ctor: Ctor, propsData: propsData, listeners: listeners, parent: parent, tag: tag, children: undefined }
    // children to be set later by renderElementWithChildren,
    // but before the init hook
    );
    return vnode;
  }

  function createComponentInstanceForVnode(vnode // we know it's MountedComponentVNode but flow doesn't
  ) {
    var vnodeComponentOptions = vnode.componentOptions;
    var options = {
      _isComponent: true,
      parent: vnodeComponentOptions.parent,
      propsData: vnodeComponentOptions.propsData,
      _componentTag: vnodeComponentOptions.tag,
      _parentVnode: vnode,
      _parentListeners: vnodeComponentOptions.listeners,
      _renderChildren: vnodeComponentOptions.children
    };
    // check inline-template render functions
    var inlineTemplate = vnode.data.inlineTemplate;
    if (inlineTemplate) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnodeComponentOptions.Ctor(options);
  }

  function init(vnode, hydrating) {
    if (!vnode.child) {
      var child = vnode.child = createComponentInstanceForVnode(vnode);
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  }

  function prepatch(oldVnode, vnode) {
    var options = vnode.componentOptions;
    vnode.child = oldVnode.child;
    vnode.child._updateFromParent(options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
    );
  }

  function insert(vnode) {
    if (!vnode.child._isMounted) {
      vnode.child._isMounted = true;
      callHook(vnode.child, 'mounted');
    }
    if (vnode.data.keepAlive) {
      callHook(vnode.child, 'activated');
    }
  }

  function destroy(vnode) {
    if (!vnode.child._isDestroyed) {
      if (!vnode.data.keepAlive) {
        vnode.child.$destroy();
      } else {
        callHook(vnode.child, 'deactivated');
      }
    }
  }

  function resolveAsyncComponent(factory, cb) {
    if (factory.requested) {
      // pool callbacks
      factory.pendingCallbacks.push(cb);
    } else {
      var _ret = function () {
        factory.requested = true;
        var cbs = factory.pendingCallbacks = [cb];
        var sync = true;
        factory(
        // resolve
        function (res) {
          if (isObject(res)) {
            res = Vue.extend(res);
          }
          // cache resolved
          factory.resolved = res;
          // invoke callbacks only if this is not a synchronous resolve
          // (async resolves are shimmed as synchronous during SSR)
          if (!sync) {
            for (var i = 0, l = cbs.length; i < l; i++) {
              cbs[i](res);
            }
          }
        },
        // reject
        function (reason) {
          "development" !== 'production' && warn('Failed to resolve async component: ' + factory + (reason ? '\nReason: ' + reason : ''));
        });
        sync = false;
        // return in case resolved synchronously
        return {
          v: factory.resolved
        };
      }();

      if (typeof _ret === "object") return _ret.v;
    }
  }

  function extractProps(data, Ctor) {
    // we are only extrating raw values here.
    // validation and default values are handled in the child
    // component itself.
    var propOptions = Ctor.options.props;
    if (!propOptions) {
      return;
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    var staticAttrs = data.staticAttrs;
    if (!attrs && !props && !staticAttrs) {
      return res;
    }
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      checkProp(res, attrs, key, altKey) || checkProp(res, props, key, altKey) || checkProp(res, staticAttrs, key, altKey);
    }
    return res;
  }

  function checkProp(res, hash, key, altKey) {
    if (hash) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        delete hash[key];
        return true;
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        delete hash[altKey];
        return true;
      }
    }
    return false;
  }

  function mergeHooks(data) {
    if (data.hook) {
      for (var i = 0; i < hooksToMerge.length; i++) {
        var key = hooksToMerge[i];
        var fromParent = data.hook[key];
        var ours = hooks[key];
        data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
      }
    } else {
      data.hook = hooks;
    }
  }

  function mergeHook$1(a, b) {
    // since all hooks have at most two args, use fixed args
    // to avoid having to use fn.apply().
    return function (_, __) {
      a(_, __);
      b(_, __);
    };
  }

  function renderElementWithChildren(vnode, children) {
    if (vnode) {
      if (vnode.componentOptions) {
        if ("development" !== 'production' && children && typeof children !== 'function') {
          warn('A component\'s children should be a function that returns the ' + 'children array. This allows the component to track the children ' + 'dependencies and optimizes re-rendering.');
        }
        vnode.componentOptions.children = children;
      } else {
        vnode.setChildren(normalizeChildren(children));
      }
    }
    return vnode;
  }

  function renderElement(tag, data, namespace) {
    // make sure to expose real self instead of proxy
    var context = this._self;
    var parent = renderState.activeInstance;
    if (!parent) {
      "development" !== 'production' && warn('createElement cannot be called outside of component ' + 'render functions.');
      return;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return emptyVNode();
    }
    if (typeof tag === 'string') {
      var Ctor = void 0;
      if (config.isReservedTag(tag)) {
        return new VNode(tag, data, undefined, undefined, undefined, namespace, context);
      } else if (Ctor = resolveAsset(context.$options, 'components', tag)) {
        return createComponent(Ctor, data, parent, context, tag);
      } else {
        if ("development" !== 'production') {
          if (!namespace && config.isUnknownElement(tag)) {
            warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.');
          }
        }
        return new VNode(tag, data, undefined, undefined, undefined, namespace, context);
      }
    } else {
      return createComponent(tag, data, parent, context);
    }
  }

  function renderText(str) {
    return str || '';
  }

  function renderStatic(index) {
    return this._staticTrees[index];
  }

  var renderState = {
    activeInstance: null
  };

  function initRender(vm) {
    vm._vnode = null;
    vm._staticTrees = null;
    vm.$slots = {};
    // bind the public createElement fn to this instance
    // so that we get proper render context inside it.
    vm.$createElement = bind(function (tag, data, children, namespace) {
      return this._h(this._e(tag, data, namespace), children);
    }, vm);
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }

  function renderMixin(Vue) {
    Vue.prototype.$nextTick = function (fn) {
      nextTick(fn, this);
    };

    Vue.prototype._render = function () {
      var vm = this;

      // set current active instance
      var prev = renderState.activeInstance;
      renderState.activeInstance = vm;

      var _vm$$options = vm.$options;
      var render = _vm$$options.render;
      var staticRenderFns = _vm$$options.staticRenderFns;
      var _renderChildren = _vm$$options._renderChildren;
      var _parentVnode = _vm$$options._parentVnode;


      if (staticRenderFns && !vm._staticTrees) {
        // render static sub-trees for once on initial render
        renderStaticTrees(vm, staticRenderFns);
      }
      // resolve slots. becaues slots are rendered in parent scope,
      // we set the activeInstance to parent.
      if (_renderChildren) {
        resolveSlots(vm, _renderChildren);
      }
      // render self
      var vnode = render.call(vm._renderProxy);
      // return empty vnode in case the render function errored out
      if (!(vnode instanceof VNode)) {
        if ("development" !== 'production' && Array.isArray(vnode)) {
          warn('Multiple root nodes returned from render function. Render function ' + 'should return a single root node.', vm);
        }
        vnode = emptyVNode();
      }
      // set parent
      vnode.parent = _parentVnode;
      // restore render state
      renderState.activeInstance = prev;
      return vnode;
    };

    // shorthands used in render functions
    Vue.prototype._h = renderElementWithChildren;
    Vue.prototype._e = renderElement;
    Vue.prototype._t = renderText;
    Vue.prototype._m = renderStatic;

    // toString for mustaches
    Vue.prototype._s = renderString;

    // filter resolution helper
    var identity = function identity(_) {
      return _;
    };
    Vue.prototype._f = function (id) {
      return resolveAsset(this.$options, 'filters', id, true) || identity;
    };

    // render v-for
    Vue.prototype._l = function (val, render) {
      var ret = void 0,
          i = void 0,
          l = void 0,
          keys = void 0,
          key = void 0;
      if (Array.isArray(val)) {
        ret = new Array(val.length);
        for (i = 0, l = val.length; i < l; i++) {
          ret[i] = render(val[i], i, i);
        }
      } else if (typeof val === 'number') {
        ret = new Array(val);
        for (i = 0; i < val; i++) {
          ret[i] = render(i + 1, i, i);
        }
      } else if (isObject(val)) {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], i, key);
        }
      }
      return ret;
    };

    // apply v-bind object
    Vue.prototype._b = function (vnode, value) {
      if (value) {
        if (!isObject(value)) {
          "development" !== 'production' && warn('v-bind without argument expects an Object or Array value', this);
        } else {
          if (Array.isArray(value)) {
            value = toObject(value);
          }
          var data = vnode.data;
          for (var key in value) {
            var hash = config.mustUseProp(key) ? data.props || (data.props = {}) : data.attrs || (data.attrs = {});
            hash[key] = value[key];
          }
        }
      }
    };
  }

  function renderStaticTrees(vm, fns) {
    var trees = vm._staticTrees = new Array(fns.length);
    for (var i = 0; i < fns.length; i++) {
      trees[i] = fns[i].call(vm._renderProxy);
    }
  }

  function resolveSlots(vm, renderChildren) {
    if (renderChildren) {
      var children = normalizeChildren(renderChildren);
      var slots = {};
      var defaultSlot = [];
      var name = void 0,
          child = void 0;
      for (var i = 0, l = children.length; i < l; i++) {
        child = children[i];
        if (name = child.data && child.data.slot) {
          var slot = slots[name] || (slots[name] = []);
          if (child.tag === 'template') {
            slot.push.apply(slot, child.children);
          } else {
            slot.push(child);
          }
        } else {
          defaultSlot.push(child);
        }
      }
      if (defaultSlot.length && !(defaultSlot.length === 1 && defaultSlot[0].text === ' ')) {
        slots['default'] = defaultSlot;
      }
      vm.$slots = slots;
    }
  }

  function initEvents(vm) {
    vm._events = Object.create(null);
    // init parent attached events
    var listeners = vm.$options._parentListeners;
    var on = bind(vm.$on, vm);
    var off = bind(vm.$off, vm);
    vm._updateListeners = function (listeners, oldListeners) {
      updateListeners(listeners, oldListeners || {}, on, off);
    };
    if (listeners) {
      vm._updateListeners(listeners);
    }
  }

  function eventsMixin(Vue) {
    Vue.prototype.$on = function (event, fn) {
      var vm = this;(vm._events[event] || (vm._events[event] = [])).push(fn);
      return vm;
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on() {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm;
    };

    Vue.prototype.$off = function (event, fn) {
      var vm = this;
      // all
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm;
      }
      // specific event
      var cbs = vm._events[event];
      if (!cbs) {
        return vm;
      }
      if (arguments.length === 1) {
        vm._events[event] = null;
        return vm;
      }
      // specific handler
      var cb = void 0;
      var i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break;
        }
      }
      return vm;
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1);
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i].apply(vm, args);
        }
      }
      return vm;
    };
  }

  var uid = 0;

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid++;
      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
      } else {
        vm.$options = mergeOptions(vm.constructor.options, options || {}, vm);
      }
      /* istanbul ignore else */
      if ("development" !== 'production') {
        initProxy(vm);
      } else {}
      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      callHook(vm, 'init');
      initState(vm);
      callHook(vm, 'created');
      initRender(vm);
    };
  }

  function initInternalComponent(vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    opts.parent = options.parent;
    opts.propsData = options.propsData;
    opts._parentVnode = options._parentVnode;
    opts._parentListeners = options._parentListeners;
    opts._renderChildren = options._renderChildren;
    opts._componentTag = options._componentTag;
    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = opts.staticRenderFns;
    }
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  var warn = void 0;
  var formatComponentName = void 0;

  if ("development" !== 'production') {
    (function () {
      var hasConsole = typeof console !== 'undefined';

      warn = function warn(msg, vm) {
        if (hasConsole && !config.silent) {
          console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
        }
      };

      formatComponentName = function formatComponentName(vm) {
        if (vm.$root === vm) {
          return ' (found in root instance)';
        }
        var name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
        return name ? ' (found in component: <' + hyphenate(name) + '>)' : ' (found in anonymous component. Use the "name" option for better debugging messages)';
      };
    })();
  }

  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats = config.optionMergeStrategies;

  /**
   * Options with restrictions
   */
  if ("development" !== 'production') {
    strats.el = strats.propsData = function (parent, child, vm, key) {
      if (!vm) {
        warn('option "' + key + '" can only be used during instance ' + 'creation with the `new` keyword.');
      }
      return defaultStrat(parent, child);
    };

    strats.name = function (parent, child, vm) {
      if (vm) {
        warn('options "name" can only be used as a component definition option, ' + 'not during instance creation.');
      }
      return defaultStrat(parent, child);
    };
  }

  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData(to, from) {
    var key = void 0,
        toVal = void 0,
        fromVal = void 0;
    for (key in from) {
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn(to, key)) {
        set(to, key, fromVal);
      } else if (isObject(toVal) && isObject(fromVal)) {
        mergeData(toVal, fromVal);
      }
    }
    return to;
  }

  /**
   * Data
   */
  strats.data = function (parentVal, childVal, vm) {
    if (!vm) {
      // in a Vue.extend merge, both should be functions
      if (!childVal) {
        return parentVal;
      }
      if (typeof childVal !== 'function') {
        "development" !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
        return parentVal;
      }
      if (!parentVal) {
        return childVal;
      }
      // when parentVal & childVal are both present,
      // we need to return a function that returns the
      // merged result of both functions... no need to
      // check if parentVal is a function here because
      // it has to be a function to pass previous merges.
      return function mergedDataFn() {
        return mergeData(childVal.call(this), parentVal.call(this));
      };
    } else if (parentVal || childVal) {
      return function mergedInstanceDataFn() {
        // instance merge
        var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
        var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
        if (instanceData) {
          return mergeData(instanceData, defaultData);
        } else {
          return defaultData;
        }
      };
    }
  };

  /**
   * Hooks and param attributes are merged as arrays.
   */
  function mergeHook(parentVal, childVal) {
    return childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal] : parentVal;
  }

  config._lifecycleHooks.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets(parentVal, childVal) {
    var res = Object.create(parentVal || null);
    return childVal ? extend(res, childVal) : res;
  }

  config._assetTypes.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
  });

  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats.watch = function (parentVal, childVal) {
    /* istanbul ignore if */
    if (!childVal) return parentVal;
    if (!parentVal) return childVal;
    var ret = {};
    extend(ret, parentVal);
    for (var key in childVal) {
      var parent = ret[key];
      var child = childVal[key];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key] = parent ? parent.concat(child) : [child];
    }
    return ret;
  };

  /**
   * Other object hashes.
   */
  strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
    if (!childVal) return parentVal;
    if (!parentVal) return childVal;
    var ret = Object.create(null);
    extend(ret, parentVal);
    extend(ret, childVal);
    return ret;
  };

  /**
   * Default strategy.
   */
  var defaultStrat = function defaultStrat(parentVal, childVal) {
    return childVal === undefined ? parentVal : childVal;
  };

  /**
   * Make sure component options get converted to actual
   * constructors.
   */
  function normalizeComponents(options) {
    if (options.components) {
      var components = options.components;
      var def = void 0;
      for (var key in components) {
        if (isBuiltInTag(key) || config.isReservedTag(key)) {
          "development" !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
          continue;
        }
        def = components[key];
        if (isPlainObject(def)) {
          components[key] = Vue.extend(def);
        }
      }
    }
  }

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps(options) {
    var props = options.props;
    if (!props) return;
    var res = {};
    var i = void 0,
        val = void 0,
        name = void 0;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        } else if ("development" !== 'production') {
          warn('props must be strings when using array syntax.');
        }
      }
    } else if (isPlainObject(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val) ? val : { type: val };
      }
    }
    options.props = res;
  }

  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives(options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def = dirs[key];
        if (typeof def === 'function') {
          dirs[key] = { bind: def, update: def };
        }
      }
    }
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions(parent, child, vm) {
    normalizeComponents(child);
    normalizeProps(child);
    normalizeDirectives(child);
    var extendsFrom = child.extends;
    if (extendsFrom) {
      parent = typeof extendsFrom === 'function' ? mergeOptions(parent, extendsFrom.options, vm) : mergeOptions(parent, extendsFrom, vm);
    }
    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        var mixin = child.mixins[i];
        if (mixin.prototype instanceof Vue) {
          mixin = mixin.options;
        }
        parent = mergeOptions(parent, mixin, vm);
      }
    }
    var options = {};
    var key = void 0;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField(key) {
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options;
  }

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset(options, type, id, warnMissing) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return;
    }
    var assets = options[type];
    var res = assets[id] ||
    // camelCase ID
    assets[camelize(id)] ||
    // Pascal Case ID
    assets[capitalize(camelize(id))];
    if ("development" !== 'production' && warnMissing && !res) {
      warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
    }
    return res;
  }

  function validateProp(vm, key, propsData) {
    /* istanbul ignore if */
    if (!vm.$options.props || !propsData) return;
    var prop = vm.$options.props[key];
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    // handle boolean props
    if (prop.type === Boolean) {
      if (absent && !hasOwn(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        value = true;
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      observerState.shouldConvert = true;
      observe(value);
      observerState.shouldConvert = false;
    }
    if ("development" !== 'production') {
      assertProp(prop, key, value, vm, absent);
    }
    return value;
  }

  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue(vm, prop, name) {
    // no default, return undefined
    if (!hasOwn(prop, 'default')) {
      return undefined;
    }
    var def = prop.default;
    // warn against non-factory defaults for Object & Array
    if (isObject(def)) {
      "development" !== 'production' && warn('Invalid default value for prop "' + name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
    }
    // call factory function for non-Function types
    return typeof def === 'function' && prop.type !== Function ? def.call(vm) : def;
  }

  /**
   * Assert whether a prop is valid.
   */
  function assertProp(prop, name, value, vm, absent) {
    if (prop.required && absent) {
      warn('Missing required prop: "' + name + '"', vm);
      return;
    }
    if (value == null && !prop.required) {
      return;
    }
    var type = prop.type;
    var valid = !type;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType(value, type[i]);
        expectedTypes.push(assertedType.expectedType);
        valid = assertedType.valid;
      }
    }
    if (!valid) {
      warn('Invalid prop: type check failed for prop "' + name + '".' + ' Expected ' + expectedTypes.map(capitalize).join(', ') + ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.', vm);
      return;
    }
    var validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
      }
    }
  }

  /**
   * Assert the type of a value
   */
  function assertType(value, type) {
    var valid = void 0;
    var expectedType = void 0;
    if (type === String) {
      expectedType = 'string';
      valid = typeof value === expectedType;
    } else if (type === Number) {
      expectedType = 'number';
      valid = typeof value === expectedType;
    } else if (type === Boolean) {
      expectedType = 'boolean';
      valid = typeof value === expectedType;
    } else if (type === Function) {
      expectedType = 'function';
      valid = typeof value === expectedType;
    } else if (type === Object) {
      expectedType = 'Object';
      valid = isPlainObject(value);
    } else if (type === Array) {
      expectedType = 'Array';
      valid = Array.isArray(value);
    } else {
      expectedType = type.name || type.toString();
      valid = value instanceof type;
    }
    return {
      valid: valid,
      expectedType: expectedType
    };
  }



  var util = Object.freeze({
  	defineReactive: defineReactive,
  	renderString: renderString,
  	makeMap: makeMap,
  	isBuiltInTag: isBuiltInTag,
  	remove: remove,
  	hasOwn: hasOwn,
  	isPrimitive: isPrimitive,
  	cached: cached,
  	camelize: camelize,
  	capitalize: capitalize,
  	hyphenate: hyphenate,
  	bind: bind,
  	toArray: toArray,
  	extend: extend,
  	isObject: isObject,
  	isPlainObject: isPlainObject,
  	toObject: toObject,
  	noop: noop,
  	no: no,
  	genStaticKeys: genStaticKeys,
  	isReserved: isReserved,
  	def: def,
  	parsePath: parsePath,
  	hasProto: hasProto,
  	inBrowser: inBrowser,
  	devtools: devtools,
  	nextTick: nextTick,
  	get _Set () { return Set$1; },
  	mergeOptions: mergeOptions,
  	resolveAsset: resolveAsset,
  	get warn () { return warn; },
  	validateProp: validateProp
  });

  function initUse(Vue) {
    Vue.use = function (plugin) {
      /* istanbul ignore if */
      if (plugin.installed) {
        return;
      }
      // additional parameters
      var args = toArray(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
      } else {
        plugin.apply(null, args);
      }
      plugin.installed = true;
      return this;
    };
  }

  function initMixin$1(Vue) {
    Vue.mixin = function (mixin) {
      Vue.options = mergeOptions(Vue.options, mixin);
      // update constructors that are already created
      config._ctors.forEach(function (Ctor) {
        Ctor.options = mergeOptions(Ctor['super'].options, Ctor.extendOptions);
      });
    };
  }

  function initExtend(Vue) {
    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     */
    Vue.cid = 0;
    var cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var isFirstExtend = Super.cid === 0;
      if (isFirstExtend && extendOptions._Ctor) {
        return extendOptions._Ctor;
      }
      var name = extendOptions.name || Super.options.name;
      if ("development" !== 'production') {
        if (!/^[a-zA-Z][\w-]*$/.test(name)) {
          warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
          name = null;
        }
      }
      var Sub = function VueComponent(options) {
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(Super.options, extendOptions);
      Sub['super'] = Super;
      // allow further extension
      Sub.extend = Super.extend;
      // create asset registers, so extended classes
      // can have their private assets too.
      config._assetTypes.forEach(function (type) {
        Sub[type] = Super[type];
      });
      // enable recursive self-lookup
      if (name) {
        Sub.options.components[name] = Sub;
      }
      // book-keeping for global mixin edge cases. also expose a way to remove it
      Sub.extendOptions = extendOptions;
      config._ctors.push(Sub);
      Sub.release = function () {
        remove(config._ctors, Sub);
      };
      // cache constructor
      if (isFirstExtend) {
        extendOptions._Ctor = Sub;
      }
      return Sub;
    };
  }

  function initAssetRegisters(Vue) {
    /**
     * Create asset registration methods.
     */
    config._assetTypes.forEach(function (type) {
      Vue[type] = function (id, definition) {
        if (!definition) {
          return this.options[type + 's'][id];
        } else {
          /* istanbul ignore if */
          if ("development" !== 'production') {
            if (type === 'component' && config.isReservedTag(id)) {
              warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
            }
          }
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            definition = Vue.extend(definition);
          }
          this.options[type + 's'][id] = definition;
          return definition;
        }
      };
    });
  }

  var KeepAlive = {
    name: 'keep-alive',
    _abstract: true,
    props: {
      child: Object
    },
    created: function created() {
      this.cache = Object.create(null);
    },
    render: function render() {
      var rawChild = this.child;
      var realChild = getRealChild(this.child);
      var cid = realChild.componentOptions.Ctor.cid;
      if (this.cache[cid]) {
        var child = realChild.child = this.cache[cid].child;
        realChild.elm = this.$el = child.$el;
      } else {
        this.cache[cid] = realChild;
      }
      realChild.data.keepAlive = true;
      return rawChild;
    },
    destroyed: function destroyed() {
      for (var key in this.cache) {
        var vnode = this.cache[key];
        callHook(vnode.child, 'deactivated');
        vnode.child.$destroy();
      }
    }
  };

  // in case the child is also an abstract component, e.g. <transition-control>
  // we want to recrusively retrieve the real component to be rendered
  function getRealChild(vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options._abstract) {
      return getRealChild(compOptions.propsData.child);
    } else {
      return vnode;
    }
  }

  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  function initGlobalAPI(Vue) {
    Vue.config = config;
    Vue.util = util;
    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;

    Vue.options = Object.create(null);
    config._assetTypes.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    extend(Vue.options.components, builtInComponents);

    initUse(Vue);
    initMixin$1(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);
  }

  initGlobalAPI(Vue);

  Object.defineProperty(Vue.prototype, '$isServer', {
    get: function get() {
      return config._isServer;
    }
  });

  Vue.version = '2.0.0-alpha.1';

  // attributes that should be using props for binding
  var mustUseProp = makeMap('value,selected,checked,muted');

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');

  var xlinkNS = 'http://www.w3.org/1999/xlink';

  var isXlink = function isXlink(name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
  };

  var getXlinkProp = function getXlinkProp(name) {
    return isXlink(name) ? name.slice(6, name.length) : '';
  };

  var isFalsyAttrValue = function isFalsyAttrValue(val) {
    return val == null || val === false;
  };

  function genClassForVnode(vnode) {
    var data = vnode.data;
    // Important: check if this is a component container node
    // or a child component root node
    var i = void 0;
    if ((i = vnode.child) && (i = i._vnode.data)) {
      data = mergeClassData(i, data);
    }
    if ((i = vnode.parent) && (i = i.data)) {
      data = mergeClassData(data, i);
    }
    return genClassFromData(data);
  }

  function mergeClassData(child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: child.class ? [child.class, parent.class] : parent.class
    };
  }

  function genClassFromData(data) {
    var dynamicClass = data.class;
    var staticClass = data.staticClass;
    if (staticClass || dynamicClass) {
      return concat(staticClass, stringifyClass(dynamicClass));
    }
    /* istanbul ignore next */
    return '';
  }

  function concat(a, b) {
    return a ? b ? a + ' ' + b : a : b || '';
  }

  function stringifyClass(value) {
    var res = '';
    if (!value) {
      return res;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      var stringified = void 0;
      for (var i = 0, l = value.length; i < l; i++) {
        if (value[i]) {
          if (stringified = stringifyClass(value[i])) {
            res += stringified + ' ';
          }
        }
      }
      return res.slice(0, -1);
    }
    if (isObject(value)) {
      for (var key in value) {
        if (value[key]) res += key + ' ';
      }
      return res.slice(0, -1);
    }
    /* istanbul ignore next */
    return res;
  }

  var namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isReservedTag = makeMap('html,base,head,link,meta,style,title,' + 'address,article,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template');

  var isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr', true);

  // Elements that you can, intentionally, leave open
  // (and which close themselves)
  var canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source', true);

  // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
  // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
  var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track', true);

  // this map covers namespace elements that can appear as template root nodes
  var isSVG = makeMap('svg,g,defs,symbol,use,image,text,circle,ellipse,' + 'line,path,polygon,polyline,rect', true);

  function getTagNamespace(tag) {
    if (isSVG(tag)) {
      return 'svg';
    }
    // basic support for MathML
    // note it doesn't support other MathML elements being component roots
    if (tag === 'math') {
      return 'math';
    }
  }

  var unknownElementCache = Object.create(null);
  function isUnknownElement(tag) {
    /* istanbul ignore if */
    if (!inBrowser) {
      return true;
    }
    tag = tag.toLowerCase();
    /* istanbul ignore if */
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag];
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return unknownElementCache[tag] = el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
    } else {
      return unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()) &&
      // Chrome returns unknown for several HTML5 elements.
      // https://code.google.com/p/chromium/issues/detail?id=540526
      !/^(data|time|rtc|rb)$/.test(tag);
    }
  }

  var UA$1 = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA$1 && /msie|trident/.test(UA$1);
  var isIE9 = UA$1 && UA$1.indexOf('msie 9.0') > 0;
  var isAndroid = UA$1 && UA$1.indexOf('android') > 0;

  /**
   * Query an element selector if it's not an element already.
   */
  function query(el) {
    if (typeof el === 'string') {
      var selector = el;
      el = document.querySelector(el);
      if (!el) {
        "development" !== 'production' && warn('Cannot find element: ' + selector);
        return document.createElement('div');
      }
    }
    return el;
  }

  function createElement(tagName) {
    return document.createElement(tagName);
  }

  function createElementNS(namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName);
  }

  function createTextNode(text) {
    return document.createTextNode(text);
  }

  function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild(node, child) {
    node.removeChild(child);
  }

  function appendChild(node, child) {
    node.appendChild(child);
  }

  function parentNode(node) {
    return node.parentNode;
  }

  function nextSibling(node) {
    return node.nextSibling;
  }

  function tagName(node) {
    return node.tagName;
  }

  function setTextContent(node, text) {
    node.textContent = text;
  }

  function childNodes(node) {
    return node.childNodes;
  }

  function setAttribute(node, key, val) {
    node.setAttribute(key, val);
  }

var nodeOps = Object.freeze({
    createElement: createElement,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    childNodes: childNodes,
    setAttribute: setAttribute
  });

  var emptyNode = new VNode('', {}, []);
  var hooks$1 = ['create', 'update', 'postpatch', 'remove', 'destroy'];

  function isUndef(s) {
    return s == null;
  }

  function isDef(s) {
    return s != null;
  }

  function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.tag === vnode2.tag;
  }

  function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i = void 0,
        key = void 0;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) map[key] = i;
    }
    return map;
  }

  function createPatchFunction(backend) {
    var i = void 0,
        j = void 0;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;


    for (i = 0; i < hooks$1.length; ++i) {
      cbs[hooks$1[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (modules[j][hooks$1[i]] !== undefined) cbs[hooks$1[i]].push(modules[j][hooks$1[i]]);
      }
    }

    function emptyNodeAt(elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
    }

    function createRmCb(childElm, listeners) {
      function remove() {
        if (--remove.listeners === 0) {
          removeElement(childElm);
        }
      }
      remove.listeners = listeners;
      return remove;
    }

    function removeElement(el) {
      var parent = nodeOps.parentNode(el);
      nodeOps.removeChild(parent, el);
    }

    function createElm(vnode, insertedVnodeQueue) {
      var i = void 0,
          elm = void 0;
      var data = vnode.data;
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
        // after calling the init hook, if the vnode is a child component
        // it should've created a child instance and mounted it. the child
        // component also has set the placeholder vnode's elm.
        // in that case we can just return the element and be done.
        if (isDef(i = vnode.child)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
          setScope(vnode);
          return vnode.elm;
        }
      }
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef(tag)) {
        elm = vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag);
        setScope(vnode);
        if (Array.isArray(children)) {
          for (i = 0; i < children.length; ++i) {
            nodeOps.appendChild(elm, createElm(children[i], insertedVnodeQueue));
          }
        } else if (isPrimitive(vnode.text)) {
          nodeOps.appendChild(elm, nodeOps.createTextNode(vnode.text));
        }
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
      } else {
        elm = vnode.elm = nodeOps.createTextNode(vnode.text);
      }
      return vnode.elm;
    }

    function invokeCreateHooks(vnode, insertedVnodeQueue) {
      for (var _i = 0; _i < cbs.create.length; ++_i) {
        cbs.create[_i](emptyNode, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope(vnode) {
      var i = void 0;
      if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
        nodeOps.setAttribute(vnode.elm, i, '');
      }
    }

    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        nodeOps.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
      }
    }

    function invokeDestroyHook(vnode) {
      var i = void 0,
          j = void 0;
      var data = vnode.data;
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
        for (i = 0; i < cbs.destroy.length; ++i) {
          cbs.destroy[i](vnode);
        }
      }
      if (isDef(i = vnode.child)) {
        invokeDestroyHook(i._vnode);
      }
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            invokeDestroyHook(ch);
            removeAndInvokeRemoveHook(ch);
          } else {
            // Text node
            nodeOps.removeChild(parentElm, ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook(vnode, rm) {
      if (rm || isDef(vnode.data)) {
        var listeners = cbs.remove.length + 1;
        if (!rm) {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        } else {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.child) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeElement(vnode.elm);
      }
    }

    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
      var oldStartIdx = 0;
      var newStartIdx = 0;
      var oldEndIdx = oldCh.length - 1;
      var oldStartVnode = oldCh[0];
      var oldEndVnode = oldCh[oldEndIdx];
      var newEndIdx = newCh.length - 1;
      var newStartVnode = newCh[0];
      var newEndVnode = newCh[newEndIdx];
      var oldKeyToIdx = void 0,
          idxInOld = void 0,
          elmToMove = void 0,
          before = void 0;

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef(oldEndVnode)) {
            oldEndVnode = oldCh[--oldEndIdx];
          } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
          } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
          } else if (sameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
            nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
          } else if (sameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
            nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
          } else {
            if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            idxInOld = oldKeyToIdx[newStartVnode.key];
            if (isUndef(idxInOld)) {
              // New element
              nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
              newStartVnode = newCh[++newStartIdx];
            } else {
              elmToMove = oldCh[idxInOld];
              /* istanbul ignore if */
              if ("development" !== 'production' && !elmToMove) {
                warn('It seems there are duplicate keys that is causing an update error. ' + 'Make sure each v-for item has a unique key.');
              }
              if (elmToMove.tag !== newStartVnode.tag) {
                // same key but different element. treat as new element
                nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                newStartVnode = newCh[++newStartIdx];
              } else {
                patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                oldCh[idxInOld] = undefined;
                nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
                newStartVnode = newCh[++newStartIdx];
              }
            }
          }
      }
      if (oldStartIdx > oldEndIdx) {
        before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
      if (oldVnode === vnode) return;
      var i = void 0,
          hook = void 0;
      if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
        i(oldVnode, vnode);
      }
      var elm = vnode.elm = oldVnode.elm;
      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef(vnode.data)) {
        for (i = 0; i < cbs.update.length; ++i) {
          cbs.update[i](oldVnode, vnode);
        }if (isDef(hook) && isDef(i = hook.update)) i(oldVnode, vnode);
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
        } else if (isDef(ch)) {
          if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(elm, oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(vnode.data)) {
        for (i = 0; i < cbs.postpatch.length; ++i) {
          cbs.postpatch[i](oldVnode, vnode);
        }if (isDef(hook) && isDef(i = hook.postpatch)) i(oldVnode, vnode);
      }
    }

    function invokeInsertHook(queue) {
      for (var _i2 = 0; _i2 < queue.length; ++_i2) {
        queue[_i2].data.hook.insert(queue[_i2]);
      }
    }

    function hydrate(elm, vnode, insertedVnodeQueue) {
      if ("development" !== 'production') {
        if (!assertNodeMatch(elm, vnode)) {
          return false;
        }
      }
      vnode.elm = elm;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;

      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */);
        if (isDef(i = vnode.child)) {
          // child component. it should have hydrated its own tree.
          invokeCreateHooks(vnode, insertedVnodeQueue);
          return true;
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          var childNodes = nodeOps.childNodes(elm);
          for (var _i3 = 0; _i3 < children.length; _i3++) {
            var success = hydrate(childNodes[_i3], children[_i3], insertedVnodeQueue);
            if (!success) {
              return false;
            }
          }
        }
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
      }
      return true;
    }

    function assertNodeMatch(node, vnode) {
      if (vnode.tag) {
        if (vnode.tag.indexOf('vue-component') === 0) {
          return true;
        } else {
          var childNodes = nodeOps.childNodes(node);
          return vnode.tag === nodeOps.tagName(node).toLowerCase() && (vnode.children ? vnode.children.length === childNodes.length : childNodes.length === 0);
        }
      } else {
        return renderString(vnode.text) === node.data;
      }
    }

    return function patch(oldVnode, vnode, hydrating) {
      var elm = void 0,
          parent = void 0;
      var insertedVnodeQueue = [];

      if (!oldVnode) {
        // empty mount, create new root element
        createElm(vnode, insertedVnodeQueue);
      } else {
        var isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          patchVnode(oldVnode, vnode, insertedVnodeQueue);
        } else {
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.hasAttribute('server-rendered')) {
              oldVnode.removeAttribute('server-rendered');
              hydrating = true;
            }
            if (hydrating) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(insertedVnodeQueue);
                return oldVnode;
              } else if ("development" !== 'production') {
                warn('The client-side rendered virtual DOM tree is not matching ' + 'server-rendered content. Bailing hydration and performing ' + 'full client-side render.');
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            oldVnode = emptyNodeAt(oldVnode);
          }
          elm = oldVnode.elm;
          parent = nodeOps.parentNode(elm);

          createElm(vnode, insertedVnodeQueue);

          if (parent !== null) {
            nodeOps.insertBefore(parent, vnode.elm, nodeOps.nextSibling(elm));
            removeVnodes(parent, [oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(insertedVnodeQueue);
      return vnode.elm;
    };
  }

  var directives = {
    create: function bindDirectives(oldVnode, vnode) {
      applyDirectives(oldVnode, vnode, 'bind');
    },
    update: function updateDirectives(oldVnode, vnode) {
      applyDirectives(oldVnode, vnode, 'update');
    },
    postpatch: function postupdateDirectives(oldVnode, vnode) {
      applyDirectives(oldVnode, vnode, 'postupdate');
    },
    destroy: function unbindDirectives(vnode) {
      applyDirectives(vnode, vnode, 'unbind');
    }
  };

  function applyDirectives(oldVnode, vnode, hook) {
    var dirs = vnode.data.directives;
    if (dirs) {
      var oldDirs = oldVnode.data.directives;
      var isUpdate = hook === 'update';
      for (var i = 0; i < dirs.length; i++) {
        var dir = dirs[i];
        var def = resolveAsset(vnode.context.$options, 'directives', dir.name, true);
        var fn = def && def[hook];
        if (fn) {
          // only call update if value has changed
          if (isUpdate && oldDirs) {
            var oldValue = dir.oldValue = oldDirs[i].value;
            if (oldValue === dir.value) {
              continue;
            }
          }
          fn(vnode.elm, dir, vnode, oldVnode);
        }
      }
    }
  }

  var ref = {
    create: function create(_, vnode) {
      registerRef(vnode, false);
    },
    destroy: function destroy(vnode) {
      registerRef(vnode, true);
    }
  };

  function registerRef(vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!key) return;

    var vm = vnode.context;
    var ref = vnode.child || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (Array.isArray(refs[key])) {
          refs[key].push(ref);
        } else {
          refs[key] = [ref];
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  var baseModules = [ref, directives];

  function updateAttrs(oldVnode, vnode) {
    if (!oldVnode.data.attrs && !vnode.data.attrs) {
      return;
    }
    var key = void 0,
        cur = void 0,
        old = void 0;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur);
      }
    }
    for (key in oldAttrs) {
      if (attrs[key] == null) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr(el, key, value) {
    if (isBooleanAttr(key)) {
      // set attribute for blank value
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, key);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  var attrs = {
    create: function create(_, vnode) {
      var attrs = vnode.data.staticAttrs;
      if (attrs) {
        for (var key in attrs) {
          setAttr(vnode.elm, key, attrs[key]);
        }
      }
      updateAttrs(_, vnode);
    },
    update: updateAttrs
  };

  function updateClass(oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    if (!data.staticClass && !data.class) {
      return;
    }

    var cls = genClassForVnode(vnode);

    // handle transition classes
    var transitionClass = el._transitionClasses;
    if (transitionClass) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    // set the class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  function updateDOMListeners(oldVnode, vnode) {
    if (!oldVnode.data.on && !vnode.data.on) {
      return;
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    var add = vnode.elm._v_add || (vnode.elm._v_add = function (event, handler, capture) {
      vnode.elm.addEventListener(event, handler, capture);
    });
    var remove = vnode.elm._v_remove || (vnode.elm._v_remove = function (event, handler) {
      vnode.elm.removeEventListener(event, handler);
    });
    updateListeners(on, oldOn, add, remove);
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };

  function updateProps(oldVnode, vnode) {
    if (!oldVnode.data.props && !vnode.data.props) {
      return;
    }
    var key = void 0,
        cur = void 0;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.props || {};
    var props = vnode.data.props || {};

    for (key in oldProps) {
      if (props[key] == null) {
        elm[key] = undefined;
      }
    }
    for (key in props) {
      cur = props[key];
      if (key === 'value') {
        // store value as _value as well since
        // non-string values will be stringified
        elm._value = cur;
        // avoid resetting cursor position when value is the same
        if (elm.value != cur) {
          // eslint-disable-line
          elm.value = cur;
        }
      } else {
        elm[key] = cur;
      }
    }
  }

  var props = {
    create: updateProps,
    update: updateProps
  };

  var prefixes = ['Webkit', 'Moz', 'ms'];

  var testEl = void 0;
  var normalize = cached(function (prop) {
    testEl = testEl || document.createElement('div');
    prop = camelize(prop);
    if (prop !== 'filter' && prop in testEl.style) {
      return prop;
    }
    var upper = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < prefixes.length; i++) {
      var prefixed = prefixes[i] + upper;
      if (prefixed in testEl.style) {
        return prefixed;
      }
    }
  });

  function updateStyle(oldVnode, vnode) {
    if (!oldVnode.data.style && !vnode.data.style) {
      return;
    }
    var cur = void 0,
        name = void 0;
    var elm = vnode.elm;
    var oldStyle = oldVnode.data.style || {};
    var style = vnode.data.style || {};

    // handle array syntax
    if (Array.isArray(style)) {
      style = vnode.data.style = toObject(style);
    }

    for (name in oldStyle) {
      if (!style[name]) {
        elm.style[normalize(name)] = '';
      }
    }
    for (name in style) {
      cur = style[name];
      if (cur !== oldStyle[name]) {
        // ie9 setting to null has no effect, must use empty string
        elm.style[normalize(name)] = cur || '';
      }
    }
    // clone the style for future updates,
    // in case the user mutates the style object in-place.
    vnode.data.style = extend({}, style);
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass(el, cls) {
    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(/\s+/).forEach(function (c) {
          return el.classList.add(c);
        });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = ' ' + el.getAttribute('class') + ' ';
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass(el, cls) {
    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(/\s+/).forEach(function (c) {
          return el.classList.remove(c);
        });
      } else {
        el.classList.remove(cls);
      }
    } else {
      var cur = ' ' + el.getAttribute('class') + ' ';
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      el.setAttribute('class', cur.trim());
    }
  }

  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  // Transition property/event sniffing
  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  var raf = inBrowser && window.requestAnimationFrame || setTimeout;
  function nextFrame(fn) {
    raf(function () {
      raf(fn);
    });
  }

  function enter(vnode) {
    var el = vnode.elm;
    // call leave callback now
    if (el._leaveCb) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }
    var data = vnode.data.transition;
    if (!data) {
      return;
    }
    var isAppear = !vnode.context.$root._isMounted;
    if (isAppear && !data.appear && data.appear !== '') {
      return;
    }

    var _resolveTransition = resolveTransition(data, vnode.context);

    var css = _resolveTransition.css;
    var enterClass = _resolveTransition.enterClass;
    var enterActiveClass = _resolveTransition.enterActiveClass;
    var appearClass = _resolveTransition.appearClass;
    var appearActiveClass = _resolveTransition.appearActiveClass;
    var beforeEnter = _resolveTransition.beforeEnter;
    var onEnter = _resolveTransition.onEnter;
    var afterEnter = _resolveTransition.afterEnter;
    var enterCancelled = _resolveTransition.enterCancelled;
    var beforeAppear = _resolveTransition.beforeAppear;
    var onAppear = _resolveTransition.onAppear;
    var afterAppear = _resolveTransition.afterAppear;
    var appearCancelled = _resolveTransition.appearCancelled;


    var startClass = isAppear ? appearClass : enterClass;
    var activeClass = isAppear ? appearActiveClass : enterActiveClass;
    var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
    var enterHook = isAppear ? onAppear || onEnter : onEnter;
    var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
    var enterCancelledHook = isAppear ? appearCancelled || enterCancelled : enterCancelled;

    var expectsCSS = css !== false;
    var userWantsControl = enterHook && enterHook.length > 1;
    var cb = el._enterCb = once(function () {
      if (expectsCSS) {
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, activeClass);
          if (!userWantsControl) {
            whenTransitionEnds(el, cb);
          }
        }
      });
    }
    enterHook && enterHook(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave(vnode, rm) {
    var el = vnode.elm;
    // call enter callback now
    if (el._enterCb) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }
    var data = vnode.data.transition;
    if (!data) {
      return rm();
    }

    var _resolveTransition2 = resolveTransition(data, vnode.context);

    var css = _resolveTransition2.css;
    var leaveClass = _resolveTransition2.leaveClass;
    var leaveActiveClass = _resolveTransition2.leaveActiveClass;
    var beforeLeave = _resolveTransition2.beforeLeave;
    var onLeave = _resolveTransition2.onLeave;
    var afterLeave = _resolveTransition2.afterLeave;
    var leaveCancelled = _resolveTransition2.leaveCancelled;
    var delayLeave = _resolveTransition2.delayLeave;


    var expectsCSS = css !== false;
    var userWantsControl = onLeave && onLeave.length > 1;
    var cb = el._leaveCb = once(function () {
      if (expectsCSS) {
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave() {
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveActiveClass);
            if (!userWantsControl) {
              whenTransitionEnds(el, cb);
            }
          }
        });
      }
      onLeave && onLeave(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  function resolveTransition(id, context) {
    var def = void 0;
    if (id && typeof id === 'string') {
      def = resolveAsset(context.$options, 'transitions', id);
      return def ? ensureTransitionClasses(def.name || id, def) : autoCssTransition(id);
    } else if (typeof id === 'object') {
      // inline transition object
      if (id.name) {
        def = resolveAsset(context.$options, 'transitions', id.name);
      }
      def = def ? extend(ensureTransitionClasses(id.name, def), id) : ensureTransitionClasses(id.name, id);
      // extra hooks to be merged
      // added by <transition-control>
      if (id.hooks) {
        for (var key in id.hooks) {
          mergeHook$2(def, key, id.hooks[key]);
        }
      }
      return def;
    } else {
      return autoCssTransition('v');
    }
  }

  function ensureTransitionClasses(name, def) {
    name = name || 'v';
    var res = {};
    if (def.css !== false) {
      extend(res, autoCssTransition(name));
    }
    extend(res, def);
    return res;
  }

  var autoCssTransition = cached(function (name) {
    return {
      enterClass: name + '-enter',
      leaveClass: name + '-leave',
      appearClass: name + '-enter',
      enterActiveClass: name + '-enter-active',
      leaveActiveClass: name + '-leave-active',
      appearActiveClass: name + '-enter-active'
    };
  });

  function mergeHook$2(def, key, hook) {
    var oldHook = def[key];
    if (oldHook) {
      def[key] = function () {
        oldHook.apply(this, arguments);
        hook();
      };
    } else {
      def[key] = hook;
    }
  }

  function addTransitionClass(el, cls) {
    (el._transitionClasses || (el._transitionClasses = [])).push(cls);
    addClass(el, cls);
  }

  function removeTransitionClass(el, cls) {
    remove(el._transitionClasses, cls);
    removeClass(el, cls);
  }

  function whenTransitionEnds(el, cb) {
    var _getTransitionInfo = getTransitionInfo(el);

    var type = _getTransitionInfo.type;
    var timeout = _getTransitionInfo.timeout;
    var propCount = _getTransitionInfo.propCount;

    if (!type) return cb();
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function end() {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function onEnd() {
      if (++ended >= propCount) {
        end();
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  function getTransitionInfo(el) {
    var styles = window.getComputedStyle(el);
    // 1. determine the maximum duration (timeout)
    var transitioneDelays = styles[transitionProp + 'Delay'].split(', ');
    var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
    var animationDelays = styles[animationProp + 'Delay'].split(', ');
    var animationDurations = styles[animationProp + 'Duration'].split(', ');
    var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
    var animationTimeout = getTimeout(animationDelays, animationDurations);
    var timeout = Math.max(transitionTimeout, animationTimeout);
    var type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    var propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
    return {
      type: type,
      timeout: timeout,
      propCount: propCount
    };
  }

  function getTimeout(delays, durations) {
    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i]);
    }));
  }

  function toMs(s) {
    return Number(s.slice(0, -1)) * 1000;
  }

  function once(fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn();
      }
    };
  }

  function shouldSkipTransition(vnode) {
    return !!(
    // if this is a component root node and the compoennt's
    // parent container node also has transition, skip.
    vnode.parent && vnode.parent.data.transition ||
    // if the element has v-show, let the runtime directive
    // call the hooks instead
    vnode.data.show);
  }

  var transition = hasTransition ? {
    create: function create(_, vnode) {
      if (!shouldSkipTransition(vnode)) {
        enter(vnode);
      }
    },
    remove: function remove(vnode, rm) {
      if (!shouldSkipTransition(vnode)) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules = [attrs, klass, events, props, style, transition];

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules = platformModules.concat(baseModules);

  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

  /* istanbul ignore if */
  if (isIE9) {
    // http://www.matts411.com/post/internet-explorer-9-oninput/
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) {
        trigger(el, 'input');
      }
    });
  }

  var model = {
    bind: function bind(el, binding, vnode) {
      if ("development" !== 'production') {
        if (!vnode.tag.match(/input|select|textarea/)) {
          warn('v-model is not supported on element type: <' + vnode.tag + '>. ' + 'If you are working with contenteditable, it\'s recommended to ' + 'wrap a library dedicated for that purpose inside a custom component.', vnode.context);
        }
      }
      if (vnode.tag === 'select') {
        setSelected(el, binding.value);
      } else {
        if (!isAndroid) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
        }
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    },
    postupdate: function postupdate(el, binding, vnode) {
      var val = binding.value;
      if (vnode.tag === 'select') {
        setSelected(el, val);
        // in case the options rendered by v-for have changed,
        // it's possible that the value is out-of-sync with the rendered options.
        // detect such cases and filter out values that no longer has a matchig
        // option in the DOM.
        var needReset = el.multiple ? val.some(function (v) {
          return hasNoMatchingOption(v, el.options);
        }) : hasNoMatchingOption(val, el.options);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  };

  function setSelected(el, value) {
    var isMultiple = el.multiple;
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
    for (var i = 0, l = el.options.length; i < l; i++) {
      var option = el.options[i];
      if (isMultiple) {
        option.selected = value.indexOf(getValue(option)) > -1;
      } else {
        if (getValue(option) === value) {
          el.selectedIndex = i;
          break;
        }
      }
    }
  }

  function hasNoMatchingOption(value, options) {
    for (var i = 0, l = options.length; i < l; i++) {
      if (getValue(options[i]) === value) {
        return false;
      }
    }
    return true;
  }

  function getValue(option) {
    return '_value' in option ? option._value : option.value || option.text;
  }

  function onCompositionStart(e) {
    e.target.composing = true;
  }

  function onCompositionEnd(e) {
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger(el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  var show = {
    bind: function bind(el, _ref, vnode) {
      var value = _ref.value;

      var transition = getTransition(vnode);
      if (value && transition && transition.appear && !isIE9) {
        enter(vnode);
      }
      el.style.display = value ? '' : 'none';
    },
    update: function update(el, _ref2, vnode) {
      var value = _ref2.value;

      var transition = getTransition(vnode);
      if (transition && !isIE9) {
        if (value) {
          enter(vnode);
          el.style.display = '';
        } else {
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? '' : 'none';
      }
    }
  };

  function getTransition(vnode) {
    var parent = vnode.parent;
    return parent && parent.data.transition != null ? parent.data.transition : vnode.data.transition;
  }

  var platformDirectives = {
    model: model,
    show: show
  };

  var TransitionControl = {
    name: 'transition-control',
    _abstract: true,
    props: {
      child: Object,
      mode: {
        validator: function validator(val) {
          /* istanbul ignore if */
          if (val && val !== 'out-in' && val !== 'in-out') {
            warn('transition-mode must be either "out-in" or "in-out".');
            return false;
          }
          return true;
        }
      }
    },
    render: function render() {
      var _this = this;

      var oldChild = this._vnode;
      var newChild = this.child;
      if (oldChild && oldChild.data && (oldChild.tag !== newChild.tag || oldChild.key !== newChild.key)) {
        if (this.mode === 'out-in') {
          // return empty node
          // and queue an update when the leave finishes
          return addHook(oldChild, {
            afterLeave: function afterLeave() {
              _this.$forceUpdate();
            }
          });
        } else if (this.mode === 'in-out') {
          (function () {
            var delayedLeave = void 0;
            var performLeave = function performLeave() {
              delayedLeave();
            };
            addHook(newChild, {
              afterEnter: performLeave,
              enterCancelled: performLeave
            });
            addHook(oldChild, {
              delayLeave: function delayLeave(leave) {
                delayedLeave = leave;
              }
            });
          })();
        }
      }
      return newChild;
    }
  };

  function addHook(vnode, hooks) {
    /* istanbul ignore if */
    if (!vnode.data || !vnode.data.transition) {
      return;
    }
    var trans = vnode.data.transition;
    /* istanbul ignore else */
    if (typeof trans === 'string') {
      trans = vnode.data.transition = { name: trans };
    } else if (typeof trans !== 'object') {
      trans = vnode.data.transition = { name: 'v' };
    }
    trans.hooks = hooks;
  }

  var platformComponents = {
    TransitionControl: TransitionControl
  };

  // install platform specific utils
  Vue.config.isUnknownElement = isUnknownElement;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.mustUseProp = mustUseProp;

  // install platform runtime directives & components
  extend(Vue.options.directives, platformDirectives);
  extend(Vue.options.components, platformComponents);

  // install platform patch function
  Vue.prototype.__patch__ = config._isServer ? noop : patch;

  // wrap mount
  Vue.prototype.$mount = function (el, hydrating) {
    return this._mount(el && query(el), hydrating);
  };

  var decoder = document.createElement('div');

  function decodeHTML(html) {
    decoder.innerHTML = html;
    return decoder.textContent;
  }

  // Regular Expressions for parsing tags and attributes
  var singleAttrIdentifier = /([^\s"'<>\/=]+)/;
  var singleAttrAssign = /=/;
  var singleAttrAssigns = [singleAttrAssign];
  var singleAttrValues = [
  // attr value double quotes
  /"([^"]*)"+/.source,
  // attr value, single quotes
  /'([^']*)'+/.source,
  // attr value, no quotes
  /([^\s"'=<>`]+)/.source];
  // could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
  // but for Vue templates we can enforce a simple charset
  var ncname = '[a-zA-Z_][\\w\\-\\.]*';
  var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
  var startTagOpen = new RegExp('^<' + qnameCapture);
  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
  var doctype = /^<!DOCTYPE [^>]+>/i;

  var IS_REGEX_CAPTURING_BROKEN = false;
  'x'.replace(/x(.)?/g, function (m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === '';
  });

  // Special Elements (can contain anything)
  var special = makeMap('script,style', true);

  var reCache = {};

  function attrForHandler(handler) {
    var pattern = singleAttrIdentifier.source + '(?:\\s*(' + joinSingleAttrAssigns(handler) + ')' + '\\s*(?:' + singleAttrValues.join('|') + '))?';
    return new RegExp('^\\s*' + pattern);
  }

  function joinSingleAttrAssigns(handler) {
    return singleAttrAssigns.map(function (assign) {
      return '(?:' + assign.source + ')';
    }).join('|');
  }

  function parseHTML(html, handler) {
    var stack = [];
    var attribute = attrForHandler(handler);
    var expectHTML = handler.expectHTML;
    var isUnaryTag = handler.isUnaryTag || no;
    var isSpecialTag = handler.isSpecialTag || special;
    var last = void 0,
        prevTag = void 0,
        nextTag = void 0,
        lastTag = void 0;
    while (html) {
      last = html;
      // Make sure we're not in a script or style element
      if (!lastTag || !isSpecialTag(lastTag)) {
        var textEnd = html.indexOf('<');
        if (textEnd === 0) {
          // Comment:
          if (/^<!--/.test(html)) {
            var commentEnd = html.indexOf('-->');

            if (commentEnd >= 0) {
              html = html.substring(commentEnd + 3);
              prevTag = '';
              continue;
            }
          }

          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
          if (/^<!\[/.test(html)) {
            var conditionalEnd = html.indexOf(']>');

            if (conditionalEnd >= 0) {
              html = html.substring(conditionalEnd + 2);
              prevTag = '';
              continue;
            }
          }

          // Doctype:
          var doctypeMatch = html.match(doctype);
          if (doctypeMatch) {
            if (handler.doctype) {
              handler.doctype(doctypeMatch[0]);
            }
            html = html.substring(doctypeMatch[0].length);
            prevTag = '';
            continue;
          }

          // End tag:
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            html = html.substring(endTagMatch[0].length);
            endTagMatch[0].replace(endTag, parseEndTag);
            prevTag = '/' + endTagMatch[1].toLowerCase();
            continue;
          }

          // Start tag:
          var startTagMatch = parseStartTag(html);
          if (startTagMatch) {
            html = startTagMatch.rest;
            handleStartTag(startTagMatch);
            prevTag = startTagMatch.tagName.toLowerCase();
            continue;
          }
        }

        var text = void 0;
        if (textEnd >= 0) {
          text = html.substring(0, textEnd);
          html = html.substring(textEnd);
        } else {
          text = html;
          html = '';
        }

        // next tag
        var nextTagMatch = parseStartTag(html);
        if (nextTagMatch) {
          nextTag = nextTagMatch.tagName;
        } else {
          nextTagMatch = html.match(endTag);
          if (nextTagMatch) {
            nextTag = '/' + nextTagMatch[1];
          } else {
            nextTag = '';
          }
        }

        if (handler.chars) {
          handler.chars(text, prevTag, nextTag);
        }
        prevTag = '';
      } else {
        (function () {
          var stackedTag = lastTag.toLowerCase();
          var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)</' + stackedTag + '[^>]*>', 'i'));

          html = html.replace(reStackedTag, function (all, text) {
            if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
              text = text.replace(/<!--([\s\S]*?)-->/g, '$1').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
            }
            if (handler.chars) {
              handler.chars(text);
            }
            return '';
          });

          parseEndTag('</' + stackedTag + '>', stackedTag);
        })();
      }

      if (html === last) {
        throw new Error('Error parsing template:\n\n' + html);
      }
    }

    if (!handler.partialMarkup) {
      // Clean up any remaining tags
      parseEndTag();
    }

    function parseStartTag(input) {
      var start = input.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        input = input.slice(start[0].length);
        var end = void 0,
            attr = void 0;
        while (!(end = input.match(startTagClose)) && (attr = input.match(attribute))) {
          input = input.slice(attr[0].length);
          match.attrs.push(attr);
        }
        if (end) {
          match.unarySlash = end[1];
          match.rest = input.slice(end[0].length);
          return match;
        }
      }
    }

    function handleStartTag(match) {
      var tagName = match.tagName;
      var unarySlash = match.unarySlash;

      if (expectHTML) {
        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
          parseEndTag('', lastTag);
        }
        if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
          parseEndTag('', tagName);
        }
      }

      var unary = isUnaryTag(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash;

      var l = match.attrs.length;
      var attrs = new Array(l);
      for (var i = 0; i < l; i++) {
        var args = match.attrs[i];
        // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
        if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
          if (args[3] === '') {
            delete args[3];
          }
          if (args[4] === '') {
            delete args[4];
          }
          if (args[5] === '') {
            delete args[5];
          }
        }
        attrs[i] = {
          name: args[1],
          value: decodeHTML(args[3] || args[4] || args[5] || '')
        };
      }

      if (!unary) {
        stack.push({ tag: tagName, attrs: attrs });
        lastTag = tagName;
        unarySlash = '';
      }

      if (handler.start) {
        handler.start(tagName, attrs, unary, unarySlash);
      }
    }

    function parseEndTag(tag, tagName) {
      var pos = void 0;

      // Find the closest opened tag of the same type
      if (tagName) {
        var needle = tagName.toLowerCase();
        for (pos = stack.length - 1; pos >= 0; pos--) {
          if (stack[pos].tag.toLowerCase() === needle) {
            break;
          }
        }
      } else {
        // If no tag name is provided, clean shop
        pos = 0;
      }

      if (pos >= 0) {
        // Close all the open elements, up the stack
        for (var i = stack.length - 1; i >= pos; i--) {
          if (handler.end) {
            handler.end(stack[i].tag, stack[i].attrs, i > pos || !tag);
          }
        }

        // Remove the open elements from the stack
        stack.length = pos;
        lastTag = pos && stack[pos - 1].tag;
      } else if (tagName.toLowerCase() === 'br') {
        if (handler.start) {
          handler.start(tagName, [], true, '');
        }
      } else if (tagName.toLowerCase() === 'p') {
        if (handler.start) {
          handler.start(tagName, [], false, '', true);
        }
        if (handler.end) {
          handler.end(tagName, []);
        }
      }
    }
  }

  function parseFilters(exp) {
    var inSingle = false;
    var inDouble = false;
    var curly = 0;
    var square = 0;
    var paren = 0;
    var lastFilterIndex = 0;
    var c = void 0,
        prev = void 0,
        i = void 0,
        expression = void 0,
        filters = void 0;

    for (i = 0; i < exp.length; i++) {
      prev = c;
      c = exp.charCodeAt(i);
      if (inSingle) {
        // check single quote
        if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
      } else if (inDouble) {
        // check double quote
        if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
      } else if (c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
        if (expression === undefined) {
          // first filter, end of expression
          lastFilterIndex = i + 1;
          expression = exp.slice(0, i).trim();
        } else {
          pushFilter();
        }
      } else {
        switch (c) {
          case 0x22:
            inDouble = true;break; // "
          case 0x27:
            inSingle = true;break; // '
          case 0x28:
            paren++;break; // (
          case 0x29:
            paren--;break; // )
          case 0x5B:
            square++;break; // [
          case 0x5D:
            square--;break; // ]
          case 0x7B:
            curly++;break; // {
          case 0x7D:
            curly--;break; // }
        }
      }
    }

    if (expression === undefined) {
      expression = exp.slice(0, i).trim();
    } else if (lastFilterIndex !== 0) {
      pushFilter();
    }

    function pushFilter() {
      (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
      lastFilterIndex = i + 1;
    }

    if (filters) {
      for (i = 0; i < filters.length; i++) {
        expression = wrapFilter(expression, filters[i]);
      }
    }

    return expression;
  }

  function wrapFilter(exp, filter) {
    var i = filter.indexOf('(');
    if (i < 0) {
      // _f: resolveFilter
      return '_f("' + filter + '")(' + exp + ')';
    } else {
      var name = filter.slice(0, i);
      var args = filter.slice(i + 1);
      return '_f("' + name + '")(' + exp + ',' + args;
    }
  }

  var defaultTagRE = /\{\{((?:.|\\n)+?)\}\}/g;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

  var buildRegex = cached(function (delimiters) {
    var open = delimiters[0].replace(regexEscapeRE, '\\$&');
    var close = delimiters[1].replace(regexEscapeRE, '\\$&');
    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g');
  });

  function parseText(text, delimiters) {
    var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
    if (!tagRE.test(text)) {
      return;
    }
    var tokens = [];
    var lastIndex = tagRE.lastIndex = 0;
    var match = void 0,
        index = void 0;
    while (match = tagRE.exec(text)) {
      index = match.index;
      // push text token
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      // tag token
      var exp = parseFilters(match[1].trim());
      tokens.push('_s(' + exp + ')');
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    return tokens.join('+');
  }

  function baseWarn(msg) {
    console.error('[Vue parser]: ' + msg);
  }

  function pluckModuleFunction(modules, key) {
    return modules ? modules.map(function (m) {
      return m[key];
    }).filter(function (_) {
      return _;
    }) : [];
  }

  function addProp(el, name, value) {
    (el.props || (el.props = [])).push({ name: name, value: value });
  }

  function addAttr(el, name, value) {
    (el.attrs || (el.attrs = [])).push({ name: name, value: value });
  }

  function addStaticAttr(el, name, value) {
    (el.staticAttrs || (el.staticAttrs = [])).push({ name: name, value: value });
  }

  function addDirective(el, name, value, arg, modifiers) {
    (el.directives || (el.directives = [])).push({ name: name, value: value, arg: arg, modifiers: modifiers });
  }

  function addHook$1(el, name, code) {
    var hooks = el.hooks || (el.hooks = {});
    var hook = hooks[name];
    /* istanbul ignore if */
    if (hook) {
      hook.push(code);
    } else {
      hooks[name] = [code];
    }
  }

  function addHandler(el, name, value, modifiers) {
    var events = el.events || (el.events = {});
    // check capture modifier
    if (modifiers && modifiers.capture) {
      delete modifiers.capture;
      name = '!' + name; // mark the event as captured
    }
    var newHandler = { value: value, modifiers: modifiers };
    var handlers = events[name];
    /* istanbul ignore if */
    if (Array.isArray(handlers)) {
      handlers.push(newHandler);
    } else if (handlers) {
      events[name] = [handlers, newHandler];
    } else {
      events[name] = newHandler;
    }
  }

  function getBindingAttr(el, name, getStatic) {
    var dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);
    if (dynamicValue != null) {
      return dynamicValue;
    } else if (getStatic !== false) {
      var staticValue = getAndRemoveAttr(el, name);
      if (staticValue != null) {
        return JSON.stringify(staticValue);
      }
    }
  }

  function getAndRemoveAttr(el, name) {
    var val = void 0;
    if ((val = el.attrsMap[name]) != null) {
      var list = el.attrsList;
      for (var i = 0, l = list.length; i < l; i++) {
        if (list[i].name === name) {
          list.splice(i, 1);
          break;
        }
      }
    }
    return val;
  }

  var dirRE = /^v-|^@|^:/;
  var bindRE = /^:|^v-bind:/;
  var onRE = /^@|^v-on:/;
  var argRE = /:(.*)$/;
  var modifierRE = /\.[^\.]+/g;
  var forAliasRE = /(.*)\s+(?:in|of)\s+(.*)/;
  var forIteratorRE = /\((.*),(.*)\)/;
  var camelRE = /[a-z\d][A-Z]/;

  var decodeHTMLCached = cached(decodeHTML);

  // configurable state
  var warn$1 = void 0;
  var platformGetTagNamespace = void 0;
  var platformMustUseProp = void 0;
  var preTransforms = void 0;
  var transforms = void 0;
  var postTransforms = void 0;
  var delimiters = void 0;

  /**
   * Convert HTML string to AST.
   */
  function parse(template, options) {
    warn$1 = options.warn || baseWarn;
    platformGetTagNamespace = options.getTagNamespace || no;
    platformMustUseProp = options.mustUseProp || no;
    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    transforms = pluckModuleFunction(options.modules, 'transformNode');
    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
    delimiters = options.delimiters;
    var stack = [];
    var root = void 0;
    var currentParent = void 0;
    var inPre = false;
    var warned = false;
    parseHTML(template, {
      expectHTML: options.expectHTML,
      isUnaryTag: options.isUnaryTag,
      start: function start(tag, attrs, unary) {
        // check camelCase tag
        if (camelRE.test(tag)) {
          "development" !== 'production' && warn$1('Found camelCase tag in template: <' + tag + '>. ' + ('I\'ve converted it to <' + hyphenate(tag) + '> for you.'));
          tag = hyphenate(tag);
        }

        tag = tag.toLowerCase();

        // check namespace.
        // inherit parent ns if there is one
        var ns = currentParent && currentParent.ns || platformGetTagNamespace(tag);

        // handle IE svg bug
        /* istanbul ignore if */
        if (options.isIE && ns === 'svg') {
          attrs = guardIESVGBug(attrs);
        }

        var element = {
          type: 1,
          tag: tag,
          attrsList: attrs,
          attrsMap: makeAttrsMap(attrs),
          parent: currentParent,
          children: []
        };
        if (ns) {
          element.ns = ns;
        }

        if (isForbiddenTag(element)) {
          element.forbidden = true;
          "development" !== 'production' && warn$1('Templates should only be responsbile for mapping the state to the ' + 'UI. Avoid placing tags with side-effects in your templates, such as ' + ('<' + tag + '>.'));
        }

        // apply pre-transforms
        for (var i = 0; i < preTransforms.length; i++) {
          preTransforms[i](element, options);
        }

        if (!inPre) {
          processPre(element);
          if (element.pre) {
            inPre = true;
          }
        }
        if (inPre) {
          processRawAttrs(element);
        } else {
          processKey(element);
          processFor(element);
          processIf(element);
          processOnce(element);
          // determine whether this is a plain element after
          // removing if/for/once attributes
          element.plain = !element.key && !attrs.length;
          processRender(element);
          processSlot(element);
          processComponent(element);
          for (var _i = 0; _i < transforms.length; _i++) {
            transforms[_i](element, options);
          }
          processAttrs(element);
        }

        // tree management
        if (!root) {
          root = element;
          // check root element constraints
          if ("development" !== 'production') {
            if (tag === 'slot' || tag === 'template') {
              warn$1('Cannot use <' + tag + '> as component root element because it may ' + 'contain multiple nodes:\n' + template);
            }
            if (element.attrsMap.hasOwnProperty('v-for')) {
              warn$1('Cannot use v-for on component root element because it renders ' + 'multiple elements:\n' + template);
            }
          }
        } else if ("development" !== 'production' && !stack.length && !warned) {
          warned = true;
          warn$1('Component template should contain exactly one root element:\n\n' + template);
        }
        if (currentParent && !element.forbidden) {
          if (element.else) {
            processElse(element, currentParent);
          } else {
            currentParent.children.push(element);
            element.parent = currentParent;
          }
        }
        if (!unary) {
          currentParent = element;
          stack.push(element);
        }
        // apply post-transforms
        for (var _i2 = 0; _i2 < postTransforms.length; _i2++) {
          postTransforms[_i2](element, options);
        }
      },
      end: function end() {
        // remove trailing whitespace
        var element = stack[stack.length - 1];
        var lastNode = element.children[element.children.length - 1];
        if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
          element.children.pop();
        }
        // pop stack
        stack.length -= 1;
        currentParent = stack[stack.length - 1];
        // check pre state
        if (element.pre) {
          inPre = false;
        }
      },
      chars: function chars(text) {
        if (!currentParent) {
          if ("development" !== 'production' && !warned) {
            warned = true;
            warn$1('Component template should contain exactly one root element:\n\n' + template);
          }
          return;
        }
        text = currentParent.tag === 'pre' || text.trim() ? decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        : currentParent.children.length ? ' ' : '';
        if (text) {
          var expression = void 0;
          if (!inPre && text !== ' ' && (expression = parseText(text, delimiters))) {
            currentParent.children.push({
              type: 2,
              expression: expression,
              text: text
            });
          } else {
            currentParent.children.push({
              type: 3,
              text: text
            });
          }
        }
      }
    });
    return root;
  }

  function processPre(el) {
    if (getAndRemoveAttr(el, 'v-pre') != null) {
      el.pre = true;
    }
  }

  function processRawAttrs(el) {
    var l = el.attrsList.length;
    if (l) {
      var attrs = el.staticAttrs = new Array(l);
      for (var i = 0; i < l; i++) {
        attrs[i] = {
          name: el.attrsList[i].name,
          value: JSON.stringify(el.attrsList[i].value)
        };
      }
    } else if (!el.pre) {
      // non root node in pre blocks with no attributes
      el.plain = true;
    }
  }

  function processKey(el) {
    var exp = getBindingAttr(el, 'key');
    if (exp) {
      el.key = exp;
    }
  }

  function processFor(el) {
    var exp = void 0;
    if (exp = getAndRemoveAttr(el, 'v-for')) {
      var inMatch = exp.match(forAliasRE);
      if (!inMatch) {
        "development" !== 'production' && warn$1('Invalid v-for expression: ' + exp);
        return;
      }
      el.for = inMatch[2].trim();
      var alias = inMatch[1].trim();
      var iteratorMatch = alias.match(forIteratorRE);
      if (iteratorMatch) {
        el.iterator = iteratorMatch[1].trim();
        el.alias = iteratorMatch[2].trim();
      } else {
        el.alias = alias;
      }
    }
  }

  function processIf(el) {
    var exp = getAndRemoveAttr(el, 'v-if');
    if (exp) {
      el.if = exp;
    }
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
  }

  function processElse(el, parent) {
    var prev = findPrevElement(parent.children);
    if (prev && prev.if) {
      prev.elseBlock = el;
    } else if ("development" !== 'production') {
      warn$1('v-else used on element <' + el.tag + '> without corresponding v-if.');
    }
  }

  function processOnce(el) {
    var once = getAndRemoveAttr(el, 'v-once');
    if (once != null) {
      el.once = true;
    }
  }

  function processRender(el) {
    if (el.tag === 'render') {
      el.render = true;
      el.renderMethod = el.attrsMap[':method'] || el.attrsMap['v-bind:method'];
      el.renderArgs = el.attrsMap[':args'] || el.attrsMap['v-bind:args'];
      if ("development" !== 'production') {
        if (el.attrsMap.method) {
          warn$1('<render> method should use a dynamic binding, e.g. `:method="..."`.');
        } else if (!el.renderMethod) {
          warn$1('method attribute is required on <render>.');
        }
        if (el.attrsMap.args) {
          warn$1('<render> args should use a dynamic binding, e.g. `:args="..."`.');
        }
      }
    }
  }

  function processSlot(el) {
    if (el.tag === 'slot') {
      el.slotName = getBindingAttr(el, 'name');
    } else {
      var slotTarget = getBindingAttr(el, 'slot');
      if (slotTarget) {
        el.slotTarget = slotTarget;
      }
    }
  }

  function processComponent(el) {
    var binding = void 0;
    if (binding = getBindingAttr(el, 'is')) {
      el.component = binding;
    }
    if (getAndRemoveAttr(el, 'keep-alive') != null) {
      el.keepAlive = true;
    }
    if (getAndRemoveAttr(el, 'inline-template') != null) {
      el.inlineTemplate = true;
    }
  }

  function processAttrs(el) {
    var list = el.attrsList;
    var i = void 0,
        l = void 0,
        name = void 0,
        value = void 0,
        arg = void 0,
        modifiers = void 0;
    for (i = 0, l = list.length; i < l; i++) {
      name = list[i].name;
      value = list[i].value;
      if (dirRE.test(name)) {
        // modifiers
        modifiers = parseModifiers(name);
        if (modifiers) {
          name = name.replace(modifierRE, '');
        }
        if (bindRE.test(name)) {
          // v-bind
          name = name.replace(bindRE, '');
          if (platformMustUseProp(name)) {
            addProp(el, name, value);
          } else {
            addAttr(el, name, value);
          }
        } else if (onRE.test(name)) {
          // v-on
          name = name.replace(onRE, '');
          addHandler(el, name, value, modifiers);
        } else {
          // normal directives
          name = name.replace(dirRE, '');
          // parse arg
          var argMatch = name.match(argRE);
          if (argMatch && (arg = argMatch[1])) {
            name = name.slice(0, -(arg.length + 1));
          }
          addDirective(el, name, value, arg, modifiers);
        }
      } else {
        // literal attribute
        if ("development" !== 'production') {
          var expression = parseText(value, delimiters);
          if (expression) {
            warn$1(name + '="' + value + '": ' + 'Interpolation inside attributes has been deprecated. ' + 'Use v-bind or the colon shorthand instead.');
          }
        }
        addStaticAttr(el, name, JSON.stringify(value));
      }
    }
  }

  function parseModifiers(name) {
    var match = name.match(modifierRE);
    if (match) {
      var _ret = function () {
        var ret = {};
        match.forEach(function (m) {
          ret[m.slice(1)] = true;
        });
        return {
          v: ret
        };
      }();

      if (typeof _ret === "object") return _ret.v;
    }
  }

  function makeAttrsMap(attrs) {
    var map = {};
    for (var i = 0, l = attrs.length; i < l; i++) {
      if ("development" !== 'production' && map[attrs[i].name]) {
        warn$1('duplicate attribute: ' + attrs[i].name);
      }
      map[attrs[i].name] = attrs[i].value;
    }
    return map;
  }

  function findPrevElement(children) {
    var i = children.length;
    while (i--) {
      if (children[i].tag) return children[i];
    }
  }

  function isForbiddenTag(el) {
    return el.tag === 'style' || el.tag === 'script' && (!el.attrsMap.type || el.attrsMap.type === 'text/javascript');
  }

  var ieNSBug = /^xmlns:NS\d+/;
  var ieNSPrefix = /^NS\d+:/;

  /* istanbul ignore next */
  function guardIESVGBug(attrs) {
    var res = [];
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (!ieNSBug.test(attr.name)) {
        attr.name = attr.name.replace(ieNSPrefix, '');
        res.push(attr);
      }
    }
    return res;
  }

  var isStaticKey = void 0;
  var isPlatformReservedTag = void 0;

  var genStaticKeysCached = cached(genStaticKeys$1);

  /**
   * Goal of the optimizier: walk the generated template AST tree
   * and detect sub-trees that are purely static, i.e. parts of
   * the DOM that never needs to change.
   *
   * Once we detect these sub-trees, we can:
   *
   * 1. Hoist them into constants, so that we no longer need to
   *    create fresh nodes for them on each re-render;
   * 2. Completely skip them in the patching process.
   */
  function optimize(root, options) {
    if (!root) return;
    isStaticKey = genStaticKeysCached(options.staticKeys || '');
    isPlatformReservedTag = options.isReservedTag || function () {
      return false;
    };
    // first pass: mark all non-static nodes.
    markStatic(root);
    // second pass: mark static roots.
    markStaticRoots(root);
  }

  function genStaticKeys$1(keys) {
    return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,staticAttrs' + (keys ? ',' + keys : ''));
  }

  function markStatic(node) {
    node.static = isStatic(node);
    if (node.type === 1) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        var child = node.children[i];
        markStatic(child);
        if (!child.static) {
          node.static = false;
        }
      }
    }
  }

  function markStaticRoots(node) {
    if (node.type === 1 && (node.once || node.static)) {
      node.staticRoot = true;
      return;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i]);
      }
    }
  }

  function isStatic(node) {
    if (node.type === 2) {
      // expression
      return false;
    }
    if (node.type === 3) {
      // text
      return true;
    }
    return !!(node.pre || !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && ( // not a component
    node.plain || Object.keys(node).every(isStaticKey)) // no dynamic bindings
    );
  }

  var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;

  // keyCode aliases
  var keyCodes = {
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46]
  };

  var modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: 'if($event.target !== $event.currentTarget)return;'
  };

  function genHandlers(events) {
    var res = 'on:{';
    for (var name in events) {
      res += '"' + name + '":' + genHandler(events[name]) + ',';
    }
    return res.slice(0, -1) + '}';
  }

  function genHandler(handler) {
    if (!handler) {
      return 'function(){}';
    } else if (Array.isArray(handler)) {
      return '[' + handler.map(genHandler).join(',') + ']';
    } else if (!handler.modifiers) {
      return simplePathRE.test(handler.value) ? handler.value : 'function($event){' + handler.value + '}';
    } else {
      var code = 'function($event){';
      for (var key in handler.modifiers) {
        code += modifierCode[key] || genKeyFilter(key);
      }
      var handlerCode = simplePathRE.test(handler.value) ? handler.value + '($event)' : handler.value;
      return code + handlerCode + '}';
    }
  }

  function genKeyFilter(key) {
    var code = keyCodes[key];
    if (Array.isArray(code)) {
      return 'if(' + code.map(function (c) {
        return '$event.keyCode!==' + c;
      }).join('&&') + ')return;';
    } else {
      return 'if($event.keyCode!==' + code + ')return;';
    }
  }

  function ref$1(el, dir) {
    if (dir.arg) {
      el.ref = dir.arg;
      // go up and check if this node is inside a v-for
      var parent = el;
      while (parent) {
        if (parent.for !== undefined) {
          el.refInFor = true;
          break;
        }
        parent = parent.parent;
      }
    }
  }

  function bind$1(el, dir) {
    addHook$1(el, 'construct', '_b(n1,' + dir.value + ')');
  }

  var baseDirectives = {
    ref: ref$1,
    bind: bind$1,
    cloak: noop
  };

  // configurable state
  var warn$2 = void 0;
  var transforms$1 = void 0;
  var dataGenFns = void 0;
  var platformDirectives$1 = void 0;
  var isPlatformReservedTag$1 = void 0;
  var staticRenderFns = void 0;
  var currentOptions = void 0;

  function generate(ast, options) {
    // save previous staticRenderFns so generate calls can be nested
    var prevStaticRenderFns = staticRenderFns;
    var currentStaticRenderFns = staticRenderFns = [];
    currentOptions = options;
    warn$2 = options.warn || baseWarn;
    transforms$1 = pluckModuleFunction(options.modules, 'transformCode');
    dataGenFns = pluckModuleFunction(options.modules, 'genData');
    platformDirectives$1 = options.directives || {};
    isPlatformReservedTag$1 = options.isReservedTag || no;
    var code = ast ? genElement(ast) : '_h(_e("div"))';
    staticRenderFns = prevStaticRenderFns;
    return {
      render: 'with(this){return ' + code + '}',
      staticRenderFns: currentStaticRenderFns
    };
  }

  function genElement(el) {
    if (el.for) {
      return genFor(el);
    } else if (el.if) {
      return genIf(el);
    } else if (el.tag === 'template' && !el.slotTarget) {
      return genChildren(el) || 'void 0';
    } else if (el.tag === 'render') {
      return genRender(el);
    } else if (el.tag === 'slot') {
      return genSlot(el);
    } else {
      // component or element
      var code = void 0;
      if (el.component) {
        code = genComponent(el);
      } else {
        var data = genData(el);
        // if the element is potentially a component,
        // wrap its children as a thunk.
        var children = !el.inlineTemplate ? genChildren(el, !el.ns && !isPlatformReservedTag$1(el.tag) /* asThunk */) : null;
        code = '_h(_e(\'' + el.tag + '\'' + (data ? ',' + data : el.ns ? ',void 0' : '' // data
        ) + (el.ns ? ',\'' + el.ns + '\'' : '' // namespace
        ) + ')' + (children ? ',' + children : '' // children
        ) + ')';
        if (el.staticRoot) {
          // hoist static sub-trees out
          staticRenderFns.push('with(this){return ' + code + '}');
          code = '_m(' + (staticRenderFns.length - 1) + ')';
        }
      }
      // module transforms
      for (var i = 0; i < transforms$1.length; i++) {
        code = transforms$1[i](el, code);
      }
      // check keep-alive
      if (el.component && el.keepAlive) {
        code = '_h(_e("KeepAlive",{props:{child:' + code + '}}))';
      }
      return code;
    }
  }

  function genIf(el) {
    var exp = el.if;
    el.if = null; // avoid recursion
    return '(' + exp + ')?' + genElement(el) + ':' + genElse(el);
  }

  function genElse(el) {
    return el.elseBlock ? genElement(el.elseBlock) : 'void 0';
  }

  function genFor(el) {
    var exp = el.for;
    var alias = el.alias;
    var iterator = el.iterator;
    el.for = null; // avoid recursion
    return '(' + exp + ')&&_l((' + exp + '),' + ('function(' + alias + ',$index,' + (iterator || '$key') + '){') + ('return ' + genElement(el)) + '})';
  }

  function genData(el) {
    if (el.plain) {
      return;
    }

    var data = '{';

    // directives first.
    // directives may mutate the el's other properties before they are generated.
    var dirs = genDirectives(el);
    if (dirs) data += dirs + ',';

    // key
    if (el.key) {
      data += 'key:' + el.key + ',';
    }
    // ref
    if (el.ref) {
      data += 'ref:"' + el.ref + '",';
    }
    if (el.refInFor) {
      data += 'refInFor:true,';
    }
    // record original tag name for components using "is" attribute
    if (el.component) {
      data += 'tag:"' + el.tag + '",';
    }
    // slot target
    if (el.slotTarget) {
      data += 'slot:' + el.slotTarget + ',';
    }
    // module data generation functions
    for (var i = 0; i < dataGenFns.length; i++) {
      data += dataGenFns[i](el);
    }
    // v-show, used to avoid transition being applied
    // since v-show takes it over
    if (el.attrsMap['v-show']) {
      data += 'show:true,';
    }
    // props
    if (el.props) {
      data += 'props:{' + genProps(el.props) + '},';
    }
    // attributes
    if (el.attrs) {
      data += 'attrs:{' + genProps(el.attrs) + '},';
    }
    // static attributes
    if (el.staticAttrs) {
      data += 'staticAttrs:{' + genProps(el.staticAttrs) + '},';
    }
    // hooks
    if (el.hooks) {
      data += 'hook:{' + genHooks(el.hooks) + '},';
    }
    // event handlers
    if (el.events) {
      data += genHandlers(el.events) + ',';
    }
    // inline-template
    if (el.inlineTemplate) {
      var ast = el.children[0];
      if ("development" !== 'production' && (el.children.length > 1 || ast.type !== 1)) {
        warn$2('Inline-template components must have exactly one child element.');
      }
      if (ast.type === 1) {
        var inlineRenderFns = generate(ast, currentOptions);
        data += 'inlineTemplate:{render:function(){' + inlineRenderFns.render + '},staticRenderFns:[' + inlineRenderFns.staticRenderFns.map(function (code) {
          return 'function(){' + code + '}';
        }).join(',') + ']}';
      }
    }
    return data.replace(/,$/, '') + '}';
  }

  function genDirectives(el) {
    var dirs = el.directives;
    if (!dirs) return;
    var res = 'directives:[';
    var hasRuntime = false;
    var i = void 0,
        l = void 0,
        dir = void 0,
        needRuntime = void 0;
    for (i = 0, l = dirs.length; i < l; i++) {
      dir = dirs[i];
      needRuntime = true;
      var gen = platformDirectives$1[dir.name] || baseDirectives[dir.name];
      if (gen) {
        // compile-time directive that manipulates AST.
        // returns true if it also needs a runtime counterpart.
        needRuntime = !!gen(el, dir, warn$2);
      }
      if (needRuntime) {
        hasRuntime = true;
        res += '{name:"' + dir.name + '"' + (dir.value ? ',value:(' + dir.value + ')' : '') + (dir.arg ? ',arg:"' + dir.arg + '"' : '') + (dir.modifiers ? ',modifiers:' + JSON.stringify(dir.modifiers) : '') + '},';
      }
    }
    if (hasRuntime) {
      return res.slice(0, -1) + ']';
    }
  }

  function genChildren(el, asThunk) {
    if (!el.children.length) {
      return;
    }
    var code = '[' + el.children.map(genNode).join(',') + ']';
    return asThunk ? 'function(){return ' + code + '}' : code;
  }

  function genNode(node) {
    if (node.type === 1) {
      return genElement(node);
    } else {
      return genText(node);
    }
  }

  function genText(text) {
    return text.type === 2 ? '(' + text.expression + ')' : '_t(' + JSON.stringify(text.text) + ')';
  }

  function genRender(el) {
    if (!el.renderMethod) {
      return 'void 0';
    }
    var children = genChildren(el);
    return el.renderMethod + '(' + (el.renderArgs || '') + (children ? (el.renderArgs ? ',' : '') + children : '') + ')';
  }

  function genSlot(el) {
    var slot = '$slots[' + (el.slotName || '"default"') + ']';
    var children = genChildren(el);
    return children ? '(' + slot + '||' + children + ')' : slot;
  }

  function genComponent(el) {
    var children = genChildren(el, true);
    return '_h(_e(' + el.component + ',' + genData(el) + ')' + (children ? ',' + children : '') + ')';
  }

  function genProps(props) {
    var res = '';
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      res += '"' + prop.name + '":' + prop.value + ',';
    }
    return res.slice(0, -1);
  }

  function genHooks(hooks) {
    var res = '';
    for (var _key in hooks) {
      res += '"' + _key + '":function(n1,n2){' + hooks[_key].join(';') + '},';
    }
    return res.slice(0, -1);
  }

  /**
   * Compile a template.
   */
  function compile$1(template, options) {
    var ast = parse(template.trim(), options);
    optimize(ast, options);
    var code = generate(ast, options);
    return {
      ast: ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    };
  }

  var keywordRE = new RegExp('\\b' + ('do,if,in,for,let,new,try,var,case,else,with,await,break,catch,class,const,' + 'super,throw,while,yield,delete,export,import,return,switch,typeof,default,' + 'extends,finally,continue,debugger,function,arguments,instanceof').split(',').join('\\b|\\b') + '\\b');

  // detect problematic expressions in a template
  function detectErrors(ast) {
    var errors = [];
    if (ast) {
      checkNode(ast, errors);
    }
    return errors;
  }

  function checkNode(node, errors) {
    if (node.type === 1) {
      for (var name in node.attrsMap) {
        if (dirRE.test(name)) {
          var value = node.attrsMap[name];
          if (value) {
            checkExpression(value, name + '="' + value + '"', errors);
          }
        }
      }
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          checkNode(node.children[i], errors);
        }
      }
    } else if (node.type === 2) {
      checkExpression(node.expression, node.text, errors);
    }
  }

  function checkExpression(exp, text, errors) {
    exp = stripToString(exp);
    var keywordMatch = exp.match(keywordRE);
    if (keywordMatch) {
      errors.push('- avoid using JavaScript keyword as property name: ' + ('"' + keywordMatch[0] + '" in expression ' + text));
    } else {
      try {
        new Function(exp);
      } catch (e) {
        errors.push('- invalid expression: ' + text);
      }
    }
  }

  function stripToString(exp) {
    return exp.replace(/^_s\((.*)\)$/, '$1');
  }

  function transformNode(el, options) {
    var warn = options.warn || baseWarn;
    var staticClass = getAndRemoveAttr(el, 'class');
    if ("development" !== 'production' && staticClass) {
      var expression = parseText(staticClass, options.delimiters);
      if (expression) {
        warn('class="' + staticClass + '": ' + 'Interpolation inside attributes has been deprecated. ' + 'Use v-bind or the colon shorthand instead.');
      }
    }
    el.staticClass = JSON.stringify(staticClass);
    var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
    if (classBinding) {
      el.classBinding = classBinding;
    }
  }

  function genData$1(el) {
    var data = '';
    if (el.staticClass) {
      data += 'staticClass:' + el.staticClass + ',';
    }
    if (el.classBinding) {
      data += 'class:' + el.classBinding + ',';
    }
    return data;
  }

  var klass$1 = {
    staticKeys: ['staticClass'],
    transformNode: transformNode,
    genData: genData$1
  };

  function transformNode$1(el) {
    var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
    if (styleBinding) {
      el.styleBinding = styleBinding;
    }
  }

  function genData$2(el) {
    return el.styleBinding ? 'style:(' + el.styleBinding + '),' : '';
  }

  var style$1 = {
    transformNode: transformNode$1,
    genData: genData$2
  };

  function transformNode$2(el) {
    var transition = getBindingAttr(el, 'transition');
    if (transition === '""') {
      transition = true;
    }
    if (transition) {
      el.transition = transition;
    }
    var mode = getBindingAttr(el, 'transition-mode');
    if (mode) {
      el.transitionMode = mode;
    }
  }

  function genData$3(el) {
    return el.transition ? 'transition:' + el.transition + ',' : '';
  }

  function transformCode(el, code) {
    return el.transitionMode ? '_h(_e(\'TransitionControl\',{props:{mode:' + el.transitionMode + ',child:' + code + '}}))' : code;
  }

  var transition$1 = {
    transformNode: transformNode$2,
    genData: genData$3,
    transformCode: transformCode
  };

  var modules$1 = [klass$1, style$1, transition$1];

  var warn$3 = void 0;

  function model$1(el, dir, _warn) {
    warn$3 = _warn;
    var value = dir.value;
    var modifiers = dir.modifiers;
    if (el.tag === 'select') {
      return genSelect(el, value);
    } else {
      switch (el.attrsMap.type) {
        case 'checkbox':
          genCheckboxModel(el, value);
          break;
        case 'radio':
          genRadioModel(el, value);
          break;
        default:
          return genDefaultModel(el, value, modifiers);
      }
    }
  }

  function genCheckboxModel(el, value) {
    if ("development" !== 'production' && el.attrsMap.checked != null) {
      warn$3('<' + el.tag + ' v-model="' + value + '" checked>:\n' + 'inline checked attributes will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
    }
    var valueBinding = getBindingAttr(el, 'value');
    var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
    var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
    addProp(el, 'checked', 'Array.isArray(' + value + ')' + ('?(' + value + ').indexOf(' + valueBinding + ')>-1') + (':(' + value + ')===(' + trueValueBinding + ')'));
    addHandler(el, 'change', 'var $$a=' + value + ',' + '$$el=$event.target,' + ('$$c=$$el.checked?(' + trueValueBinding + '):(' + falseValueBinding + ');') + 'if(Array.isArray($$a)){' + ('var $$v=' + valueBinding + ',') + '$$i=$$a.indexOf($$v);' + 'if($$c){$$i<0&&$$a.push($$v)}' + 'else{$$i>-1&&$$a.splice($$i,1)}' + ('}else{' + value + '=$$c}'));
  }

  function genRadioModel(el, value) {
    if ("development" !== 'production' && el.attrsMap.checked != null) {
      warn$3('<' + el.tag + ' v-model="' + value + '" checked>:\n' + 'inline checked attributes will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
    }
    var valueBinding = getBindingAttr(el, 'value');
    addProp(el, 'checked', '(' + value + ')===(' + valueBinding + ')');
    addHandler(el, 'change', value + '=' + valueBinding);
  }

  function genDefaultModel(el, value, modifiers) {
    if ("development" !== 'production') {
      if (el.tag === 'input' && el.attrsMap.value) {
        warn$3('<' + el.tag + ' v-model="' + value + '" value="' + el.attrsMap.value + '">:\n' + 'inline value attributes will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
      }
      if (el.tag === 'textarea' && el.children.length) {
        warn$3('<textarea v-model="' + value + '">:\n' + 'inline content inside <textarea> will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
      }
    }

    var type = el.attrsMap.type;

    var _ref = modifiers || {};

    var lazy = _ref.lazy;
    var number = _ref.number;
    var trim = _ref.trim;

    var event = lazy ? 'change' : 'input';
    var needCompositionGuard = !lazy && type !== 'range';

    var valueExpression = '$event.target.value' + (trim ? '.trim()' : '');
    var code = number || type === 'number' ? value + '=Number(' + valueExpression + ')' : value + '=' + valueExpression;
    if (needCompositionGuard) {
      code = 'if($event.target.composing)return;' + code;
    }
    addProp(el, 'value', '(' + value + ')');
    addHandler(el, event, code);
    if (needCompositionGuard) {
      // need runtime directive code to help with composition events
      return true;
    }
  }

  function genSelect(el, value) {
    if ("development" !== 'production') {
      el.children.some(checkOptionWarning);
    }
    var code = value + '=Array.prototype.filter' + '.call($event.target.options,function(o){return o.selected})' + '.map(function(o){return "_value" in o ? o._value : o.value})' + (el.attrsMap.multiple == null ? '[0]' : '');
    addHandler(el, 'change', code);
    // need runtime to help with possible dynamically generated options
    return true;
  }

  function checkOptionWarning(option) {
    if (option.type === 1 && option.tag === 'option' && option.attrsMap.selected != null) {
      var parentModel = option.parent && option.parent.type === 1 && option.parent.attrsMap['v-model'];
      warn$3('<select v-model="' + parentModel + '">:\n' + 'inline selected attributes on <option> will be ignored when using v-model. ' + 'Declare initial values in the component\'s data option instead.');
      return true;
    }
  }

  function text(el, dir) {
    if (dir.value) {
      addProp(el, 'textContent', '_s(' + dir.value + ')');
    }
  }

  function html(el, dir) {
    if (dir.value) {
      addProp(el, 'innerHTML', '_s(' + dir.value + ')');
    }
  }

  var directives$1 = {
    model: model$1,
    text: text,
    html: html
  };

  var cache = Object.create(null);

  var baseOptions = {
    isIE: isIE,
    expectHTML: true,
    modules: modules$1,
    staticKeys: genStaticKeys(modules$1),
    directives: directives$1,
    isReservedTag: isReservedTag,
    isUnaryTag: isUnaryTag,
    mustUseProp: mustUseProp,
    getTagNamespace: getTagNamespace
  };

  function compile(template, options) {
    options = options ? extend(extend({}, baseOptions), options) : baseOptions;
    return compile$1(template, options);
  }

  function compileToFunctions(template, options, vm) {
    var _warn = options && options.warn || warn;
    // detect possible CSP restriction
    /* istanbul ignore if */
    if ("development" !== 'production') {
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          _warn('It seems you are using the standalone build of Vue.js in an ' + 'environment with Content Security Policy that prohibits unsafe-eval. ' + 'The template compiler cannot work in this environment. Consider ' + 'relaxing the policy to allow unsafe-eval or pre-compiling your ' + 'templates into render functions.');
        }
      }
    }
    var key = options && options.delimiters ? String(options.delimiters) + template : template;
    if (cache[key]) {
      return cache[key];
    }
    var res = {};
    var compiled = compile(template, options);
    res.render = makeFunction(compiled.render);
    var l = compiled.staticRenderFns.length;
    res.staticRenderFns = new Array(l);
    for (var i = 0; i < l; i++) {
      res.staticRenderFns[i] = makeFunction(compiled.staticRenderFns[i]);
    }
    if ("development" !== 'production') {
      if (res.render === noop || res.staticRenderFns.some(function (fn) {
        return fn === noop;
      })) {
        _warn('failed to compile template:\n\n' + template + '\n\n' + detectErrors(compiled.ast).join('\n') + '\n\n', vm);
      }
    }
    return cache[key] = res;
  }

  function makeFunction(code) {
    try {
      return new Function(code);
    } catch (e) {
      return noop;
    }
  }

  var idToTemplate = cached(function (id) {
    var el = query(id);
    return el && el.innerHTML;
  });

  var mount = Vue.prototype.$mount;
  Vue.prototype.$mount = function (el, hydrating) {
    el = el && query(el);
    var options = this.$options;
    // resolve template/el and convert to render function
    if (!options.render) {
      var template = options.template;
      if (template) {
        if (typeof template === 'string') {
          if (template.charAt(0) === '#') {
            template = idToTemplate(template);
          }
        } else if (template.nodeType) {
          template = template.innerHTML;
        } else {
          if ("development" !== 'production') {
            warn('invalid template option:' + template, this);
          }
          return this;
        }
      } else if (el) {
        template = getOuterHTML(el);
      }
      if (template) {
        var _compileToFunctions = compileToFunctions(template, {
          delimiters: options.delimiters,
          warn: warn
        }, this);

        var render = _compileToFunctions.render;
        var staticRenderFns = _compileToFunctions.staticRenderFns;

        options.render = render;
        options.staticRenderFns = staticRenderFns;
      }
    }
    return mount.call(this, el, hydrating);
  };

  /**
   * Get outerHTML of elements, taking care
   * of SVG elements in IE as well.
   */
  function getOuterHTML(el) {
    if (el.outerHTML) {
      return el.outerHTML;
    } else {
      var container = document.createElement('div');
      container.appendChild(el.cloneNode(true));
      return container.innerHTML;
    }
  }

  Vue.compile = compileToFunctions;

  return Vue;

}));