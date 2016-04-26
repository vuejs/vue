'use strict';

/**
 * Convert a value to a string that is actually rendered.
 *
 * @param {*} val
 * @return {String}
 */

function renderString(val) {
  return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 *
 * @param {String} str
 * @param {Boolean} expectsLowerCase
 * @return {Function}
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
 *
 * @param {Array} arr
 * @param {*} item
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
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if value is primitive
 *
 * @param {*} value
 * @return {Boolean}
 */

function isPrimitive(value) {
  return typeof value === 'string' || typeof value === 'number';
}

/**
 * Create a cached version of a pure function.
 *
 * @param {Function} fn
 * @return {Function}
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
 *
 * @param {String} str
 * @return {String}
 */

var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, toUpper);
});

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

var hyphenateRE = /([a-z\d])([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
});

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

function bind(fn, ctx) {
  return function (a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  };
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
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
 *
 * @param {Object} to
 * @param {Object} from
 */

function extend(to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var isArray = Array.isArray;

/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Define a property.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
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
    path = path.split('.');
    return function (obj) {
      for (var i = 0; i < path.length; i++) {
        if (!obj) return;
        obj = obj[path[i]];
      }
      return obj;
    };
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
var isWechat = UA && UA.indexOf('micromessenger') > 0;

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
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !(isWechat && isIos)) {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
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

var _Set = void 0;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function _Set() {
    this.set = Object.create(null);
  };
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined;
  };
  _Set.prototype.add = function (key) {
    this.set[key] = 1;
  };
  _Set.prototype.clear = function () {
    this.set = Object.create(null);
  };
}

var config = {

  /**
   * Preserve whitespaces between elements.
   */

  preserveWhitespace: true,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */

  isReservedTag: function isReservedTag() {
    return false;
  },

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */

  isUnknownElement: function isUnknownElement() {
    return false;
  },

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: ['component', 'directive', 'transition'],

  /**
   * List of lifecycle hooks.
   *
   * @type {Array}
   */

  _lifecycleHooks: ['init', 'created', 'beforeMount', 'mounted', 'ready', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'],

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100
};

var warn = void 0;
var formatComponentName = void 0;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';

    warn = function warn(msg, vm) {
      if (hasConsole && !config.silent) {
        console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
      }
    };

    formatComponentName = function formatComponentName(vm) {
      var name = vm._isVue ? vm.$options.name : vm.name;
      return name ? ' (found in component: <' + hyphenate(name) + '>)' : '';
    };
  })();
}

var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */

function Dep() {
  this.id = uid$1++;
  this.subs = [];
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  remove(this.subs, sub);
};

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

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
    var inserted;
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
  shouldConvert: true
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  def(value, '__ob__', this);
  if (isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  for (var key in obj) {
    this.convert(key, obj[key]);
  }
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val);
};

/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  remove(this.vms, vm);
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} src
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
 * @param {Object|Array} target
 * @param {Object} proto
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
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

