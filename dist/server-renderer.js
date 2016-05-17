'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var stream = _interopDefault(require('stream'));

var babelHelpers = {};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * Original RenderStream implmentation by Sasha Aickin (@aickin)
 * Licensed under the Apache License, Version 2.0
 * Modified by Evan You (@yyx990803)
 */

var RenderStream = function (_stream$Readable) {
  babelHelpers.inherits(RenderStream, _stream$Readable);

  function RenderStream(render) {
    var _this = babelHelpers.possibleConstructorReturn(this, _stream$Readable.call(this));

    _this.buffer = '';
    _this.render = render;
    _this.expectedSize = 0;
    _this.stackDepth = 0;

    _this.write = function (text, next) {
      var n = _this.expectedSize;
      _this.buffer += text;
      if (_this.buffer.length >= n) {
        _this.next = next;
        _this.pushBySize(n);
      } else {
        // continue rendering until we have enough text to call this.push().
        // sometimes do this as process.nextTick to get out of stack overflows.
        if (_this.stackDepth >= MAX_STACK_DEPTH) {
          process.nextTick(function () {
            try {
              next();
            } catch (e) {
              _this.emit('error', e);
            }
          });
        } else {
          _this.stackDepth++;
          next();
          _this.stackDepth--;
        }
      }
    };

    _this.end = function () {
      // the rendering is finished; we should push out the last of the buffer.
      _this.done = true;
      _this.push(_this.buffer);
    };
    return _this;
  }

  RenderStream.prototype.pushBySize = function pushBySize(n) {
    var bufferToPush = this.buffer.substring(0, n);
    this.buffer = this.buffer.substring(n);
    this.push(bufferToPush);
  };

  RenderStream.prototype.tryRender = function tryRender() {
    try {
      this.render(this.write, this.end);
    } catch (e) {
      this.emit('error', e);
    }
  };

  RenderStream.prototype.tryNext = function tryNext() {
    try {
      this.next();
    } catch (e) {
      this.emit('error', e);
    }
  };

  RenderStream.prototype._read = function _read(n) {
    this.expectedSize = n;
    // it's possible that the last chunk added bumped the buffer up to > 2 * n,
    // which means we will need to go through multiple read calls to drain it
    // down to < n.
    if (this.done) {
      this.push(null);
      return;
    }
    if (this.buffer.length >= n) {
      this.pushBySize(n);
      return;
    }
    if (!this.next) {
      // start the rendering chain.
      this.tryRender();
    } else {
      // continue with the rendering.
      this.tryNext();
    }
  };

  return RenderStream;
}(stream.Readable);

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
  var timerFunc = void 0;
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

var config = {

  /**
   * Preserve whitespaces between elements.
   */
  preserveWhitespace: true,

  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: function isReservedTag(_) {
    return false;
  },

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: function isUnknownElement(_) {
    return false;
  },

  /**
   * List of asset types that a component can own.
   */
  _assetTypes: ['component', 'directive', 'transition', 'filter'],

  /**
   * List of lifecycle hooks.
   */
  _lifecycleHooks: ['init', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100,

  /**
   * Server rendering?
   */
  _isServer: process.env.VUE_ENV === 'server'
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
 */

var Dep = function () {
  function Dep() {
    this.id = uid$1++;
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
  shouldConvert: true
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function () {
  function Observer(value) {
    this.value = value;
    this.dep = new Dep();
    this.vms = null;
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

  /**
   * Add an owner vm, so that when $set/$delete mutations
   * happen we can notify owner vms to proxy the keys and
   * digest the watchers. This is only called when the object
   * is observed as an instance's root $data.
   */


  Observer.prototype.addVm = function addVm(vm) {
    (this.vms || (this.vms = [])).push(vm);
  };

  /**
   * Remove an owner vm. This is called when the object is
   * swapped out as an instance's $data object.
   */


  Observer.prototype.removeVm = function removeVm(vm) {
    remove(this.vms, vm);
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
function observe(value, vm) {
  if (!isObject(value)) {
    return;
  }
  var ob = void 0;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (observerState.shouldConvert && !config._isServer && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
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
  if (obj._isVue) {
    process.env.NODE_ENV !== 'production' && warn('Do not add reactive properties to a Vue instance at runtime - ' + 'delcare it upfront in the data option.');
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  defineReactive(ob.value, key, val);
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

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (process.env.NODE_ENV !== 'production') {
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
 * Hooks and param attributes are merged as arrays.
 */
function mergeHook$1(parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal] : parentVal;
}

config._lifecycleHooks.forEach(function (hook) {
  strats[hook] = mergeHook$1;
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
function guardComponents(options) {
  if (options.components) {
    var components = options.components;
    var def = void 0;
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
 */
function guardProps(options) {
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

/**
 * Normalize raw function directives into object format.
 */
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
  var extendsFrom = child.extends;
  if (extendsFrom) {
    parent = typeof extendsFrom === 'function' ? mergeOptions(parent, extendsFrom.options, vm) : mergeOptions(parent, extendsFrom, vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
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
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

function validateProp(vm, key, propsData) {
  if (!vm.$options.props || !propsData) return;
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
 */
function assertProp(prop, name, value, vm, absent) {
  if (prop.required && absent) {
    warn('Missing required prop: "' + name + '"', vm);
    return;
  }
  if (value == null) {
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
    warn('Invalid prop: type check failed for prop "' + name + '".' + ' Expected ' + expectedTypes.join(', ') + ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.', vm);
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
  if (process.env.NODE_ENV !== 'production') {
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
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
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

var uid$2 = 0;
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
    this.id = ++uid$2; // uid for batching
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
        process.env.NODE_ENV !== 'production' && warn('Failed watching path: ' + expOrFn + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
      }
    }
    this.value = this.lazy ? undefined : this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */


  Watcher.prototype.get = function get() {
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
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      defineReactive(vm, key, validateProp(vm, key, propsData));
    }
    observerState.shouldConvert = true;
  }
}

function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};
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

var computedSharedDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function initComputed(vm) {
  var computed = vm.$options.computed;
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key];
      if (typeof userDef === 'function') {
        computedSharedDefinition.get = makeComputedGetter(userDef, vm);
        computedSharedDefinition.set = noop;
      } else {
        computedSharedDefinition.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, vm) : bind(userDef.get, vm) : noop;
        computedSharedDefinition.set = userDef.set ? bind(userDef.set, vm) : noop;
      }
      Object.defineProperty(vm, key, computedSharedDefinition);
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
      if (Array.isArray(handler)) {
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
  oldData.__ob__.removeVm(vm);
  observe(newData, vm);
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
  }

  VNode.prototype.setChildren = function setChildren(children) {
    this.children = children;
  };

  return VNode;
}();

var emptyVNode = new VNode(undefined, undefined, undefined, '');

var whitespace = new VNode(undefined, undefined, undefined, ' ');

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
        // optimize whitespace
        if (c === ' ') {
          res.push(whitespace);
        } else {
          // convert primitive to vnode
          res.push(new VNode(undefined, undefined, undefined, c));
        }
      } else if (c instanceof VNode) {
        res.push(c);
      }
    }
    return res;
  }
  return [];
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
      if (Array.isArray(cur)) {
        add(event, arrInvoker(cur), capture);
      } else {
        cur = { fn: cur };
        on[name] = cur;
        add(event, fnInvoker(cur), capture);
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

function renderElementWithChildren(vnode, children) {
  if (vnode) {
    if (vnode.componentOptions) {
      if (process.env.NODE_ENV !== 'production' && children && typeof children !== 'function') {
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
  var context = this;
  var parent = renderState.activeInstance;
  if (!parent) {
    process.env.NODE_ENV !== 'production' && warn('createElement cannot be called outside of component ' + 'render functions.');
    return;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode;
  }
  if (typeof tag === 'string') {
    var Ctor = void 0;
    if (config.isReservedTag(tag)) {
      return new VNode(tag, data, undefined, undefined, undefined, namespace, context);
    } else if (Ctor = resolveAsset(context.$options, 'components', tag)) {
      return createComponent(Ctor, data, parent, context);
    } else {
      if (process.env.NODE_ENV !== 'production') {
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
    return this.__r__(this.__s__(tag, data, namespace), children);
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
    var prev = renderState.activeInstance;
    renderState.activeInstance = vm;
    if (!vm._isMounted) {
      // render static sub-trees for once on initial render
      renderStaticTrees(vm);
    }
    var _vm$$options = vm.$options;
    var render = _vm$$options.render;
    var _renderChildren = _vm$$options._renderChildren;
    var _parentVnode = _vm$$options._parentVnode;
    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.

    if (_renderChildren) {
      resolveSlots(vm, _renderChildren);
    }
    // render self
    var vnode = render.call(vm._renderProxy) || emptyVNode;
    // set parent
    vnode.parent = _parentVnode;
    // restore render state
    renderState.activeInstance = prev;
    return vnode;
  };

  // shorthands used in render functions
  Vue.prototype.__r__ = renderElementWithChildren;
  Vue.prototype.__s__ = renderElement;
  Vue.prototype.__t__ = renderText;
  Vue.prototype.__m__ = renderStatic;

  // toString for mustaches
  Vue.prototype.__toString__ = renderString;

  // filter resolution helper
  var identity = function identity(_) {
    return _;
  };
  Vue.prototype.__resolveFilter__ = function (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity;
  };

  // render v-for
  Vue.prototype.__renderList__ = function (val, render) {
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

  // register ref
  Vue.prototype.__registerRef__ = function (key, ref, vFor, isRemoval) {
    var vm = this;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else {
        refs[key] = undefined;
      }
    } else {
      if (vFor) {
        if (Array.isArray(refs[key])) {
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

function renderStaticTrees(vm) {
  var staticRenderFns = vm.$options.staticRenderFns;
  if (staticRenderFns) {
    var trees = vm._staticTrees = new Array(staticRenderFns.length);
    for (var i = 0; i < staticRenderFns.length; i++) {
      trees[i] = staticRenderFns[i].call(vm._renderProxy);
    }
  }
}

function resolveSlots(vm, renderChildren) {
  if (renderChildren) {
    var children = normalizeChildren(renderChildren);
    var slots = {};
    var defaultSlot = [];
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
  if (listeners) {
    updateListeners(listeners, {}, function (event, handler) {
      vm.$on(event, handler);
    });
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

function initLifecycle(vm) {
  var options = vm.$options;

  vm.$parent = options.parent;
  vm.$root = vm.$parent ? vm.$parent.$root : vm;
  if (vm.$parent) {
    vm.$parent.$children.push(vm);
  }

  vm.$children = [];
  vm.$refs = {};

  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin(Vue) {
  Vue.prototype._mount = function () {
    var vm = this;
    if (!vm.$options.render) {
      vm.$options.render = function () {
        return vm.$createElement('div');
      };
      if (process.env.NODE_ENV !== 'production') {
        if (vm.$options.template) {
          warn('You are using the runtime-only build of Vue where the template ' + 'option is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', vm);
        } else {
          warn('Failed to mount component: template or render function not defined.', vm);
        }
      }
    }
    callHook(vm, 'beforeMount');
    vm._watcher = new Watcher(vm, vm._render, vm._update);
    vm._update(vm._watcher.value);
    vm._isMounted = true;
    // root instance, call mounted on self
    if (vm.$root === vm) {
      callHook(vm, 'mounted');
    }
    return vm;
  };

  Vue.prototype._update = function (vnode) {
    var vm = this;
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    if (!vm._vnode) {
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      vm.$el = vm.__patch__(vm.$el, vnode);
    } else {
      vm.$el = vm.__patch__(vm._vnode, vnode);
    }
    vm._vnode = vnode;
    // update parent vnode element after patch
    var parentNode = vm.$options._parentVnode;
    if (parentNode) {
      parentNode.elm = vm.$el;
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
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        vm[key] = validateProp(vm, key, propsData);
      }
      observerState.shouldConvert = true;
    }
    // update listeners
    if (listeners) {
      var oldListeners = vm.$options._parentListeners;
      vm.$options._parentListeners = listeners;
      updateListeners(listeners, oldListeners || {}, function (event, handler) {
        vm.$on(event, handler);
      });
    }
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    vm._watcher.update();
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isDestroyed) {
      return;
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.removeVm(vm);
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

var uid = 0;

function init$1(vm, options) {
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
  if (process.env.NODE_ENV !== 'production') {
    initProxy(vm);
  } else {
    vm._renderProxy = vm;
  }
  initLifecycle(vm);
  initEvents(vm);
  callHook(vm, 'init');
  initState(vm);
  callHook(vm, 'created');
  initRender(vm);
}

function initInternalComponent(vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  opts.parent = options.parent;
  opts.propsData = options.propsData;
  opts._parentVnode = options._parentVnode;
  opts._parentListeners = options._parentListeners;
  opts._renderChildren = options._renderChildren;
  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = opts.staticRenderFns;
  }
}

function Vue(options) {
  init$1(this, options);
}

stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy };
var hooksToMerge = Object.keys(hooks);

function createComponent(Ctor, data, parent, context) {
  if (!Ctor) {
    return;
  }
  if (isObject(Ctor)) {
    Ctor = Vue.extend(Ctor);
  }
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
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
  var name = Ctor.options.name ? '-' + Ctor.options.name : '';
  var vnode = new VNode('vue-component-' + Ctor.cid + name, data, undefined, undefined, undefined, undefined, context, { Ctor: Ctor, propsData: propsData, listeners: listeners, parent: parent, children: undefined }
  // children to be set later by renderElementWithChildren,
  // but before the init hook
  );
  return vnode;
}

function createComponentInstanceForVnode(vnode // we know it's MountedComponentVNode but flow doesn't
) {
  var _vnode$componentOptio = vnode.componentOptions;
  var Ctor = _vnode$componentOptio.Ctor;
  var propsData = _vnode$componentOptio.propsData;
  var listeners = _vnode$componentOptio.listeners;
  var parent = _vnode$componentOptio.parent;
  var children = _vnode$componentOptio.children;

  var options = {
    _isComponent: true,
    parent: parent,
    propsData: propsData,
    _parentVnode: vnode,
    _parentListeners: listeners,
    _renderChildren: children
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (inlineTemplate) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new Ctor(options);
}

function init(vnode) {
  var child = vnode.child = createComponentInstanceForVnode(vnode);
  child.$mount();
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
  callHook(vnode.child, 'mounted');
}

function destroy(vnode) {
  vnode.child.$destroy();
}

function resolveAsyncComponent(factory, cb) {
  if (factory.resolved) {
    return factory.resolved;
  } else if (factory.requested) {
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
        process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component: ' + factory + (reason ? '\nReason: ' + reason : ''));
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
  return false;
}

function mergeHooks(data) {
  if (data.hook) {
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i];
      var fromParent = data.hook[key];
      var ours = hooks[key];
      data.hook[key] = fromParent ? mergeHook(ours, fromParent) : ours;
    }
  } else {
    data.hook = hooks;
  }
}

function mergeHook(a, b) {
  // since all hooks have at most two args, use fixed args
  // to avoid having to use fn.apply().
  return function (_, __) {
    a(_, __);
    b(_, __);
  };
}

function createRenderFunction(modules, directives, isUnaryTag) {
  function renderNode(node, write, next, isRoot) {
    if (node.componentOptions) {
      var child = createComponentInstanceForVnode(node);
      renderNode(child._render(), write, next, isRoot);
    } else {
      if (node.tag) {
        renderElement(node, write, next, isRoot);
      } else {
        write(node.text, next);
      }
    }
  }

  function renderElement(el, write, next, isRoot) {
    if (isRoot) {
      if (!el.data) el.data = {};
      if (!el.data.attrs) el.data.attrs = {};
      el.data.attrs['server-rendered'] = 'true';
    }
    var startTag = renderStartingTag(el);
    var endTag = '</' + el.tag + '>';
    if (isUnaryTag(el.tag)) {
      write(startTag, next);
    } else if (!el.children || !el.children.length) {
      write(startTag + endTag, next);
    } else {
      (function () {
        var children = el.children || [];
        write(startTag, function () {
          var total = children.length;
          var rendered = 0;

          function renderChild(child) {
            renderNode(child, write, function () {
              rendered++;
              if (rendered < total) {
                renderChild(children[rendered]);
              } else {
                write(endTag, next);
              }
            }, false);
          }

          renderChild(children[0]);
        });
      })();
    }
  }

  function renderStartingTag(node) {
    var markup = '<' + node.tag;
    if (node.data) {
      // check directives
      var dirs = node.data.directives;
      if (dirs) {
        for (var i = 0; i < dirs.length; i++) {
          var dirRenderer = directives[dirs[i].name];
          if (dirRenderer) {
            // directives mutate the node's data
            // which then gets rendered by modules
            dirRenderer(node, dirs[i]);
          }
        }
      }
      // apply other modules
      for (var _i = 0; _i < modules.length; _i++) {
        var res = modules[_i](node);
        if (res) {
          markup += res;
        }
      }
    }
    return markup + '>';
  }

  return function render(component, write, done) {
    renderNode(component._render(), write, done, true);
  };
}

var MAX_STACK_DEPTH = 1000;

function createRenderer() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$modules = _ref.modules;
  var modules = _ref$modules === undefined ? [] : _ref$modules;
  var _ref$directives = _ref.directives;
  var directives = _ref$directives === undefined ? {} : _ref$directives;
  var _ref$isUnaryTag = _ref.isUnaryTag;
  var isUnaryTag = _ref$isUnaryTag === undefined ? function () {
    return false;
  } : _ref$isUnaryTag;

  if (process.env.VUE_ENV !== 'server') {
    warn('You are using createRenderer without setting VUE_ENV enviroment variable to "server". ' + 'It is recommended to set VUE_ENV=server this will help rendering performance, ' + 'by turning data observation off.');
  }
  var render = createRenderFunction(modules, directives, isUnaryTag);

  return {
    renderToString: function renderToString(component, done) {
      var result = '';
      var stackDepth = 0;
      var write = function write(str, next) {
        result += str;
        if (stackDepth >= MAX_STACK_DEPTH) {
          process.nextTick(function () {
            try {
              next();
            } catch (e) {
              done(e);
            }
          });
        } else {
          stackDepth++;
          next();
          stackDepth--;
        }
      };
      try {
        render(component, write, function () {
          done(null, result);
        });
      } catch (e) {
        done(e);
      }
    },
    renderToStream: function renderToStream(component) {
      return new RenderStream(function (write, done) {
        render(component, write, done);
      });
    }
  };
}

// attributes that should be using props for binding
var mustUseProp = makeMap('value,selected,checked,muted');

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');

var propsToAttrMap = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv'
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
  return res;
}

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

var UA$1 = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE9 = UA$1 && UA$1.indexOf('msie 9.0') > 0;
var isAndroid = UA$1 && UA$1.indexOf('android') > 0;

function renderAttrs(node) {
  if (node.data.attrs || node.data.props || node.data.staticAttrs) {
    return serialize(node.data.staticAttrs) + serialize(node.data.attrs) + serialize(node.data.props, true);
  }
}

function serialize(attrs, asProps) {
  var res = '';
  if (!attrs) {
    return res;
  }
  for (var _key in attrs) {
    if (_key === 'style') {
      // leave it to the style module
      continue;
    }
    if (asProps) {
      _key = propsToAttrMap[_key] || _key.toLowerCase();
    }
    var value = attrs[_key];
    if (isBooleanAttr(_key)) {
      if (!isFalsyAttrValue(value)) {
        res += ' ' + _key + '="' + _key + '"';
      }
    } else if (isEnumeratedAttr(_key)) {
      res += ' ' + _key + '="' + (isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true') + '"';
    } else if (!isFalsyAttrValue(value)) {
      res += ' ' + _key + '="' + value + '"';
    }
  }
  return res;
}

function renderClass(node) {
  if (node.data.class || node.data.staticClass) {
    return ' class="' + genClassForVnode(node) + '"';
  }
}

function renderStyle(node) {
  var staticStyle = node.data.staticAttrs && node.data.staticAttrs.style;
  if (node.data.style || staticStyle) {
    var styles = node.data.style;
    var res = ' style="';
    if (styles) {
      if (Array.isArray(styles)) {
        styles = toObject(styles);
      }
      for (var key in styles) {
        res += hyphenate(key) + ':' + styles[key] + ';';
      }
    }
    return res + (staticStyle || '') + '"';
  }
}

var modules = [renderAttrs, renderClass, renderStyle];

function show(node, dir) {
  if (!dir.value) {
    var style = node.data.style || (node.data.style = {});
    style.display = 'none';
  }
}

var baseDirectives = {
  show: show
};

function publicCreateRenderer() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  // user can provide server-side implementations for custom directives
  // when creating the renderer.
  var directives = Object.assign(baseDirectives, options.directives);
  return createRenderer({
    isUnaryTag: isUnaryTag,
    modules: modules,
    directives: directives
  });
}

module.exports = publicCreateRenderer;