function observe(value, vm) {
  if (!isObject(value)) {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (observerState.shouldConvert && (isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 */

function defineReactive(obj, key, val) {
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
        if (isArray(value)) {
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
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @public
 */

function set(obj, key, val) {
  if (isArray(obj)) {
    return obj.splice(key, 1, val);
  }
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  if (obj._isVue) {
    set(obj._data, key, val);
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  ob.convert(key, val);
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      proxy(vm, key);
      vm.$forceUpdate();
    }
  }
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 *
 * @param {Object} obj
 * @param {String} key
 */

function del(obj, key) {
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  var ob = obj.__ob__;

  if (!ob) {
    if (obj._isVue) {
      delete obj._data[key];
      obj.$forceUpdate();
    }
    return;
  }
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      unproxy(vm, key);
      vm.$forceUpdate();
    }
  }
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

function unproxy(vm, key) {
  if (!isReserved(key)) {
    delete vm[key];
  }
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
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
      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
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
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

function mergeHook(parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
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
  var res = Object.create(parentVal);
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
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !isArray(parent)) {
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
 *
 * @param {Object} options
 */

function guardComponents(options) {
  if (options.components) {
    var components = options.components;
    var def;
    for (var key in components) {
      if (isBuiltInTag(key) || config.isReservedTag(key)) {
        process.env.NODE_ENV !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
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
 *
 * @param {Object} options
 */

function guardProps(options) {
  var props = options.props;
  if (!props) return;
  var res = {};
  var i = void 0,
      val = void 0,
      name = void 0;
  if (isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (process.env.NODE_ENV !== 'production') {
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

function guardDirectives(options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      if (typeof dirs[key] === 'function') {
        dirs[key] = { update: dirs[key] };
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

function mergeOptions(parent, child, vm) {
  guardComponents(child);
  guardProps(child);
  guardDirectives(child);
  if (process.env.NODE_ENV !== 'production') {
    if (child.propsData && !vm) {
      warn('propsData can only be used as an instantiation option.');
    }
  }
  var options = {};
  var key;
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
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
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @param {Boolean} warnMissing
 * @return {Object|Function}
 */

function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }
  var assets = options[type];
  var camelizedId;
  var res = assets[id] ||
  // camelCase ID
  assets[camelizedId = camelize(id)] ||
  // Pascal Case ID
  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

function validateProp(vm, key, propsData) {
  if (!propsData) return;
  var prop = vm.$options.props[key];
  var absent = hasOwn(propsData, key);
  var value = propsData[key];
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    observerState.shouldConvert = true;
    observe(value);
    observerState.shouldConvert = false;
  }
  if (process.env.NODE_ENV !== 'production') {
    assertProp(prop, key, value, vm, absent);
  }
  return value;
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @return {*}
 */

function getPropDefaultValue(vm, prop, name) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    // absent boolean value defaults to false
    return prop.type === Boolean ? false : undefined;
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn('Invalid default value for prop "' + name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function ? def.call(vm) : def;
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {String} name
 * @param {*} value
 * @param {Vue} vm
 * @param {Boolean} absent
 */

function assertProp(prop, name, value, vm, absent) {
  if (prop.required && absent) {
    process.env.NODE_ENV !== 'production' && warn('Missing required prop: "' + name + '"', vm);
    return false;
  }
  if (value == null) {
    return true;
  }
  var type = prop.type;
  var valid = !type;
  var expectedTypes = [];
  if (type) {
    if (!isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType);
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    if (process.env.NODE_ENV !== 'production') {
      warn('Invalid prop: type check failed for prop "' + name + '".' + ' Expected ' + expectedTypes.map(formatType).join(', ') + ', got ' + formatValue(value) + '.', vm);
    }
    return false;
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
      return false;
    }
  }
  return true;
}

/**
 * Assert the type of a value
 *
 * @param {*} value
 * @param {Function} type
 * @return {Object}
 */

function assertType(value, type) {
  var valid;
  var expectedType;
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
    expectedType = 'object';
    valid = isPlainObject(value);
  } else if (type === Array) {
    expectedType = 'array';
    valid = isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  };
}

/**
 * Format type for output
 *
 * @param {String} type
 * @return {String}
 */

function formatType(type) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'custom type';
}

/**
 * Format value
 *
 * @param {*} value
 * @return {String}
 */

function formatValue(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
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
	hyphenate: hyphenate,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	isArray: isArray,
	isReserved: isReserved,
	def: def,
	parsePath: parsePath,
	hasProto: hasProto,
	inBrowser: inBrowser,
	devtools: devtools,
	nextTick: nextTick,
	get _Set () { return _Set; },
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	get warn () { return warn; },
	validateProp: validateProp
});

var hasProxy = void 0;
var proxyHandlers = void 0;
var initProxy = void 0;
if (process.env.NODE_ENV !== 'production') {
  (function () {
    var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' + 'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' + 'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl');

    hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/);

    proxyHandlers = {
      has: function has(target, key) {
        var has = key in target;
        var isAllowedGlobal = allowedGlobals(key);
        if (!has && !isAllowedGlobal) {
          warn('Trying to access non-existent property "' + key + '" while rendering.', target);
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

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.

var queueIndex;
var queue = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;
var internalQueueDepleted = false;

/**
 * Reset the batcher's state.
 */

function resetBatcherState() {
  queue = [];
  userQueue = [];
  has = {};
  circular = {};
  waiting = internalQueueDepleted = false;
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue() {
  queue.sort(queueSorter);
  runBatcherQueue(queue);
  internalQueueDepleted = true;
  runBatcherQueue(userQueue);
  resetBatcherState();
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
 *
 * @param {Array} queue
 */

function runBatcherQueue(queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (queueIndex = 0; queueIndex < queue.length; queueIndex++) {
    var watcher = queue[queueIndex];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn('You may have an infinite update loop for watcher ' + 'with expression "' + watcher.expression + '"', watcher.vm);
        break;
      }
    }
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

function pushWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    if (internalQueueDepleted && !watcher.user) {
      // an internal watcher triggered by a user watcher...
      // let's run it immediately after current user watcher is done.
      userQueue.splice(queueIndex + 1, 0, watcher);
    } else {
      // push watcher into appropriate queue
      var q = watcher.user ? userQueue : queue;
      has[id] = q.length;
      q.push(watcher);
      // queue the flush
      if (!waiting) {
        waiting = true;
        nextTick(flushBatcherQueue);
      }
    }
  }
}

var uid$2 = 0;
var prevTarget = void 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String|Function} expOrFn
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */

function Watcher(vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options);
  }
  var isFn = typeof expOrFn === 'function';
  this.vm = vm;
  vm._watchers.push(this);
  this.expression = expOrFn;
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  // parse expression for getter
  if (isFn) {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      process.env.NODE_ENV !== 'production' && warn('Failed watching path: ' + expOrFn + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
    }
  }
  this.value = this.lazy ? undefined : this.get();
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false;
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet();
  var value = this.getter.call(this.vm, this.vm);
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

Watcher.prototype.beforeGet = function () {
  prevTarget = Dep.target;
  Dep.target = this;
};

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
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

Watcher.prototype.afterGet = function () {
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
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
    this.queued = true;
    pushWatcher(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated; but only do so if this is a
    // non-shallow update (caused by a vm digest).
    (isObject(value) || this.deep) && !this.shallow) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
    this.queued = this.shallow = false;
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
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

Watcher.prototype.depend = function () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
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
    this.vm = this.cb = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {*} val
 * @param {Set} seen
 */

var seenObjects = new _Set();
function traverse(val, seen) {
  var i = void 0,
      keys = void 0,
      isA = void 0,
      isO = void 0;
  if (!seen) {
    seen = seenObjects;
    seen.clear();
  }
  isA = isArray(val);
  isO = isObject(val);
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
    var keys = vm.$options.propKeys = Object.keys(props);
    var isRoot = !vm.$parent;
    // root instance props should be converted
    observerState.shouldConvert = isRoot;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      defineReactive(vm, key, validateProp(vm, key, propsData));
    }
    observerState.shouldConvert = true;
  }
}

function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? data() : data || {};
  if (!isPlainObject(data)) {
    data = {};
    process.env.NODE_ENV !== 'production' && warn('data functions should return an object.', vm);
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var i = keys.length;
  while (i--) {
    proxy(vm, keys[i]);
  }
  // observe data
  observe(data, vm);
}

function noop() {}

function initComputed(vm) {
  var computed = vm.$options.computed;
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key];
      var def = {
        enumerable: true,
        configurable: true
      };
      if (typeof userDef === 'function') {
        def.get = makeComputedGetter(userDef, vm);
        def.set = noop;
      } else {
        def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, vm) : bind(userDef.get, vm) : noop;
        def.set = userDef.set ? bind(userDef.set, vm) : noop;
      }
      Object.defineProperty(vm, key, def);
    }
  }
}

function makeComputedGetter(getter, owner) {
  var watcher = new Watcher(owner, getter, null, {
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
    for (var key in methods) {
      vm[key] = bind(methods[key], vm);
    }
  }
}

function initWatch(vm) {
  var watch = vm.$options.watch;
  if (watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
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
  Object.defineProperty(Vue.prototype, '$data', {
    get: function get() {
      return this._data;
    },
    set: function set(newData) {
      if (newData !== this._data) {
        setData(this, newData);
      }
    }
  });

  Vue.prototype.$watch = function (fn, cb, options) {
    options = options || {};
    options.user = true;
    var watcher = new Watcher(this, fn, cb, options);
    if (options.immediate) {
      cb.call(this, watcher.value);
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
  var keys, key, i;
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
  oldData.__ob__.removeVm(vm);
  observe(newData, vm);
  vm.$forceUpdate();
}

function VNode(tag, data, children, text, elm, ns, context) {
  return {
    tag: tag,
    data: data,
    children: children,
    text: text,
    elm: elm,
    ns: ns,
    context: context,
    key: data && data.key
  };
}

function flatten(children) {
  if (typeof children === 'string') {
    return [VNode(undefined, undefined, undefined, children)];
  }
  if (isArray(children)) {
    var res = [];
    for (var i = 0, l = children.length; i < l; i++) {
      var c = children[i];
      // flatten nested
      if (isArray(c)) {
        res.push.apply(res, flatten(c));
      } else if (isPrimitive(c)) {
        // convert primitive to vnode
        res.push(VNode(undefined, undefined, undefined, c));
      } else if (c) {
        res.push(c);
      }
    }
    return res;
  }
}

function updateListeners(on, oldOn, add) {
  var name = void 0,
      cur = void 0,
      old = void 0,
      event = void 0,
      capture = void 0;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (old === undefined) {
      capture = name.charAt(0) === '!';
      event = capture ? name.slice(1) : name;
      if (isArray(cur)) {
        add(event, arrInvoker(cur), capture);
      } else {
        cur = { fn: cur };
        on[name] = cur;
        add(event, fnInvoker(cur), capture);
      }
    } else if (isArray(old)) {
      old.length = cur.length;
      for (var i = 0; i < old.length; i++) {
        old[i] = cur[i];
      }on[name] = old;
    } else {
      old.fn = cur;
      on[name] = old;
    }
  }
}

function arrInvoker(arr) {
  return function (ev) {
    for (var i = 0; i < arr.length; i++) {
      arr[i](ev);
    }
  };
}

function fnInvoker(o) {
  return function (ev) {
    o.fn(ev);
  };
}

function initLifecycle(vm) {
  var options = vm.$options;

  vm.$parent = options.parent;
  vm.$root = vm.$parent ? vm.$parent.$root : vm;
  if (vm.$parent) {
    vm.$parent.$children.push(vm);
  }

  vm.$children = [];
  vm.$refs = {};

  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin(Vue) {
  Vue.prototype._mount = function () {
    var _this = this;

    if (!this.$options.render) {
      this.$options.render = function () {
        return _this.$createElement('div');
      };
      if (process.env.NODE_ENV !== 'production') {
        if (this.$options.template) {
          warn('You are using the runtime-only build of Vue where the template ' + 'option is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', this);
        } else {
          warn('Failed to mount component: template or render function not defined.', this);
        }
      }
    }
    // render static sub-trees for once on mount
    var staticRenderFns = this.$options.staticRenderFns;
    if (staticRenderFns) {
      this._staticTrees = new Array(staticRenderFns.length);
      for (var i = 0; i < staticRenderFns.length; i++) {
        this._staticTrees[i] = staticRenderFns[i].call(this._renderProxy);
      }
    }
    this._watcher = new Watcher(this, this._render, this._update);
    this._update(this._watcher.value);
    this._mounted = true;
    // root instance, call ready on self
    if (this.$root === this) {
      callHook(this, 'ready');
    }
    return this;
  };

  Vue.prototype._update = function (vnode) {
    if (this._mounted) {
      callHook(this, 'beforeUpdate');
    }
    var parentNode = this.$options._parentVnode;
    // set vnode parent before patch
    vnode.parent = parentNode;
    if (!this._vnode) {
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      this.$el = this.__patch__(this.$el, vnode);
    } else {
      this.$el = this.__patch__(this._vnode, vnode);
    }
    this._vnode = vnode;
    // set parent vnode element after patch
    if (parentNode) {
      parentNode.elm = this.$el;
    }
    if (this._mounted) {
      callHook(this, 'updated');
    }
  };

  Vue.prototype._updateFromParent = function (propsData, listeners, parentVnode, children) {
    var _this2 = this;

    this.$options._parentVnode = parentVnode;
    this.$options._renderChildren = children;
    // update props
    if (propsData && this.$options.props) {
      observerState.shouldConvert = false;
      var propKeys = this.$options.propKeys;
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        this[key] = validateProp(this, key, propsData);
      }
      observerState.shouldConvert = true;
    }
    // update listeners
    if (listeners) {
      var oldListeners = this.$options._parentListeners;
      this.$options._parentListeners = listeners;
      updateListeners(listeners, oldListeners || {}, function (event, handler) {
        _this2.$on(event, handler);
      });
    }
  };

  Vue.prototype.$forceUpdate = function () {
    this._watcher.update();
  };

  Vue.prototype.$destroy = function () {
    if (this._isDestroyed) {
      return;
    }
    callHook(this, 'beforeDestroy');
    this._isBeingDestroyed = true;
    // remove self from parent
    var parent = this.$parent;
    if (parent && !parent._isBeingDestroyed) {
      remove(parent.$children, this);
    }
    // unregister ref
    if (this._ref) {
      this._context.$refs[this._ref] = undefined;
    }
    // teardown watchers
    var i = this._watchers.length;
    while (i--) {
      this._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data.__ob__) {
      this._data.__ob__.removeVm(this);
    }
    // call the last hook...
    this._isDestroyed = true;
    callHook(this, 'destroyed');
    // turn off all instance listeners.
    this.$off();
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

function createComponent(Ctor, data, parent, children, context) {
  if (process.env.NODE_ENV !== 'production' && children && typeof children !== 'function') {
    warn('A component\'s children should be a function that returns the ' + 'children array. This allows the component to track the children ' + 'dependencies and optimizes re-rendering.');
  }
  if (!Ctor) {
    return;
  }
  if (isObject(Ctor)) {
    Ctor = Vue.extend(Ctor);
  }
  if (process.env.NODE_ENV !== 'production' && typeof Ctor !== 'function') {
    warn('Invalid Component definition: ' + Ctor, parent);
    return;
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved;
    } else {
      resolveAsyncComponent(Ctor, function () {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered.
        parent.$forceUpdate();
      });
      return;
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
    data.on = null;
  }

  // return a placeholder vnode
  var name = Ctor.options.name ? '-' + Ctor.options.name : '';
  var vnode = VNode('vue-component-' + Ctor.cid + name, data, undefined, undefined, undefined, undefined, context);
  vnode.componentOptions = { Ctor: Ctor, propsData: propsData, listeners: listeners, parent: parent, children: children };
  return vnode;
}

function init(vnode) {
  var _vnode$componentOptio = vnode.componentOptions;
  var Ctor = _vnode$componentOptio.Ctor;
  var propsData = _vnode$componentOptio.propsData;
  var listeners = _vnode$componentOptio.listeners;
  var parent = _vnode$componentOptio.parent;
  var children = _vnode$componentOptio.children;

  var child = new Ctor({
    parent: parent,
    propsData: propsData,
    _parentVnode: vnode,
    _parentListeners: listeners,
    _renderChildren: children
  });
  // if this is a server-rendered mount,
  // the vnode would already have an element.
  // otherwise the child sets the parent vnode's elm when mounted
  // and when updated.
  child.$mount(vnode.elm);
  vnode.child = child;
}

function prepatch(oldVnode, vnode) {
  var _vnode$componentOptio2 = vnode.componentOptions;
  var listeners = _vnode$componentOptio2.listeners;
  var propsData = _vnode$componentOptio2.propsData;
  var children = _vnode$componentOptio2.children;

  vnode.child = oldVnode.child;
  vnode.child._updateFromParent(propsData, // updated props
  listeners, // updated listeners
  vnode, // new parent vnode
  children // new children
  );
}

function insert(vnode) {
  callHook(vnode.child, 'ready');
}

function destroy(vnode) {
  vnode.child.$destroy();
}

function resolveAsyncComponent(factory, cb) {
  if (factory.resolved) {
    // cached
    cb(factory.resolved);
  } else if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb);
  } else {
    (function () {
      factory.requested = true;
      var cbs = factory.pendingCallbacks = [cb];
      factory(function resolve(res) {
        if (isObject(res)) {
          res = Vue.extend(res);
        }
        // cache resolved
        factory.resolved = res;
        // invoke callbacks
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res);
        }
      }, function reject(reason) {
        process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component: ' + factory + (reason ? '\nReason: ' + reason : ''));
      });
    })();
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
  if (!attrs && !props) {
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

function createElement(tag, data, children, namespace) {
  var context = this;
  var parent = renderState.activeInstance;
  if (typeof tag === 'string') {
    var Ctor = void 0;
    if (config.isReservedTag(tag)) {
      return VNode(tag, data, flatten(children), undefined, undefined, namespace, context);
    } else if (Ctor = resolveAsset(context.$options, 'components', tag)) {
      return createComponent(Ctor, data, parent, children, context);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (!namespace && config.isUnknownElement(tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.');
        }
      }
      return VNode(tag, data, flatten(children && children()), undefined, undefined, namespace, context);
    }
  } else {
    return createComponent(tag, data, parent, children, context);
  }
}

var renderState = {
  activeInstance: null
};

function initRender(vm) {
  vm._vnode = null;
  vm._mounted = false;
  vm._staticTrees = null;
  vm.$slots = {};
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind(createElement, vm);
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
}

function renderMixin(Vue) {
  Vue.prototype._render = function () {
    var prev = renderState.activeInstance;
    renderState.activeInstance = this;
    var _$options = this.$options;
    var render = _$options.render;
    var _renderChildren = _$options._renderChildren;
    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.

    if (_renderChildren) {
      resolveSlots(this, _renderChildren);
    }
    // render self
    var vnode = render.call(this._renderProxy);
    // restore render state
    renderState.activeInstance = prev;
    return vnode;
  };

  // shorthands used in render functions
  Vue.prototype.__h__ = createElement;

  // toString for mustaches
  Vue.prototype.__toString__ = renderString;

  // render v-for
  Vue.prototype.__renderList__ = function (val, render) {
    var ret = void 0,
        i = void 0,
        l = void 0,
        keys = void 0,
        key = void 0;
    if (isArray(val)) {
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

  // register ref
  Vue.prototype.__registerRef__ = function (key, ref, vFor, remove) {
    var refs = this.$refs;
    if (remove) {
      if (vFor) {
        remove(refs[key], ref);
      } else {
        refs[key] = undefined;
      }
    } else {
      if (vFor) {
        if (refs[key]) {
          refs[key].push(ref);
        } else {
          refs[key] = [ref];
        }
      } else {
        refs[key] = ref;
      }
    }
  };
}

function resolveSlots(vm, children) {
  if (children) {
    children = flatten(isArray(children) ? children : children());
    var slots = { default: children };
    var i = children.length;
    var name = void 0,
        child = void 0;
    while (i--) {
      child = children[i];
      if (name = child.data && child.data.slot) {
        var slot = slots[name] || (slots[name] = []);
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children);
        } else {
          slot.push(child);
        }
        children.splice(i, 1);
      }
    }
    vm.$slots = slots;
  }
}

function initEvents(vm) {
  vm._events = Object.create(null);
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateListeners(listeners, {}, function (event, handler) {
      vm.$on(event, handler);
    });
  }
}

function eventsMixin(Vue) {
  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this;
    function on() {
      self.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs;
    // all
    if (!arguments.length) {
      this._events = Object.create(null);
      return this;
    }
    // specific event
    cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (arguments.length === 1) {
      this._events[event] = null;
      return this;
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Trigger an event on self.
   *
   * @param {String} event
   */

  Vue.prototype.$emit = function (event) {
    var cbs = this._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(this, args);
      }
    }
  };
}

var uid = 0;

function Vue(options) {
  this._init(options);
}

Vue.prototype._init = function (options) {
  // a uid
  this._uid = uid++;
  // a flag to avoid this being observed
  this._isVue = true;
  // merge options
  this.$options = mergeOptions(this.constructor.options, options || {}, this);
  if (process.env.NODE_ENV !== 'production') {
    initProxy(this);
  } else {
    this._renderProxy = this;
  }
  initLifecycle(this);
  initEvents(this);
  callHook(this, 'init');
  initState(this);
  callHook(this, 'created');
  initRender(this);
};

Vue.prototype.$nextTick = function (fn) {
  nextTick(fn, this);
};

stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

function initUse(Vue) {
  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

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

function initMixin(Vue) {
  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
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
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
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
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };
}

function initAssetRegisters(Vue) {
  /**
     * Create asset registration methods with the following
     * signature:
     *
     * @param {String} id
     * @param {*} definition
     */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && config.isReservedTag(id)) {
            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = id;
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}

function initGlobalAPI(Vue) {
  Vue.config = config;
  Vue.util = util;
  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = {
    directives: Object.create(null),
    filters: Object.create(null),
    components: Object.create(null),
    transitions: Object.create(null)
  };

  initUse(Vue);
  initMixin(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);

Vue.version = '2.0.0-alpha.0';

var emptyNode = VNode('', {}, []);
var hooks$1 = ['create', 'update', 'remove', 'destroy'];

function isUndef(s) {
  return s === undefined;
}

function isDef(s) {
  return s !== undefined;
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
    return VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
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
        return vnode.elm;
      }
    }
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      elm = vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag);
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
      }if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
      if (isDef(i = vnode.child)) {
        invokeDestroyHook(i._vnode);
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
            if (process.env.NODE_ENV !== 'production' && !elmToMove) {
              warn('Duplicate track-by key: ' + idxInOld + '. ' + 'Make sure each v-for item has a unique track-by key.');
            }
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
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
    var i = void 0,
        hook = void 0;
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    // skip nodes with v-pre
    if (isDef(i = vnode.data) && i.pre) {
      return;
    }
    var elm = vnode.elm = oldVnode.elm;
    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (oldVnode === vnode) return;
    if (!sameVnode(oldVnode, vnode)) {
      var parentElm = nodeOps.parentNode(oldVnode.elm);
      elm = createElm(vnode, insertedVnodeQueue);
      nodeOps.insertBefore(parentElm, elm, oldVnode.elm);
      removeVnodes(parentElm, [oldVnode], 0, 0);
      return;
    }
    if (isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVnode, vnode);
      }i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
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
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  function invokeInsertHook(queue) {
    for (i = 0; i < queue.length; ++i) {
      queue[i].data.hook.insert(queue[i]);
    }
  }

  function hydrate(elm, vnode, insertedVnodeQueue) {
    if (process.env.NODE_ENV !== 'production') {
      if (!assertNodeMatch(elm, vnode)) {
        return false;
      }
    }
    vnode.elm = elm;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
      if (isDef(i = vnode.child)) {
        // child component. it should have hydrated its own tree.
        invokeCreateHooks(vnode, insertedVnodeQueue);
        return true;
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        var childNodes = elm.childNodes;
        for (var _i2 = 0; _i2 < children.length; _i2++) {
          var success = hydrate(childNodes[_i2], children[_i2], insertedVnodeQueue);
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
        return vnode.tag === node.tagName.toLowerCase() && (vnode.children ? vnode.children.length === node.childNodes.length : node.childNodes.length === 0);
      }
    } else {
      return renderString(vnode.text) === node.data;
    }
  }

  return function patch(oldVnode, vnode) {
    var elm, parent;
    var insertedVnodeQueue = [];

    if (!oldVnode) {
      // empty mount, create new root element
      createElm(vnode, insertedVnodeQueue);
    } else {
      if (sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue);
      } else {
        if (isUndef(oldVnode.tag)) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.hasAttribute('server-rendered')) {
            oldVnode.removeAttribute('server-rendered');
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(insertedVnodeQueue);
              return oldVnode;
            } else if (process.env.NODE_ENV !== 'production') {
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
        }
      }
    }

    invokeInsertHook(insertedVnodeQueue);
    return vnode.elm;
  };
}

// attributes that should be using props for binding
var mustUseProp = makeMap('value,selected,checked,muted');

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');

var xlinkNS = 'http://www.w3.org/1999/xlink';
var isXlink = function isXlink(name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
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
    class: child.class ? extend(child.class, parent.class) : parent.class
  };
}

function genClassFromData(data) {
  var dynamicClass = data.class;
  var staticClass = data.staticClass;
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass));
  }
}

function concat(a, b) {
  return a ? b ? a + ' ' + b : a : b || '';
}

function stringifyClass(value) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (isArray(value)) {
    var res = '';
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) res += stringifyClass(value[i]) + ' ';
    }
    return res.slice(0, -1);
  }
  if (isObject(value)) {
    var _res = '';
    for (var key in value) {
      if (value[key]) _res += key + ' ';
    }
    return _res.slice(0, -1);
  }
}

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isReservedTag = makeMap('html,base,head,link,meta,style,title,' + 'address,article,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,hr,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template');

var isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr', true);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source', true);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track', true);

// this map covers namespace elements that can appear as template root nodes
var isSVG = makeMap('svg,g,defs,symbol,use,image,text,circle,ellipse,' + 'line,path,polygon,polyline,rect', true);

var unknownElementCache = Object.create(null);
function isUnknownElement(tag) {
  if (!inBrowser) {
    return true;
  }
  tag = tag.toLowerCase();
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
var isIE9 = UA$1 && UA$1.indexOf('msie 9.0') > 0;
var isAndroid = UA$1 && UA$1.indexOf('android') > 0;

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
    }
  }
  return el;
}

function createElement$1(tagName) {
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
  return node.parentElement;
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

var nodeOps = Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
});

if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el);
    }
  });
}

var model = {
  bind: function bind(el) {
    if (!isAndroid) {
      el.addEventListener('compositionstart', onCompositionStart);
      el.addEventListener('compositionend', onCompositionEnd);
    }
    if (isIE9) {
      el.vmodel = true;
    }
  },
  unbind: function unbind(el) {
    if (!isAndroid) {
      el.removeEventListener('compositionstart', onCompositionStart);
      el.removeEventListener('compositionend', onCompositionEnd);
    }
  }
};

function onCompositionStart(e) {
  e.target.composing = true;
}

function onCompositionEnd(e) {
  e.target.composing = false;
  trigger(e.target);
}

function trigger(el) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent('input', true, true);
  el.dispatchEvent(e);
}

var svgNS = namespaceMap.svg;

/**
 * In IE9, setAttribute('class') will result in empty class
 * if the element also has the :class attribute; However in
 * PhantomJS, setting `className` does not work on SVG elements...
 * So we have to do a conditional check here.
 *
 * @param {Element} el
 * @param {String} cls
 */

function setClass(el, cls) {
  /* istanbul ignore else */
  if (!isIE9 || el.namespaceURI === svgNS) {
    el.setAttribute('class', cls);
  } else {
    el.className = cls;
  }
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function addClass(el, cls) {
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) {
        return el.classList.add(c);
      });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = ' ' + getClass(el) + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      setClass(el, (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function removeClass(el, cls) {
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) {
        return el.classList.remove(c);
      });
    } else {
      el.classList.remove(cls);
    }
  } else {
    var cur = ' ' + getClass(el) + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    setClass(el, cur.trim());
  }
  if (!el.className) {
    el.removeAttribute('class');
  }
}

/**
 * For IE9 compat: when both class and :class are present
 * getAttribute('class') returns wrong value... but className
 * on SVG elements returns an object.
 *
 * @param {Element} el
 * @return {String}
 */

function getClass(el) {
  var classname = el.className;
  if (typeof classname === 'object') {
    classname = classname.baseVal || '';
  }
  return classname;
}

var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = void 0;
var transitionEndEvent = void 0;
var animationProp = void 0;
var animationEndEvent = void 0;
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
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
  if (!vnode.context.$root._mounted && !data.appear) {
    return;
  }

  var _resolveTransition = resolveTransition(data.definition, vnode.context);

  var enterClass = _resolveTransition.enterClass;
  var enterActiveClass = _resolveTransition.enterActiveClass;
  var beforeEnter = _resolveTransition.beforeEnter;
  var enter = _resolveTransition.enter;
  var afterEnter = _resolveTransition.afterEnter;
  var enterCancelled = _resolveTransition.enterCancelled;


  var userWantsControl = enter && enter.length > 1;
  var cb = el._enterCb = once(function () {
    if (enterActiveClass) {
      removeTransitionClass(el, enterActiveClass);
    }
    if (cb.cancelled) {
      enterCancelled && enterCancelled(el);
    } else {
      afterEnter && afterEnter(el);
    }
    el._enterCb = null;
  });

  beforeEnter && beforeEnter(el);
  if (enterClass) {
    addTransitionClass(el, enterClass);
    nextFrame(function () {
      removeTransitionClass(el, enterClass);
    });
  }
  if (enterActiveClass) {
    nextFrame(function () {
      addTransitionClass(el, enterActiveClass);
      if (!userWantsControl) {
        whenTransitionEnds(el, cb);
      }
    });
  }
  enter && enter(el, cb);
  if (!enterActiveClass && !userWantsControl) {
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

  var _resolveTransition2 = resolveTransition(data.definition, vnode.context);

  var leaveClass = _resolveTransition2.leaveClass;
  var leaveActiveClass = _resolveTransition2.leaveActiveClass;
  var beforeLeave = _resolveTransition2.beforeLeave;
  var leave = _resolveTransition2.leave;
  var afterLeave = _resolveTransition2.afterLeave;
  var leaveCancelled = _resolveTransition2.leaveCancelled;


  var userWantsControl = leave && leave.length > 1;
  var cb = el._leaveCb = once(function () {
    if (leaveActiveClass) {
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  beforeLeave && beforeLeave(el);
  if (leaveClass) {
    addTransitionClass(el, leaveClass);
    nextFrame(function () {
      removeTransitionClass(el, leaveClass);
    });
  }
  if (leaveActiveClass) {
    nextFrame(function () {
      addTransitionClass(el, leaveActiveClass);
      if (!userWantsControl) {
        whenTransitionEnds(el, cb);
      }
    });
  }
  leave && leave(el, cb);
  if (!leaveActiveClass && !userWantsControl) {
    cb();
  }
}

function resolveTransition(id, context) {
  var definition = id && typeof id === 'string' ? resolveAsset(context.$options, 'transitions', id) || id : id;
  if (definition === true) definition = 'v';
  return typeof definition === 'string' ? autoCssTransition(definition) : definition;
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: name + '-enter',
    leaveClass: name + '-leave',
    enterActiveClass: name + '-enter-active',
    leaveActiveClass: name + '-leave-active'
  };
});

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
  }, timeout);
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
  return(
    // if this is a component root node and the compoennt's
    // parent container node also has transition, skip.
    vnode.parent && vnode.parent.data.transition ||
    // if the element has v-show, let the runtime directive
    // call the hooks instead
    vnode.data.show
  );
}

var transition = !transitionEndEvent ? {} : {
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
};

var show = {
  bind: function bind(el, value, _, vnode) {
    var transition = getTransition(vnode);
    if (value && transition && transition.appea && !isIE9) {
      enter(vnode);
    }
    el.style.display = value ? '' : 'none';
  },
  update: function update(el, value, _, vnode) {
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

var directives = {
  create: function bindDirectives(oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'bind');
  },
  update: function updateDirectives(oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'update', true);
  },
  destroy: function unbindDirectives(vnode) {
    applyDirectives(null, vnode, 'unbind');
  }
};

function applyDirectives(oldVnode, vnode, hook, update) {
  var dirs = vnode.data.directives;
  if (dirs) {
    for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i];
      var def = resolveAsset(vnode.context.$options, 'directives', dir.name, true);
      var fn = def && def[hook];
      if (fn) {
        // only call update if value has changed
        if (update) {
          var oldValue = oldVnode.data.directives[i].value;
          if (oldValue === dir.value) {
            continue;
          }
        }
        fn(vnode.elm, dir.value, dir.modifiers, vnode, oldVnode);
      }
    }
  }
}

var baseModules = [directives];

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
        elm.removeAttributeNS(xlinkNS, key);
      } else {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr(el, key, value) {
  if (isBooleanAttr(key)) {
    if (value == null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, key);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, value == null ? 'false' : 'true');
  } else if (isXlink(key)) {
    el.setAttributeNS(xlinkNS, key, value);
  } else {
    el.setAttribute(key, value);
  }
}

var attrs = {
  create: function create(_, vnode) {
    var attrs = vnode.data.staticAttrs;
    if (attrs) {
      for (var key in attrs) {
        if (!vnode.elm) debugger;
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
    setClass(el, cls);
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
  updateListeners(on, oldOn, function (event, handler, capture) {
    vnode.elm.addEventListener(event, handler, capture);
  });
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
      cur = void 0,
      old = void 0;
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
    old = oldProps[key];
    if (old !== cur) {
      if (key === 'value') {
        // store value as _value as well since
        // non-string values will be stringified
        if (elm._value !== cur) {
          elm.value = elm._value = cur;
        }
      } else {
        elm[key] = cur;
      }
    }
  }
}

var props = {
  create: updateProps,
  update: updateProps
};

var prefixes = ['Webkit', 'Moz', 'ms'];
var testEl = inBrowser && document.createElement('div');

var normalize = cached(function (prop) {
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
  if (isArray(style)) {
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
      elm.style[normalize(name)] = cur;
    }
  }
}

function toObject(arr) {
  var res = arr[0] || {};
  for (var i = 1; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

var style = {
  create: updateStyle,
  update: updateStyle
};

var platformModules = [attrs, klass, events, props, style, transition];

// install platform specific utils
Vue.config.isUnknownElement = isUnknownElement;
Vue.config.isReservedTag = isReservedTag;

// install platform runtime directives
Vue.options.directives = platformDirectives;

// install platform patch function
var modules = baseModules.concat(platformModules);
Vue.prototype.__patch__ = inBrowser ? createPatchFunction({ nodeOps: nodeOps, modules: modules }) : function noop() {};

// wrap mount
Vue.prototype.$mount = function (el) {
  this.$el = el && query(el);
  this._mount();
};

module.exports = Vue;