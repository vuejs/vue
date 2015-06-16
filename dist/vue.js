/**
 * Vue.js v0.12.1-csp.1
 * (c) 2015 Evan You
 * Released under the MIT License.
 */

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Vue"] = factory();
	else
		root["Vue"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var extend = _.extend

	/**
	 * The exposed Vue constructor.
	 *
	 * API conventions:
	 * - public API methods/properties are prefiexed with `$`
	 * - internal methods/properties are prefixed with `_`
	 * - non-prefixed properties are assumed to be proxied user
	 *   data.
	 *
	 * @constructor
	 * @param {Object} [options]
	 * @public
	 */

	function Vue (options) {
	  this._init(options)
	}

	/**
	 * Mixin global API
	 */

	extend(Vue, __webpack_require__(9))

	/**
	 * Vue and every constructor that extends Vue has an
	 * associated options object, which can be accessed during
	 * compilation steps as `this.constructor.options`.
	 *
	 * These can be seen as the default options of every
	 * Vue instance.
	 */

	Vue.options = {
	  directives: __webpack_require__(28),
	  filters: __webpack_require__(50),
	  transitions: {},
	  components: {},
	  elementDirectives: {
	    content: __webpack_require__(52)
	  }
	}

	/**
	 * Build up the prototype
	 */

	var p = Vue.prototype

	/**
	 * $data has a setter which does a bunch of
	 * teardown/setup work
	 */

	Object.defineProperty(p, '$data', {
	  get: function () {
	    return this._data
	  },
	  set: function (newData) {
	    if (newData !== this._data) {
	      this._setData(newData)
	    }
	  }
	})

	/**
	 * Mixin internal instance methods
	 */

	extend(p, __webpack_require__(53))
	extend(p, __webpack_require__(54))
	extend(p, __webpack_require__(55))
	extend(p, __webpack_require__(56))
	extend(p, __webpack_require__(58))

	/**
	 * Mixin public API methods
	 */

	extend(p, __webpack_require__(59))
	extend(p, __webpack_require__(60))
	extend(p, __webpack_require__(61))
	extend(p, __webpack_require__(62))
	extend(p, __webpack_require__(63))

	module.exports = _.Vue = Vue

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var lang   = __webpack_require__(4)
	var extend = lang.extend

	extend(exports, lang)
	extend(exports, __webpack_require__(5))
	extend(exports, __webpack_require__(6))
	extend(exports, __webpack_require__(2))
	extend(exports, __webpack_require__(7))
	extend(exports, __webpack_require__(8))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(3)

	/**
	 * Assert whether a prop is valid.
	 *
	 * @param {Object} prop
	 * @param {*} value
	 */

	exports.assertProp = function (prop, value) {
	  var assertions = prop.assertions
	  if (!assertions) {
	    return true
	  }
	  var type = assertions.type
	  var valid = true
	  var expectedType
	  if (type) {
	    if (type === String) {
	      expectedType = 'string'
	      valid = typeof value === expectedType
	    } else if (type === Number) {
	      expectedType = 'number'
	      valid = typeof value === 'number'
	    } else if (type === Boolean) {
	      expectedType = 'boolean'
	      valid = typeof value === 'boolean'
	    } else if (type === Function) {
	      expectedType = 'function'
	      valid = typeof value === 'function'
	    } else if (type === Object) {
	      expectedType = 'object'
	      valid = _.isPlainObject(value)
	    } else if (type === Array) {
	      expectedType = 'array'
	      valid = _.isArray(value)
	    } else {
	      valid = value instanceof type
	    }
	  }
	  if (!valid) {
	    _.warn(
	      'Invalid prop: type check failed for ' +
	      prop.path + '="' + prop.raw + '".' +
	      ' Expected ' + formatType(expectedType) +
	      ', got ' + formatValue(value) + '.'
	    )
	    return false
	  }
	  var validator = assertions.validator
	  if (validator) {
	    if (!validator.call(null, value)) {
	      _.warn(
	        'Invalid prop: custom validator check failed for ' +
	        prop.path + '="' + prop.raw + '"'
	      )
	      return false
	    }
	  }
	  return true
	}

	function formatType (val) {
	  return val
	    ? val.charAt(0).toUpperCase() + val.slice(1)
	    : 'custom type'
	}

	function formatValue (val) {
	  return Object.prototype.toString.call(val).slice(8, -1)
	}

	/**
	 * Check if an element is a component, if yes return its
	 * component id.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {String|undefined}
	 */

	var commonTagRE = /^(div|p|span|img|a|br|ul|ol|li|h1|h2|h3|h4|h5|code|pre)$/
	var tableElementsRE = /^caption|colgroup|thead|tfoot|tbody|tr|td|th$/

	exports.checkComponent = function (el, options) {
	  var tag = el.tagName.toLowerCase()
	  if (tag === 'component') {
	    // dynamic syntax
	    var exp = el.getAttribute('is')
	    el.removeAttribute('is')
	    return exp
	  } else if (
	    !commonTagRE.test(tag) &&
	    _.resolveAsset(options, 'components', tag)
	  ) {
	    return tag
	  } else if (
	    tableElementsRE.test(tag) &&
	    (tag = _.attr(el, 'component'))
	  ) {
	    return tag
	  }
	}

	/**
	 * Create an "anchor" for performing dom insertion/removals.
	 * This is used in a number of scenarios:
	 * - block instance
	 * - v-html
	 * - v-if
	 * - component
	 * - repeat
	 *
	 * @param {String} content
	 * @param {Boolean} persist - IE trashes empty textNodes on
	 *                            cloneNode(true), so in certain
	 *                            cases the anchor needs to be
	 *                            non-empty to be persisted in
	 *                            templates.
	 * @return {Comment|Text}
	 */

	exports.createAnchor = function (content, persist) {
	  return config.debug
	    ? document.createComment(content)
	    : document.createTextNode(persist ? ' ' : '')
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  /**
	   * The prefix to look for when parsing directives.
	   *
	   * @type {String}
	   */

	  prefix: 'v-',

	  /**
	   * Whether to print debug messages.
	   * Also enables stack trace for warnings.
	   *
	   * @type {Boolean}
	   */

	  debug: false,

	  /**
	   * Whether to suppress warnings.
	   *
	   * @type {Boolean}
	   */

	  silent: false,

	  /**
	   * Whether allow observer to alter data objects'
	   * __proto__.
	   *
	   * @type {Boolean}
	   */

	  proto: true,

	  /**
	   * Whether to parse mustache tags in templates.
	   *
	   * @type {Boolean}
	   */

	  interpolate: true,

	  /**
	   * Whether to use async rendering.
	   */

	  async: true,

	  /**
	   * Whether to warn against errors caught when evaluating
	   * expressions.
	   */

	  warnExpressionErrors: true,

	  /**
	   * Internal flag to indicate the delimiters have been
	   * changed.
	   *
	   * @type {Boolean}
	   */

	  _delimitersChanged: true,

	  /**
	   * List of asset types that a component can own.
	   *
	   * @type {Array}
	   */

	  _assetTypes: [
	    'directive',
	    'elementDirective',
	    'filter',
	    'transition'
	  ],

	  /**
	   * prop binding modes
	   */

	  _propBindingModes: {
	    ONE_WAY: 0,
	    TWO_WAY: 1,
	    ONE_TIME: 2
	  }

	}

	/**
	 * Interpolation delimiters.
	 * We need to mark the changed flag so that the text parser
	 * knows it needs to recompile the regex.
	 *
	 * @type {Array<String>}
	 */

	var delimiters = ['{{', '}}']
	Object.defineProperty(module.exports, 'delimiters', {
	  get: function () {
	    return delimiters
	  },
	  set: function (val) {
	    delimiters = val
	    this._delimitersChanged = true
	  }
	})


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Check is a string starts with $ or _
	 *
	 * @param {String} str
	 * @return {Boolean}
	 */

	exports.isReserved = function (str) {
	  var c = (str + '').charCodeAt(0)
	  return c === 0x24 || c === 0x5F
	}

	/**
	 * Guard text output, make sure undefined outputs
	 * empty string
	 *
	 * @param {*} value
	 * @return {String}
	 */

	exports.toString = function (value) {
	  return value == null
	    ? ''
	    : value.toString()
	}

	/**
	 * Check and convert possible numeric numbers before
	 * setting back to data
	 *
	 * @param {*} value
	 * @return {*|Number}
	 */

	exports.toNumber = function (value) {
	  return (
	    isNaN(value) ||
	    value === null ||
	    typeof value === 'boolean'
	  ) ? value
	    : Number(value)
	}

	/**
	 * Convert string boolean literals into real booleans.
	 *
	 * @param {*} value
	 * @return {*|Boolean}
	 */

	exports.toBoolean = function (value) {
	  return value === 'true'
	    ? true
	    : value === 'false'
	      ? false
	      : value
	}

	/**
	 * Strip quotes from a string
	 *
	 * @param {String} str
	 * @return {String | false}
	 */

	exports.stripQuotes = function (str) {
	  var a = str.charCodeAt(0)
	  var b = str.charCodeAt(str.length - 1)
	  return a === b && (a === 0x22 || a === 0x27)
	    ? str.slice(1, -1)
	    : false
	}

	/**
	 * Replace helper
	 *
	 * @param {String} _ - matched delimiter
	 * @param {String} c - matched char
	 * @return {String}
	 */
	function toUpper (_, c) {
	  return c ? c.toUpperCase () : ''
	}

	/**
	 * Camelize a hyphen-delmited string.
	 *
	 * @param {String} str
	 * @return {String}
	 */

	var camelRE = /-(\w)/g
	exports.camelize = function (str) {
	  return str.replace(camelRE, toUpper)
	}

	/**
	 * Converts hyphen/underscore/slash delimitered names into
	 * camelized classNames.
	 *
	 * e.g. my-component => MyComponent
	 *      some_else    => SomeElse
	 *      some/comp    => SomeComp
	 *
	 * @param {String} str
	 * @return {String}
	 */

	var classifyRE = /(?:^|[-_\/])(\w)/g
	exports.classify = function (str) {
	  return str.replace(classifyRE, toUpper)
	}

	/**
	 * Simple bind, faster than native
	 *
	 * @param {Function} fn
	 * @param {Object} ctx
	 * @return {Function}
	 */

	exports.bind = function (fn, ctx) {
	  return function (a) {
	    var l = arguments.length
	    return l
	      ? l > 1
	        ? fn.apply(ctx, arguments)
	        : fn.call(ctx, a)
	      : fn.call(ctx)
	  }
	}

	/**
	 * Convert an Array-like object to a real Array.
	 *
	 * @param {Array-like} list
	 * @param {Number} [start] - start index
	 * @return {Array}
	 */

	exports.toArray = function (list, start) {
	  start = start || 0
	  var i = list.length - start
	  var ret = new Array(i)
	  while (i--) {
	    ret[i] = list[i + start]
	  }
	  return ret
	}

	/**
	 * Mix properties into target object.
	 *
	 * @param {Object} to
	 * @param {Object} from
	 */

	exports.extend = function (to, from) {
	  for (var key in from) {
	    to[key] = from[key]
	  }
	  return to
	}

	/**
	 * Quick object check - this is primarily used to tell
	 * Objects from primitive values when we know the value
	 * is a JSON-compliant type.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	exports.isObject = function (obj) {
	  return obj && typeof obj === 'object'
	}

	/**
	 * Strict object type check. Only returns true
	 * for plain JavaScript objects.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	var toString = Object.prototype.toString
	exports.isPlainObject = function (obj) {
	  return toString.call(obj) === '[object Object]'
	}

	/**
	 * Array type check.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	exports.isArray = function (obj) {
	  return Array.isArray(obj)
	}

	/**
	 * Define a non-enumerable property
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @param {*} val
	 * @param {Boolean} [enumerable]
	 */

	exports.define = function (obj, key, val, enumerable) {
	  Object.defineProperty(obj, key, {
	    value        : val,
	    enumerable   : !!enumerable,
	    writable     : true,
	    configurable : true
	  })
	}

	/**
	 * Debounce a function so it only gets called after the
	 * input stops arriving after the given wait period.
	 *
	 * @param {Function} func
	 * @param {Number} wait
	 * @return {Function} - the debounced function
	 */

	exports.debounce = function(func, wait) {
	  var timeout, args, context, timestamp, result
	  var later = function() {
	    var last = Date.now() - timestamp
	    if (last < wait && last >= 0) {
	      timeout = setTimeout(later, wait - last)
	    } else {
	      timeout = null
	      result = func.apply(context, args)
	      if (!timeout) context = args = null
	    }
	  }
	  return function() {
	    context = this
	    args = arguments
	    timestamp = Date.now()
	    if (!timeout) {
	      timeout = setTimeout(later, wait)
	    }
	    return result
	  }
	}

	/**
	 * Manual indexOf because it's slightly faster than
	 * native.
	 *
	 * @param {Array} arr
	 * @param {*} obj
	 */

	exports.indexOf = function (arr, obj) {
	  for (var i = 0, l = arr.length; i < l; i++) {
	    if (arr[i] === obj) return i
	  }
	  return -1
	}

	/**
	 * Make a cancellable version of an async callback.
	 *
	 * @param {Function} fn
	 * @return {Function}
	 */

	exports.cancellable = function (fn) {
	  var cb = function () {
	    if (!cb.cancelled) {
	      return fn.apply(this, arguments)
	    }
	  }
	  cb.cancel = function () {
	    cb.cancelled = true
	  }
	  return cb
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// can we use __proto__?
	exports.hasProto = '__proto__' in {}

	// Browser environment sniffing
	var inBrowser = exports.inBrowser =
	  typeof window !== 'undefined' &&
	  Object.prototype.toString.call(window) !== '[object Object]'

	exports.isIE9 =
	  inBrowser &&
	  navigator.userAgent.toLowerCase().indexOf('msie 9.0') > 0

	exports.isAndroid =
	  inBrowser &&
	  navigator.userAgent.toLowerCase().indexOf('android') > 0

	// Transition property/event sniffing
	if (inBrowser && !exports.isIE9) {
	  var isWebkitTrans =
	    window.ontransitionend === undefined &&
	    window.onwebkittransitionend !== undefined
	  var isWebkitAnim =
	    window.onanimationend === undefined &&
	    window.onwebkitanimationend !== undefined
	  exports.transitionProp = isWebkitTrans
	    ? 'WebkitTransition'
	    : 'transition'
	  exports.transitionEndEvent = isWebkitTrans
	    ? 'webkitTransitionEnd'
	    : 'transitionend'
	  exports.animationProp = isWebkitAnim
	    ? 'WebkitAnimation'
	    : 'animation'
	  exports.animationEndEvent = isWebkitAnim
	    ? 'webkitAnimationEnd'
	    : 'animationend'
	}

	/**
	 * Defer a task to execute it asynchronously. Ideally this
	 * should be executed as a microtask, so we leverage
	 * MutationObserver if it's available, and fallback to
	 * setTimeout(0).
	 *
	 * @param {Function} cb
	 * @param {Object} ctx
	 */

	exports.nextTick = (function () {
	  var callbacks = []
	  var pending = false
	  var timerFunc
	  function handle () {
	    pending = false
	    var copies = callbacks.slice(0)
	    callbacks = []
	    for (var i = 0; i < copies.length; i++) {
	      copies[i]()
	    }
	  }
	  /* istanbul ignore if */
	  if (typeof MutationObserver !== 'undefined') {
	    var counter = 1
	    var observer = new MutationObserver(handle)
	    var textNode = document.createTextNode(counter)
	    observer.observe(textNode, {
	      characterData: true
	    })
	    timerFunc = function () {
	      counter = (counter + 1) % 2
	      textNode.data = counter
	    }
	  } else {
	    timerFunc = setTimeout
	  }
	  return function (cb, ctx) {
	    var func = ctx
	      ? function () { cb.call(ctx) }
	      : cb
	    callbacks.push(func)
	    if (pending) return
	    pending = true
	    timerFunc(handle, 0)
	  }
	})()

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(3)

	/**
	 * Check if a node is in the document.
	 * Note: document.documentElement.contains should work here
	 * but always returns false for comment nodes in phantomjs,
	 * making unit tests difficult. This is fixed byy doing the
	 * contains() check on the node's parentNode instead of
	 * the node itself.
	 *
	 * @param {Node} node
	 * @return {Boolean}
	 */

	exports.inDoc = function (node) {
	  var doc = document.documentElement
	  var parent = node && node.parentNode
	  return doc === node ||
	    doc === parent ||
	    !!(parent && parent.nodeType === 1 && (doc.contains(parent)))
	}

	/**
	 * Extract an attribute from a node.
	 *
	 * @param {Node} node
	 * @param {String} attr
	 */

	exports.attr = function (node, attr) {
	  attr = config.prefix + attr
	  var val = node.getAttribute(attr)
	  if (val !== null) {
	    node.removeAttribute(attr)
	  }
	  return val
	}

	/**
	 * Insert el before target
	 *
	 * @param {Element} el
	 * @param {Element} target
	 */

	exports.before = function (el, target) {
	  target.parentNode.insertBefore(el, target)
	}

	/**
	 * Insert el after target
	 *
	 * @param {Element} el
	 * @param {Element} target
	 */

	exports.after = function (el, target) {
	  if (target.nextSibling) {
	    exports.before(el, target.nextSibling)
	  } else {
	    target.parentNode.appendChild(el)
	  }
	}

	/**
	 * Remove el from DOM
	 *
	 * @param {Element} el
	 */

	exports.remove = function (el) {
	  el.parentNode.removeChild(el)
	}

	/**
	 * Prepend el to target
	 *
	 * @param {Element} el
	 * @param {Element} target
	 */

	exports.prepend = function (el, target) {
	  if (target.firstChild) {
	    exports.before(el, target.firstChild)
	  } else {
	    target.appendChild(el)
	  }
	}

	/**
	 * Replace target with el
	 *
	 * @param {Element} target
	 * @param {Element} el
	 */

	exports.replace = function (target, el) {
	  var parent = target.parentNode
	  if (parent) {
	    parent.replaceChild(el, target)
	  }
	}

	/**
	 * Add event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 */

	exports.on = function (el, event, cb) {
	  el.addEventListener(event, cb)
	}

	/**
	 * Remove event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 */

	exports.off = function (el, event, cb) {
	  el.removeEventListener(event, cb)
	}

	/**
	 * Add class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {Strong} cls
	 */

	exports.addClass = function (el, cls) {
	  if (el.classList) {
	    el.classList.add(cls)
	  } else {
	    var cur = ' ' + (el.getAttribute('class') || '') + ' '
	    if (cur.indexOf(' ' + cls + ' ') < 0) {
	      el.setAttribute('class', (cur + cls).trim())
	    }
	  }
	}

	/**
	 * Remove class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {Strong} cls
	 */

	exports.removeClass = function (el, cls) {
	  if (el.classList) {
	    el.classList.remove(cls)
	  } else {
	    var cur = ' ' + (el.getAttribute('class') || '') + ' '
	    var tar = ' ' + cls + ' '
	    while (cur.indexOf(tar) >= 0) {
	      cur = cur.replace(tar, ' ')
	    }
	    el.setAttribute('class', cur.trim())
	  }
	}

	/**
	 * Extract raw content inside an element into a temporary
	 * container div
	 *
	 * @param {Element} el
	 * @param {Boolean} asFragment
	 * @return {Element}
	 */

	exports.extractContent = function (el, asFragment) {
	  var child
	  var rawContent
	  /* istanbul ignore if */
	  if (
	    exports.isTemplate(el) &&
	    el.content instanceof DocumentFragment
	  ) {
	    el = el.content
	  }
	  if (el.hasChildNodes()) {
	    rawContent = asFragment
	      ? document.createDocumentFragment()
	      : document.createElement('div')
	    /* jshint boss:true */
	    while (child = el.firstChild) {
	      rawContent.appendChild(child)
	    }
	  }
	  return rawContent
	}

	/**
	 * Check if an element is a template tag.
	 * Note if the template appears inside an SVG its tagName
	 * will be in lowercase.
	 *
	 * @param {Element} el
	 */

	exports.isTemplate = function (el) {
	  return el.tagName &&
	    el.tagName.toLowerCase() === 'template'
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(3)

	/**
	 * Enable debug utilities. The enableDebug() function and
	 * all _.log() & _.warn() calls will be dropped in the
	 * minified production build.
	 */

	enableDebug()

	function enableDebug () {

	  var hasConsole = typeof console !== 'undefined'
	  
	  /**
	   * Log a message.
	   *
	   * @param {String} msg
	   */

	  exports.log = function (msg) {
	    if (hasConsole && config.debug) {
	      console.log('[Vue info]: ' + msg)
	    }
	  }

	  /**
	   * We've got a problem here.
	   *
	   * @param {String} msg
	   */

	  exports.warn = function (msg, e) {
	    if (hasConsole && (!config.silent || config.debug)) {
	      console.warn('[Vue warn]: ' + msg)
	      /* istanbul ignore if */
	      if (config.debug) {
	        /* jshint debug: true */
	        console.warn((e || new Error('Warning Stack Trace')).stack)
	      }
	    }
	  }

	  /**
	   * Assert asset exists
	   */

	  exports.assertAsset = function (val, type, id) {
	    /* istanbul ignore if */
	    if (type === 'directive') {
	      if (id === 'component') {
	        exports.warn(
	          'v-component can only be used on table elements ' +
	          'in ^0.12.0. Use custom element syntax instead.'
	        )
	        return
	      }
	      if (id === 'with') {
	        exports.warn(
	          'v-with has been deprecated in ^0.12.0. ' +
	          'Use props instead.'
	        )
	        return
	      }
	      if (id === 'events') {
	        exports.warn(
	          'v-events has been deprecated in ^0.12.0. ' +
	          'Pass down methods as callback props instead.'
	        )
	        return
	      }
	    }
	    if (!val) {
	      exports.warn('Failed to resolve ' + type + ': ' + id)
	    }
	  }
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var extend = _.extend

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

	var strats = Object.create(null)

	/**
	 * Helper that recursively merges two data objects together.
	 */

	function mergeData (to, from) {
	  var key, toVal, fromVal
	  for (key in from) {
	    toVal = to[key]
	    fromVal = from[key]
	    if (!to.hasOwnProperty(key)) {
	      to.$add(key, fromVal)
	    } else if (_.isObject(toVal) && _.isObject(fromVal)) {
	      mergeData(toVal, fromVal)
	    }
	  }
	  return to
	}

	/**
	 * Data
	 */

	strats.data = function (parentVal, childVal, vm) {
	  if (!vm) {
	    // in a Vue.extend merge, both should be functions
	    if (!childVal) {
	      return parentVal
	    }
	    if (typeof childVal !== 'function') {
	      _.warn(
	        'The "data" option should be a function ' +
	        'that returns a per-instance value in component ' +
	        'definitions.'
	      )
	      return parentVal
	    }
	    if (!parentVal) {
	      return childVal
	    }
	    // when parentVal & childVal are both present,
	    // we need to return a function that returns the
	    // merged result of both functions... no need to
	    // check if parentVal is a function here because
	    // it has to be a function to pass previous merges.
	    return function mergedDataFn () {
	      return mergeData(
	        childVal.call(this),
	        parentVal.call(this)
	      )
	    }
	  } else {
	    // instance merge, return raw object
	    var instanceData = typeof childVal === 'function'
	      ? childVal.call(vm)
	      : childVal
	    var defaultData = typeof parentVal === 'function'
	      ? parentVal.call(vm)
	      : undefined
	    if (instanceData) {
	      return mergeData(instanceData, defaultData)
	    } else {
	      return defaultData
	    }
	  }
	}

	/**
	 * El
	 */

	strats.el = function (parentVal, childVal, vm) {
	  if (!vm && childVal && typeof childVal !== 'function') {
	    _.warn(
	      'The "el" option should be a function ' +
	      'that returns a per-instance value in component ' +
	      'definitions.'
	    )
	    return
	  }
	  var ret = childVal || parentVal
	  // invoke the element factory if this is instance merge
	  return vm && typeof ret === 'function'
	    ? ret.call(vm)
	    : ret
	}

	/**
	 * Hooks and param attributes are merged as arrays.
	 */

	strats.created =
	strats.ready =
	strats.attached =
	strats.detached =
	strats.beforeCompile =
	strats.compiled =
	strats.beforeDestroy =
	strats.destroyed =
	strats.props = function (parentVal, childVal) {
	  return childVal
	    ? parentVal
	      ? parentVal.concat(childVal)
	      : _.isArray(childVal)
	        ? childVal
	        : [childVal]
	    : parentVal
	}

	/**
	 * 0.11 deprecation warning
	 */

	strats.paramAttributes = function () {
	  /* istanbul ignore next */
	  _.warn(
	    '"paramAttributes" option has been deprecated in 0.12. ' +
	    'Use "props" instead.'
	  )
	}

	/**
	 * Assets
	 *
	 * When a vm is present (instance creation), we need to do
	 * a three-way merge between constructor options, instance
	 * options and parent options.
	 */

	strats.directives =
	strats.filters =
	strats.transitions =
	strats.components =
	strats.elementDirectives = function (parentVal, childVal) {
	  var res = Object.create(parentVal)
	  return childVal
	    ? extend(res, childVal)
	    : res
	}

	/**
	 * Events & Watchers.
	 *
	 * Events & watchers hashes should not overwrite one
	 * another, so we merge them as arrays.
	 */

	strats.watch =
	strats.events = function (parentVal, childVal) {
	  if (!childVal) return parentVal
	  if (!parentVal) return childVal
	  var ret = {}
	  extend(ret, parentVal)
	  for (var key in childVal) {
	    var parent = ret[key]
	    var child = childVal[key]
	    if (parent && !_.isArray(parent)) {
	      parent = [parent]
	    }
	    ret[key] = parent
	      ? parent.concat(child)
	      : [child]
	  }
	  return ret
	}

	/**
	 * Other object hashes.
	 */

	strats.methods =
	strats.computed = function (parentVal, childVal) {
	  if (!childVal) return parentVal
	  if (!parentVal) return childVal
	  var ret = Object.create(parentVal)
	  extend(ret, childVal)
	  return ret
	}

	/**
	 * Default strategy.
	 */

	var defaultStrat = function (parentVal, childVal) {
	  return childVal === undefined
	    ? parentVal
	    : childVal
	}

	/**
	 * Make sure component options get converted to actual
	 * constructors.
	 *
	 * @param {Object} components
	 */

	function guardComponents (components) {
	  if (components) {
	    var def
	    for (var key in components) {
	      def = components[key]
	      if (_.isPlainObject(def)) {
	        def.name = key
	        components[key] = _.Vue.extend(def)
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

	exports.mergeOptions = function merge (parent, child, vm) {
	  guardComponents(child.components)
	  var options = {}
	  var key
	  if (child.mixins) {
	    for (var i = 0, l = child.mixins.length; i < l; i++) {
	      parent = merge(parent, child.mixins[i], vm)
	    }
	  }
	  for (key in parent) {
	    mergeField(key)
	  }
	  for (key in child) {
	    if (!(parent.hasOwnProperty(key))) {
	      mergeField(key)
	    }
	  }
	  function mergeField (key) {
	    var strat = strats[key] || defaultStrat
	    options[key] = strat(parent[key], child[key], vm, key)
	  }
	  return options
	}

	/**
	 * Resolve an asset.
	 * This function is used because child instances need access
	 * to assets defined in its ancestor chain.
	 *
	 * @param {Object} options
	 * @param {String} type
	 * @param {String} id
	 * @return {Object|Function}
	 */

	exports.resolveAsset = function resolve (options, type, id) {
	  var asset = options[type][id]
	  while (!asset && options._parent) {
	    options = options._parent.$options
	    asset = options[type][id]
	  }
	  return asset
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(3)

	/**
	 * Expose useful internals
	 */

	exports.util = _
	exports.nextTick = _.nextTick
	exports.config = __webpack_require__(3)
	exports.compiler = __webpack_require__(10)

	exports.parsers = {
	  path: __webpack_require__(23),
	  text: __webpack_require__(14),
	  template: __webpack_require__(12),
	  directive: __webpack_require__(15),
	  expression: __webpack_require__(22)
	}

	/**
	 * Each instance constructor, including Vue, has a unique
	 * cid. This enables us to create wrapped "child
	 * constructors" for prototypal inheritance and cache them.
	 */

	exports.cid = 0
	var cid = 1

	/**
	 * Class inehritance
	 *
	 * @param {Object} extendOptions
	 */

	exports.extend = function (extendOptions) {
	  extendOptions = extendOptions || {}
	  var Super = this
	  var Sub = function VueComponent (options) {
	    _.Vue.call(this, options)
	  }
	  Sub.prototype = Object.create(Super.prototype)
	  Sub.prototype.constructor = Sub
	  Sub.cid = cid++
	  Sub.options = _.mergeOptions(
	    Super.options,
	    extendOptions
	  )
	  Sub['super'] = Super
	  // allow further extension
	  Sub.extend = Super.extend
	  // create asset registers, so extended classes
	  // can have their private assets too.
	  createAssetRegisters(Sub)
	  return Sub
	}

	/**
	 * Plugin system
	 *
	 * @param {Object} plugin
	 */

	exports.use = function (plugin) {
	  // additional parameters
	  var args = _.toArray(arguments, 1)
	  args.unshift(this)
	  if (typeof plugin.install === 'function') {
	    plugin.install.apply(plugin, args)
	  } else {
	    plugin.apply(null, args)
	  }
	  return this
	}

	/**
	 * Define asset registration methods on a constructor.
	 *
	 * @param {Function} Constructor
	 */

	function createAssetRegisters (Constructor) {

	  /* Asset registration methods share the same signature:
	   *
	   * @param {String} id
	   * @param {*} definition
	   */

	  config._assetTypes.forEach(function (type) {
	    Constructor[type] = function (id, definition) {
	      if (!definition) {
	        return this.options[type + 's'][id]
	      } else {
	        this.options[type + 's'][id] = definition
	      }
	    }
	  })

	  /**
	   * Component registration needs to automatically invoke
	   * Vue.extend on object values.
	   *
	   * @param {String} id
	   * @param {Object|Function} definition
	   */

	  Constructor.component = function (id, definition) {
	    if (!definition) {
	      return this.options.components[id]
	    } else {
	      if (_.isPlainObject(definition)) {
	        definition.name = id
	        definition = _.Vue.extend(definition)
	      }
	      this.options.components[id] = definition
	    }
	  }
	}

	createAssetRegisters(exports)


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	_.extend(exports, __webpack_require__(11))
	_.extend(exports, __webpack_require__(27))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(3)
	var textParser = __webpack_require__(14)
	var dirParser = __webpack_require__(15)
	var templateParser = __webpack_require__(12)
	var resolveAsset = _.resolveAsset
	var propBindingModes = config._propBindingModes

	// internal directives
	var propDef = __webpack_require__(16)
	var componentDef = __webpack_require__(26)

	// terminal directives
	var terminalDirectives = [
	  'repeat',
	  'if'
	]

	/**
	 * Compile a template and return a reusable composite link
	 * function, which recursively contains more link functions
	 * inside. This top level compile function would normally
	 * be called on instance root nodes, but can also be used
	 * for partial compilation if the partial argument is true.
	 *
	 * The returned composite link function, when called, will
	 * return an unlink function that tearsdown all directives
	 * created during the linking phase.
	 *
	 * @param {Element|DocumentFragment} el
	 * @param {Object} options
	 * @param {Boolean} partial
	 * @param {Vue} [host] - host vm of transcluded content
	 * @return {Function}
	 */

	exports.compile = function (el, options, partial, host) {
	  // link function for the node itself.
	  var nodeLinkFn = partial || !options._asComponent
	    ? compileNode(el, options)
	    : null
	  // link function for the childNodes
	  var childLinkFn =
	    !(nodeLinkFn && nodeLinkFn.terminal) &&
	    el.tagName !== 'SCRIPT' &&
	    el.hasChildNodes()
	      ? compileNodeList(el.childNodes, options)
	      : null

	  /**
	   * A composite linker function to be called on a already
	   * compiled piece of DOM, which instantiates all directive
	   * instances.
	   *
	   * @param {Vue} vm
	   * @param {Element|DocumentFragment} el
	   * @return {Function|undefined}
	   */

	  return function compositeLinkFn (vm, el) {
	    // cache childNodes before linking parent, fix #657
	    var childNodes = _.toArray(el.childNodes)
	    // link
	    var dirs = linkAndCapture(function () {
	      if (nodeLinkFn) nodeLinkFn(vm, el, host)
	      if (childLinkFn) childLinkFn(vm, childNodes, host)
	    }, vm)

	    /**
	     * The linker function returns an unlink function that
	     * tearsdown all directives instances generated during
	     * the process.
	     *
	     * @param {Boolean} destroying
	     */
	    return function unlink (destroying) {
	      teardownDirs(vm, dirs, destroying)
	    }
	  }
	}

	/**
	 * Apply a linker to a vm/element pair and capture the
	 * directives created during the process.
	 *
	 * @param {Function} linker
	 * @param {Vue} vm
	 */

	function linkAndCapture (linker, vm) {
	  var originalDirCount = vm._directives.length
	  linker()
	  return vm._directives.slice(originalDirCount)
	}

	/**
	 * Teardown partial linked directives.
	 *
	 * @param {Vue} vm
	 * @param {Array} dirs
	 * @param {Boolean} destroying
	 */

	function teardownDirs (vm, dirs, destroying) {
	  if (!dirs) return
	  var i = dirs.length
	  while (i--) {
	    dirs[i]._teardown()
	    if (!destroying) {
	      vm._directives.$remove(dirs[i])
	    }
	  }
	}

	/**
	 * Compile the root element of an instance. There are
	 * 3 types of things to process here:
	 *
	 * 1. props on parent container (child scope)
	 * 2. other attrs on parent container (parent scope)
	 * 3. attrs on the component template root node, if
	 *    replace:true (child scope)
	 *
	 * Also, if this is a block instance, we only need to
	 * compile 1 & 2 here.
	 *
	 * This function does compile and link at the same time,
	 * since root linkers can not be reused. It returns the
	 * unlink function for potential parent directives on the
	 * container.
	 *
	 * @param {Vue} vm
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function}
	 */

	 exports.compileAndLinkRoot = function (vm, el, options) {
	  var containerAttrs = options._containerAttrs
	  var replacerAttrs = options._replacerAttrs
	  var props = options.props
	  var propsLinkFn, parentLinkFn, replacerLinkFn

	  // 1. props
	  propsLinkFn = props
	    ? compileProps(el, containerAttrs || {}, props)
	    : null

	  // only need to compile other attributes for
	  // non-block instances
	  if (el.nodeType !== 11) {
	    // for components, container and replacer need to be
	    // compiled separately and linked in different scopes.
	    if (options._asComponent) {
	      // 2. container attributes
	      if (containerAttrs) {
	        parentLinkFn = compileDirectives(containerAttrs, options)
	      }
	      if (replacerAttrs) {
	        // 3. replacer attributes
	        replacerLinkFn = compileDirectives(replacerAttrs, options)
	      }
	    } else {
	      // non-component, just compile as a normal element.
	      replacerLinkFn = compileDirectives(el, options)
	    }
	  }

	  // link parent dirs
	  var parent = vm.$parent
	  var parentDirs
	  if (parent && parentLinkFn) {
	    parentDirs = linkAndCapture(function () {
	      parentLinkFn(parent, el)
	    }, parent)
	  }

	  // link self
	  var selfDirs = linkAndCapture(function () {
	    if (propsLinkFn) propsLinkFn(vm, null)
	    if (replacerLinkFn) replacerLinkFn(vm, el)
	  }, vm)

	  // return the unlink function that tearsdown parent
	  // container directives.
	  return function rootUnlinkFn () {
	    teardownDirs(parent, parentDirs)
	    teardownDirs(vm, selfDirs)
	  }
	}

	/**
	 * Compile a node and return a nodeLinkFn based on the
	 * node type.
	 *
	 * @param {Node} node
	 * @param {Object} options
	 * @return {Function|null}
	 */

	function compileNode (node, options) {
	  var type = node.nodeType
	  if (type === 1 && node.tagName !== 'SCRIPT') {
	    return compileElement(node, options)
	  } else if (type === 3 && config.interpolate && node.data.trim()) {
	    return compileTextNode(node, options)
	  } else {
	    return null
	  }
	}

	/**
	 * Compile an element and return a nodeLinkFn.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function|null}
	 */

	function compileElement (el, options) {
	  var hasAttrs = el.hasAttributes()
	  // check element directives
	  var linkFn = checkElementDirectives(el, options)
	  // check terminal directives (repeat & if)
	  if (!linkFn && hasAttrs) {
	    linkFn = checkTerminalDirectives(el, options)
	  }
	  // check component
	  if (!linkFn) {
	    linkFn = checkComponent(el, options)
	  }
	  // normal directives
	  if (!linkFn && hasAttrs) {
	    linkFn = compileDirectives(el, options)
	  }
	  // if the element is a textarea, we need to interpolate
	  // its content on initial render.
	  if (el.tagName === 'TEXTAREA') {
	    var realLinkFn = linkFn
	    linkFn = function (vm, el) {
	      el.value = vm.$interpolate(el.value)
	      if (realLinkFn) realLinkFn(vm, el)
	    }
	    linkFn.terminal = true
	  }
	  return linkFn
	}

	/**
	 * Compile a textNode and return a nodeLinkFn.
	 *
	 * @param {TextNode} node
	 * @param {Object} options
	 * @return {Function|null} textNodeLinkFn
	 */

	function compileTextNode (node, options) {
	  var tokens = textParser.parse(node.data)
	  if (!tokens) {
	    return null
	  }
	  var frag = document.createDocumentFragment()
	  var el, token
	  for (var i = 0, l = tokens.length; i < l; i++) {
	    token = tokens[i]
	    el = token.tag
	      ? processTextToken(token, options)
	      : document.createTextNode(token.value)
	    frag.appendChild(el)
	  }
	  return makeTextNodeLinkFn(tokens, frag, options)
	}

	/**
	 * Process a single text token.
	 *
	 * @param {Object} token
	 * @param {Object} options
	 * @return {Node}
	 */

	function processTextToken (token, options) {
	  var el
	  if (token.oneTime) {
	    el = document.createTextNode(token.value)
	  } else {
	    if (token.html) {
	      el = document.createComment('v-html')
	      setTokenType('html')
	    } else {
	      // IE will clean up empty textNodes during
	      // frag.cloneNode(true), so we have to give it
	      // something here...
	      el = document.createTextNode(' ')
	      setTokenType('text')
	    }
	  }
	  function setTokenType (type) {
	    token.type = type
	    token.def = resolveAsset(options, 'directives', type)
	    token.descriptor = dirParser.parse(token.value)[0]
	  }
	  return el
	}

	/**
	 * Build a function that processes a textNode.
	 *
	 * @param {Array<Object>} tokens
	 * @param {DocumentFragment} frag
	 */

	function makeTextNodeLinkFn (tokens, frag) {
	  return function textNodeLinkFn (vm, el) {
	    var fragClone = frag.cloneNode(true)
	    var childNodes = _.toArray(fragClone.childNodes)
	    var token, value, node
	    for (var i = 0, l = tokens.length; i < l; i++) {
	      token = tokens[i]
	      value = token.value
	      if (token.tag) {
	        node = childNodes[i]
	        if (token.oneTime) {
	          value = vm.$eval(value)
	          if (token.html) {
	            _.replace(node, templateParser.parse(value, true))
	          } else {
	            node.data = value
	          }
	        } else {
	          vm._bindDir(token.type, node,
	                      token.descriptor, token.def)
	        }
	      }
	    }
	    _.replace(el, fragClone)
	  }
	}

	/**
	 * Compile a node list and return a childLinkFn.
	 *
	 * @param {NodeList} nodeList
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function compileNodeList (nodeList, options) {
	  var linkFns = []
	  var nodeLinkFn, childLinkFn, node
	  for (var i = 0, l = nodeList.length; i < l; i++) {
	    node = nodeList[i]
	    nodeLinkFn = compileNode(node, options)
	    childLinkFn =
	      !(nodeLinkFn && nodeLinkFn.terminal) &&
	      node.tagName !== 'SCRIPT' &&
	      node.hasChildNodes()
	        ? compileNodeList(node.childNodes, options)
	        : null
	    linkFns.push(nodeLinkFn, childLinkFn)
	  }
	  return linkFns.length
	    ? makeChildLinkFn(linkFns)
	    : null
	}

	/**
	 * Make a child link function for a node's childNodes.
	 *
	 * @param {Array<Function>} linkFns
	 * @return {Function} childLinkFn
	 */

	function makeChildLinkFn (linkFns) {
	  return function childLinkFn (vm, nodes, host) {
	    var node, nodeLinkFn, childrenLinkFn
	    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
	      node = nodes[n]
	      nodeLinkFn = linkFns[i++]
	      childrenLinkFn = linkFns[i++]
	      // cache childNodes before linking parent, fix #657
	      var childNodes = _.toArray(node.childNodes)
	      if (nodeLinkFn) {
	        nodeLinkFn(vm, node, host)
	      }
	      if (childrenLinkFn) {
	        childrenLinkFn(vm, childNodes, host)
	      }
	    }
	  }
	}

	/**
	 * Compile param attributes on a root element and return
	 * a props link function.
	 *
	 * @param {Element|DocumentFragment} el
	 * @param {Object} attrs
	 * @param {Array} propDescriptors
	 * @return {Function} propsLinkFn
	 */

	var dataAttrRE = /^data-/
	var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/
	var literalValueRE = /^(true|false)$|\d.*/
	var identRE = __webpack_require__(23).identRE

	function compileProps (el, attrs, propDescriptors) {
	  var props = []
	  var i = propDescriptors.length
	  var descriptor, name, assertions, value, path, prop, literal, single
	  while (i--) {
	    descriptor = propDescriptors[i]
	    // normalize prop string/descriptor
	    if (typeof descriptor === 'object') {
	      name = descriptor.name
	      assertions = descriptor
	    } else {
	      name = descriptor
	      assertions = null
	    }
	    // props could contain dashes, which will be
	    // interpreted as minus calculations by the parser
	    // so we need to camelize the path here
	    path = _.camelize(name.replace(dataAttrRE, ''))
	    if (/[A-Z]/.test(name)) {
	      _.warn(
	        'You seem to be using camelCase for a component prop, ' +
	        'but HTML doesn\'t differentiate between upper and ' +
	        'lower case. You should use hyphen-delimited ' +
	        'attribute names. For more info see ' +
	        'http://vuejs.org/api/options.html#props'
	      )
	    }
	    if (!identRE.test(path)) {
	      _.warn(
	        'Invalid prop key: "' + name + '". Prop keys ' +
	        'must be valid identifiers.'
	      )
	    }
	    value = attrs[name]
	    /* jshint eqeqeq:false */
	    if (value != null) {
	      prop = {
	        name: name,
	        raw: value,
	        path: path,
	        assertions: assertions,
	        mode: propBindingModes.ONE_WAY
	      }
	      var tokens = textParser.parse(value)
	      if (tokens) {
	        if (el && el.nodeType === 1) {
	          el.removeAttribute(name)
	        }
	        // important so that this doesn't get compiled
	        // again as a normal attribute binding
	        attrs[name] = null
	        prop.dynamic = true
	        prop.parentPath = textParser.tokensToExp(tokens)
	        // check prop binding type.
	        single = tokens.length === 1
	        literal = literalValueRE.test(prop.parentPath)
	        // one time: {{* prop}}
	        if (literal || (single && tokens[0].oneTime)) {
	          prop.mode = propBindingModes.ONE_TIME
	        } else if (
	          !literal &&
	          (single && tokens[0].twoWay)
	        ) {
	          if (settablePathRE.test(prop.parentPath)) {
	            prop.mode = propBindingModes.TWO_WAY
	          } else {
	            _.warn(
	              'Cannot bind two-way prop with non-settable ' +
	              'parent path: ' + prop.parentPath
	            )
	          }
	        }
	      }
	      props.push(prop)
	    } else if (assertions && assertions.required) {
	      _.warn(
	        'Missing required prop: ' + name
	      )
	    }
	  }
	  return makePropsLinkFn(props)
	}

	/**
	 * Build a function that applies props to a vm.
	 *
	 * @param {Array} props
	 * @return {Function} propsLinkFn
	 */

	function makePropsLinkFn (props) {
	  return function propsLinkFn (vm, el) {
	    var i = props.length
	    var prop, path, value
	    while (i--) {
	      prop = props[i]
	      path = prop.path
	      if (prop.dynamic) {
	        if (vm.$parent) {
	          if (prop.mode === propBindingModes.ONE_TIME) {
	            // one time binding
	            value = vm.$parent.$get(prop.parentPath)
	            if (_.assertProp(prop, value)) {
	              vm.$set(path, value)
	            }
	          } else {
	            // dynamic binding
	            vm._bindDir('prop', el, prop, propDef)
	          }
	        } else {
	          _.warn(
	            'Cannot bind dynamic prop on a root instance' +
	            ' with no parent: ' + prop.name + '="' +
	            prop.raw + '"'
	          )
	        }
	      } else {
	        // literal, cast it and just set once
	        value = _.toBoolean(_.toNumber(prop.raw))
	        if (_.assertProp(prop, value)) {
	          vm.$set(path, value)
	        }
	      }
	    }
	  }
	}

	/**
	 * Check for element directives (custom elements that should
	 * be resovled as terminal directives).
	 *
	 * @param {Element} el
	 * @param {Object} options
	 */

	function checkElementDirectives (el, options) {
	  var tag = el.tagName.toLowerCase()
	  var def = resolveAsset(options, 'elementDirectives', tag)
	  if (def) {
	    return makeTerminalNodeLinkFn(el, tag, '', options, def)
	  }
	}

	/**
	 * Check if an element is a component. If yes, return
	 * a component link function.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function checkComponent (el, options) {
	  var componentId = _.checkComponent(el, options)
	  if (componentId) {
	    var componentLinkFn = function (vm, el, host) {
	      vm._bindDir('component', el, {
	        expression: componentId
	      }, componentDef, host)
	    }
	    componentLinkFn.terminal = true
	    return componentLinkFn
	  }
	}

	/**
	 * Check an element for terminal directives in fixed order.
	 * If it finds one, return a terminal link function.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function} terminalLinkFn
	 */

	function checkTerminalDirectives (el, options) {
	  if (_.attr(el, 'pre') !== null) {
	    return skip
	  }
	  var value, dirName
	  /* jshint boss: true */
	  for (var i = 0, l = terminalDirectives.length; i < l; i++) {
	    dirName = terminalDirectives[i]
	    if ((value = _.attr(el, dirName)) !== null) {
	      return makeTerminalNodeLinkFn(el, dirName, value, options)
	    }
	  }
	}

	function skip () {}
	skip.terminal = true

	/**
	 * Build a node link function for a terminal directive.
	 * A terminal link function terminates the current
	 * compilation recursion and handles compilation of the
	 * subtree in the directive.
	 *
	 * @param {Element} el
	 * @param {String} dirName
	 * @param {String} value
	 * @param {Object} options
	 * @param {Object} [def]
	 * @return {Function} terminalLinkFn
	 */

	function makeTerminalNodeLinkFn (el, dirName, value, options, def) {
	  var descriptor = dirParser.parse(value)[0]
	  // no need to call resolveAsset since terminal directives
	  // are always internal
	  def = def || options.directives[dirName]
	  var fn = function terminalNodeLinkFn (vm, el, host) {
	    vm._bindDir(dirName, el, descriptor, def, host)
	  }
	  fn.terminal = true
	  return fn
	}

	/**
	 * Compile the directives on an element and return a linker.
	 *
	 * @param {Element|Object} elOrAttrs
	 *        - could be an object of already-extracted
	 *          container attributes.
	 * @param {Object} options
	 * @return {Function}
	 */

	function compileDirectives (elOrAttrs, options) {
	  var attrs = _.isPlainObject(elOrAttrs)
	    ? mapToList(elOrAttrs)
	    : elOrAttrs.attributes
	  var i = attrs.length
	  var dirs = []
	  var attr, name, value, dir, dirName, dirDef
	  while (i--) {
	    attr = attrs[i]
	    name = attr.name
	    value = attr.value
	    if (value === null) continue
	    if (name.indexOf(config.prefix) === 0) {
	      dirName = name.slice(config.prefix.length)
	      dirDef = resolveAsset(options, 'directives', dirName)
	      _.assertAsset(dirDef, 'directive', dirName)
	      if (dirDef) {
	        dirs.push({
	          name: dirName,
	          descriptors: dirParser.parse(value),
	          def: dirDef
	        })
	      }
	    } else if (config.interpolate) {
	      dir = collectAttrDirective(name, value, options)
	      if (dir) {
	        dirs.push(dir)
	      }
	    }
	  }
	  // sort by priority, LOW to HIGH
	  if (dirs.length) {
	    dirs.sort(directiveComparator)
	    return makeNodeLinkFn(dirs)
	  }
	}

	/**
	 * Convert a map (Object) of attributes to an Array.
	 *
	 * @param {Object} map
	 * @return {Array}
	 */

	function mapToList (map) {
	  var list = []
	  for (var key in map) {
	    list.push({
	      name: key,
	      value: map[key]
	    })
	  }
	  return list
	}

	/**
	 * Build a link function for all directives on a single node.
	 *
	 * @param {Array} directives
	 * @return {Function} directivesLinkFn
	 */

	function makeNodeLinkFn (directives) {
	  return function nodeLinkFn (vm, el, host) {
	    // reverse apply because it's sorted low to high
	    var i = directives.length
	    var dir, j, k
	    while (i--) {
	      dir = directives[i]
	      if (dir._link) {
	        // custom link fn
	        dir._link(vm, el)
	      } else {
	        k = dir.descriptors.length
	        for (j = 0; j < k; j++) {
	          vm._bindDir(dir.name, el,
	            dir.descriptors[j], dir.def, host)
	        }
	      }
	    }
	  }
	}

	/**
	 * Check an attribute for potential dynamic bindings,
	 * and return a directive object.
	 *
	 * @param {String} name
	 * @param {String} value
	 * @param {Object} options
	 * @return {Object}
	 */

	function collectAttrDirective (name, value, options) {
	  var tokens = textParser.parse(value)
	  if (tokens) {
	    var def = options.directives.attr
	    var i = tokens.length
	    var allOneTime = true
	    while (i--) {
	      var token = tokens[i]
	      if (token.tag && !token.oneTime) {
	        allOneTime = false
	      }
	    }
	    return {
	      def: def,
	      _link: allOneTime
	        ? function (vm, el) {
	            el.setAttribute(name, vm.$interpolate(value))
	          }
	        : function (vm, el) {
	            var value = textParser.tokensToExp(tokens, vm)
	            var desc = dirParser.parse(name + ':' + value)[0]
	            vm._bindDir('attr', el, desc, def)
	          }
	    }
	  }
	}

	/**
	 * Directive priority sort comparator
	 *
	 * @param {Object} a
	 * @param {Object} b
	 */

	function directiveComparator (a, b) {
	  a = a.def.priority || 0
	  b = b.def.priority || 0
	  return a > b ? 1 : -1
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Cache = __webpack_require__(13)
	var templateCache = new Cache(1000)
	var idSelectorCache = new Cache(1000)

	var map = {
	  _default : [0, '', ''],
	  legend   : [1, '<fieldset>', '</fieldset>'],
	  tr       : [2, '<table><tbody>', '</tbody></table>'],
	  col      : [
	    2,
	    '<table><tbody></tbody><colgroup>',
	    '</colgroup></table>'
	  ]
	}

	map.td =
	map.th = [
	  3,
	  '<table><tbody><tr>',
	  '</tr></tbody></table>'
	]

	map.option =
	map.optgroup = [
	  1,
	  '<select multiple="multiple">',
	  '</select>'
	]

	map.thead =
	map.tbody =
	map.colgroup =
	map.caption =
	map.tfoot = [1, '<table>', '</table>']

	map.g =
	map.defs =
	map.symbol =
	map.use =
	map.image =
	map.text =
	map.circle =
	map.ellipse =
	map.line =
	map.path =
	map.polygon =
	map.polyline =
	map.rect = [
	  1,
	  '<svg ' +
	    'xmlns="http://www.w3.org/2000/svg" ' +
	    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
	    'xmlns:ev="http://www.w3.org/2001/xml-events"' +
	    'version="1.1">',
	  '</svg>'
	]

	var tagRE = /<([\w:]+)/
	var entityRE = /&\w+;/

	/**
	 * Convert a string template to a DocumentFragment.
	 * Determines correct wrapping by tag types. Wrapping
	 * strategy found in jQuery & component/domify.
	 *
	 * @param {String} templateString
	 * @return {DocumentFragment}
	 */

	function stringToFragment (templateString) {
	  // try a cache hit first
	  var hit = templateCache.get(templateString)
	  if (hit) {
	    return hit
	  }

	  var frag = document.createDocumentFragment()
	  var tagMatch = templateString.match(tagRE)
	  var entityMatch = entityRE.test(templateString)

	  if (!tagMatch && !entityMatch) {
	    // text only, return a single text node.
	    frag.appendChild(
	      document.createTextNode(templateString)
	    )
	  } else {

	    var tag    = tagMatch && tagMatch[1]
	    var wrap   = map[tag] || map._default
	    var depth  = wrap[0]
	    var prefix = wrap[1]
	    var suffix = wrap[2]
	    var node   = document.createElement('div')

	    node.innerHTML = prefix + templateString.trim() + suffix
	    while (depth--) {
	      node = node.lastChild
	    }

	    var child
	    /* jshint boss:true */
	    while (child = node.firstChild) {
	      frag.appendChild(child)
	    }
	  }

	  templateCache.put(templateString, frag)
	  return frag
	}

	/**
	 * Convert a template node to a DocumentFragment.
	 *
	 * @param {Node} node
	 * @return {DocumentFragment}
	 */

	function nodeToFragment (node) {
	  // if its a template tag and the browser supports it,
	  // its content is already a document fragment.
	  if (
	    _.isTemplate(node) &&
	    node.content instanceof DocumentFragment
	  ) {
	    return node.content
	  }
	  // script template
	  if (node.tagName === 'SCRIPT') {
	    return stringToFragment(node.textContent)
	  }
	  // normal node, clone it to avoid mutating the original
	  var clone = exports.clone(node)
	  var frag = document.createDocumentFragment()
	  var child
	  /* jshint boss:true */
	  while (child = clone.firstChild) {
	    frag.appendChild(child)
	  }
	  return frag
	}

	// Test for the presence of the Safari template cloning bug
	// https://bugs.webkit.org/show_bug.cgi?id=137755
	var hasBrokenTemplate = _.inBrowser
	  ? (function () {
	      var a = document.createElement('div')
	      a.innerHTML = '<template>1</template>'
	      return !a.cloneNode(true).firstChild.innerHTML
	    })()
	  : false

	// Test for IE10/11 textarea placeholder clone bug
	var hasTextareaCloneBug = _.inBrowser
	  ? (function () {
	      var t = document.createElement('textarea')
	      t.placeholder = 't'
	      return t.cloneNode(true).value === 't'
	    })()
	  : false

	/**
	 * 1. Deal with Safari cloning nested <template> bug by
	 *    manually cloning all template instances.
	 * 2. Deal with IE10/11 textarea placeholder bug by setting
	 *    the correct value after cloning.
	 *
	 * @param {Element|DocumentFragment} node
	 * @return {Element|DocumentFragment}
	 */

	exports.clone = function (node) {
	  var res = node.cloneNode(true)
	  var i, original, cloned
	  /* istanbul ignore if */
	  if (hasBrokenTemplate) {
	    original = node.querySelectorAll('template')
	    if (original.length) {
	      cloned = res.querySelectorAll('template')
	      i = cloned.length
	      while (i--) {
	        cloned[i].parentNode.replaceChild(
	          original[i].cloneNode(true),
	          cloned[i]
	        )
	      }
	    }
	  }
	  /* istanbul ignore if */
	  if (hasTextareaCloneBug) {
	    if (node.tagName === 'TEXTAREA') {
	      res.value = node.value
	    } else {
	      original = node.querySelectorAll('textarea')
	      if (original.length) {
	        cloned = res.querySelectorAll('textarea')
	        i = cloned.length
	        while (i--) {
	          cloned[i].value = original[i].value
	        }
	      }
	    }
	  }
	  return res
	}

	/**
	 * Process the template option and normalizes it into a
	 * a DocumentFragment that can be used as a partial or a
	 * instance template.
	 *
	 * @param {*} template
	 *    Possible values include:
	 *    - DocumentFragment object
	 *    - Node object of type Template
	 *    - id selector: '#some-template-id'
	 *    - template string: '<div><span>{{msg}}</span></div>'
	 * @param {Boolean} clone
	 * @param {Boolean} noSelector
	 * @return {DocumentFragment|undefined}
	 */

	exports.parse = function (template, clone, noSelector) {
	  var node, frag

	  // if the template is already a document fragment,
	  // do nothing
	  if (template instanceof DocumentFragment) {
	    return clone
	      ? template.cloneNode(true)
	      : template
	  }

	  if (typeof template === 'string') {
	    // id selector
	    if (!noSelector && template.charAt(0) === '#') {
	      // id selector can be cached too
	      frag = idSelectorCache.get(template)
	      if (!frag) {
	        node = document.getElementById(template.slice(1))
	        if (node) {
	          frag = nodeToFragment(node)
	          // save selector to cache
	          idSelectorCache.put(template, frag)
	        }
	      }
	    } else {
	      // normal string template
	      frag = stringToFragment(template)
	    }
	  } else if (template.nodeType) {
	    // a direct node
	    frag = nodeToFragment(template)
	  }

	  return frag && clone
	    ? exports.clone(frag)
	    : frag
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A doubly linked list-based Least Recently Used (LRU)
	 * cache. Will keep most recently used items while
	 * discarding least recently used items when its limit is
	 * reached. This is a bare-bone version of
	 * Rasmus Andersson's js-lru:
	 *
	 *   https://github.com/rsms/js-lru
	 *
	 * @param {Number} limit
	 * @constructor
	 */

	function Cache (limit) {
	  this.size = 0
	  this.limit = limit
	  this.head = this.tail = undefined
	  this._keymap = {}
	}

	var p = Cache.prototype

	/**
	 * Put <value> into the cache associated with <key>.
	 * Returns the entry which was removed to make room for
	 * the new entry. Otherwise undefined is returned.
	 * (i.e. if there was enough room already).
	 *
	 * @param {String} key
	 * @param {*} value
	 * @return {Entry|undefined}
	 */

	p.put = function (key, value) {
	  var entry = {
	    key:key,
	    value:value
	  }
	  this._keymap[key] = entry
	  if (this.tail) {
	    this.tail.newer = entry
	    entry.older = this.tail
	  } else {
	    this.head = entry
	  }
	  this.tail = entry
	  if (this.size === this.limit) {
	    return this.shift()
	  } else {
	    this.size++
	  }
	}

	/**
	 * Purge the least recently used (oldest) entry from the
	 * cache. Returns the removed entry or undefined if the
	 * cache was empty.
	 */

	p.shift = function () {
	  var entry = this.head
	  if (entry) {
	    this.head = this.head.newer
	    this.head.older = undefined
	    entry.newer = entry.older = undefined
	    this._keymap[entry.key] = undefined
	  }
	  return entry
	}

	/**
	 * Get and register recent use of <key>. Returns the value
	 * associated with <key> or undefined if not in cache.
	 *
	 * @param {String} key
	 * @param {Boolean} returnEntry
	 * @return {Entry|*}
	 */

	p.get = function (key, returnEntry) {
	  var entry = this._keymap[key]
	  if (entry === undefined) return
	  if (entry === this.tail) {
	    return returnEntry
	      ? entry
	      : entry.value
	  }
	  // HEAD--------------TAIL
	  //   <.older   .newer>
	  //  <--- add direction --
	  //   A  B  C  <D>  E
	  if (entry.newer) {
	    if (entry === this.head) {
	      this.head = entry.newer
	    }
	    entry.newer.older = entry.older // C <-- E.
	  }
	  if (entry.older) {
	    entry.older.newer = entry.newer // C. --> E
	  }
	  entry.newer = undefined // D --x
	  entry.older = this.tail // D. --> E
	  if (this.tail) {
	    this.tail.newer = entry // E. <-- D
	  }
	  this.tail = entry
	  return returnEntry
	    ? entry
	    : entry.value
	}

	module.exports = Cache

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Cache = __webpack_require__(13)
	var config = __webpack_require__(3)
	var dirParser = __webpack_require__(15)
	var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
	var cache, tagRE, htmlRE, firstChar, lastChar

	/**
	 * Escape a string so it can be used in a RegExp
	 * constructor.
	 *
	 * @param {String} str
	 */

	function escapeRegex (str) {
	  return str.replace(regexEscapeRE, '\\$&')
	}

	/**
	 * Compile the interpolation tag regex.
	 *
	 * @return {RegExp}
	 */

	function compileRegex () {
	  config._delimitersChanged = false
	  var open = config.delimiters[0]
	  var close = config.delimiters[1]
	  firstChar = open.charAt(0)
	  lastChar = close.charAt(close.length - 1)
	  var firstCharRE = escapeRegex(firstChar)
	  var lastCharRE = escapeRegex(lastChar)
	  var openRE = escapeRegex(open)
	  var closeRE = escapeRegex(close)
	  tagRE = new RegExp(
	    firstCharRE + '?' + openRE +
	    '(.+?)' +
	    closeRE + lastCharRE + '?',
	    'g'
	  )
	  htmlRE = new RegExp(
	    '^' + firstCharRE + openRE +
	    '.*' +
	    closeRE + lastCharRE + '$'
	  )
	  // reset cache
	  cache = new Cache(1000)
	}

	/**
	 * Parse a template text string into an array of tokens.
	 *
	 * @param {String} text
	 * @return {Array<Object> | null}
	 *               - {String} type
	 *               - {String} value
	 *               - {Boolean} [html]
	 *               - {Boolean} [oneTime]
	 */

	exports.parse = function (text) {
	  if (config._delimitersChanged) {
	    compileRegex()
	  }
	  var hit = cache.get(text)
	  if (hit) {
	    return hit
	  }
	  text = text.replace(/\n/g, '')
	  if (!tagRE.test(text)) {
	    return null
	  }
	  var tokens = []
	  var lastIndex = tagRE.lastIndex = 0
	  var match, index, value, first, oneTime, twoWay
	  /* jshint boss:true */
	  while (match = tagRE.exec(text)) {
	    index = match.index
	    // push text token
	    if (index > lastIndex) {
	      tokens.push({
	        value: text.slice(lastIndex, index)
	      })
	    }
	    // tag token
	    first = match[1].charCodeAt(0)
	    oneTime = first === 42 // *
	    twoWay = first === 64  // @
	    value = oneTime || twoWay
	      ? match[1].slice(1)
	      : match[1]
	    tokens.push({
	      tag: true,
	      value: value.trim(),
	      html: htmlRE.test(match[0]),
	      oneTime: oneTime,
	      twoWay: twoWay
	    })
	    lastIndex = index + match[0].length
	  }
	  if (lastIndex < text.length) {
	    tokens.push({
	      value: text.slice(lastIndex)
	    })
	  }
	  cache.put(text, tokens)
	  return tokens
	}

	/**
	 * Format a list of tokens into an expression.
	 * e.g. tokens parsed from 'a {{b}} c' can be serialized
	 * into one single expression as '"a " + b + " c"'.
	 *
	 * @param {Array} tokens
	 * @param {Vue} [vm]
	 * @return {String}
	 */

	exports.tokensToExp = function (tokens, vm) {
	  return tokens.length > 1
	    ? tokens.map(function (token) {
	        return formatToken(token, vm)
	      }).join('+')
	    : formatToken(tokens[0], vm, true)
	}

	/**
	 * Format a single token.
	 *
	 * @param {Object} token
	 * @param {Vue} [vm]
	 * @param {Boolean} single
	 * @return {String}
	 */

	function formatToken (token, vm, single) {
	  return token.tag
	    ? vm && token.oneTime
	      ? '"' + vm.$eval(token.value) + '"'
	      : inlineFilters(token.value, single)
	    : '"' + token.value + '"'
	}

	/**
	 * For an attribute with multiple interpolation tags,
	 * e.g. attr="some-{{thing | filter}}", in order to combine
	 * the whole thing into a single watchable expression, we
	 * have to inline those filters. This function does exactly
	 * that. This is a bit hacky but it avoids heavy changes
	 * to directive parser and watcher mechanism.
	 *
	 * @param {String} exp
	 * @param {Boolean} single
	 * @return {String}
	 */

	var filterRE = /[^|]\|[^|]/
	function inlineFilters (exp, single) {
	  if (!filterRE.test(exp)) {
	    return single
	      ? exp
	      : '(' + exp + ')'
	  } else {
	    var dir = dirParser.parse(exp)[0]
	    if (!dir.filters) {
	      return '(' + exp + ')'
	    } else {
	      return 'this._applyFilters(' +
	        dir.expression + // value
	        ',null,' +       // oldValue (null for read)
	        JSON.stringify(dir.filters) + // filter descriptors
	        ',false)'        // write?
	    }
	  }
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Cache = __webpack_require__(13)
	var cache = new Cache(1000)
	var argRE = /^[^\{\?]+$|^'[^']*'$|^"[^"]*"$/
	var filterTokenRE = /[^\s'"]+|'[^']+'|"[^"]+"/g
	var reservedArgRE = /^in$|^-?\d+/

	/**
	 * Parser state
	 */

	var str
	var c, i, l
	var inSingle
	var inDouble
	var curly
	var square
	var paren
	var begin
	var argIndex
	var dirs
	var dir
	var lastFilterIndex
	var arg

	/**
	 * Push a directive object into the result Array
	 */

	function pushDir () {
	  dir.raw = str.slice(begin, i).trim()
	  if (dir.expression === undefined) {
	    dir.expression = str.slice(argIndex, i).trim()
	  } else if (lastFilterIndex !== begin) {
	    pushFilter()
	  }
	  if (i === 0 || dir.expression) {
	    dirs.push(dir)
	  }
	}

	/**
	 * Push a filter to the current directive object
	 */

	function pushFilter () {
	  var exp = str.slice(lastFilterIndex, i).trim()
	  var filter
	  if (exp) {
	    filter = {}
	    var tokens = exp.match(filterTokenRE)
	    filter.name = tokens[0]
	    if (tokens.length > 1) {
	      filter.args = tokens.slice(1).map(processFilterArg)
	    }
	  }
	  if (filter) {
	    (dir.filters = dir.filters || []).push(filter)
	  }
	  lastFilterIndex = i + 1
	}

	/**
	 * Check if an argument is dynamic and strip quotes.
	 *
	 * @param {String} arg
	 * @return {Object}
	 */

	function processFilterArg (arg) {
	  var stripped = reservedArgRE.test(arg)
	    ? arg
	    : _.stripQuotes(arg)
	  return {
	    value: stripped || arg,
	    dynamic: !stripped
	  }
	}

	/**
	 * Parse a directive string into an Array of AST-like
	 * objects representing directives.
	 *
	 * Example:
	 *
	 * "click: a = a + 1 | uppercase" will yield:
	 * {
	 *   arg: 'click',
	 *   expression: 'a = a + 1',
	 *   filters: [
	 *     { name: 'uppercase', args: null }
	 *   ]
	 * }
	 *
	 * @param {String} str
	 * @return {Array<Object>}
	 */

	exports.parse = function (s) {

	  var hit = cache.get(s)
	  if (hit) {
	    return hit
	  }

	  // reset parser state
	  str = s
	  inSingle = inDouble = false
	  curly = square = paren = begin = argIndex = 0
	  lastFilterIndex = 0
	  dirs = []
	  dir = {}
	  arg = null

	  for (i = 0, l = str.length; i < l; i++) {
	    c = str.charCodeAt(i)
	    if (inSingle) {
	      // check single quote
	      if (c === 0x27) inSingle = !inSingle
	    } else if (inDouble) {
	      // check double quote
	      if (c === 0x22) inDouble = !inDouble
	    } else if (
	      c === 0x2C && // comma
	      !paren && !curly && !square
	    ) {
	      // reached the end of a directive
	      pushDir()
	      // reset & skip the comma
	      dir = {}
	      begin = argIndex = lastFilterIndex = i + 1
	    } else if (
	      c === 0x3A && // colon
	      !dir.expression &&
	      !dir.arg
	    ) {
	      // argument
	      arg = str.slice(begin, i).trim()
	      // test for valid argument here
	      // since we may have caught stuff like first half of
	      // an object literal or a ternary expression.
	      if (argRE.test(arg)) {
	        argIndex = i + 1
	        dir.arg = _.stripQuotes(arg) || arg
	      }
	    } else if (
	      c === 0x7C && // pipe
	      str.charCodeAt(i + 1) !== 0x7C &&
	      str.charCodeAt(i - 1) !== 0x7C
	    ) {
	      if (dir.expression === undefined) {
	        // first filter, end of expression
	        lastFilterIndex = i + 1
	        dir.expression = str.slice(argIndex, i).trim()
	      } else {
	        // already has filter
	        pushFilter()
	      }
	    } else {
	      switch (c) {
	        case 0x22: inDouble = true; break // "
	        case 0x27: inSingle = true; break // '
	        case 0x28: paren++; break         // (
	        case 0x29: paren--; break         // )
	        case 0x5B: square++; break        // [
	        case 0x5D: square--; break        // ]
	        case 0x7B: curly++; break         // {
	        case 0x7D: curly--; break         // }
	      }
	    }
	  }

	  if (i === 0 || begin !== i) {
	    pushDir()
	  }

	  cache.put(s, dirs)
	  return dirs
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Watcher = __webpack_require__(17)
	var bindingModes = __webpack_require__(3)._propBindingModes

	module.exports = {

	  bind: function () {

	    var child = this.vm
	    var parent = child.$parent
	    // passed in from compiler directly
	    var prop = this._descriptor
	    var childKey = prop.path
	    var parentKey = prop.parentPath

	    // simple lock to avoid circular updates.
	    // without this it would stabilize too, but this makes
	    // sure it doesn't cause other watchers to re-evaluate.
	    var locked = false

	    this.parentWatcher = new Watcher(
	      parent,
	      parentKey,
	      function (val) {
	        if (!locked) {
	          locked = true
	          // all props have been initialized already
	          if (_.assertProp(prop, val)) {
	            child[childKey] = val
	          }
	          locked = false
	        }
	      },
	      { sync: true }
	    )
	    
	    // set the child initial value first, before setting
	    // up the child watcher to avoid triggering it
	    // immediately.
	    var value = this.parentWatcher.value
	    if (_.assertProp(prop, value)) {
	      child.$set(childKey, value)
	    }

	    // only setup two-way binding if this is not a one-way
	    // binding.
	    if (prop.mode === bindingModes.TWO_WAY) {
	      this.childWatcher = new Watcher(
	        child,
	        childKey,
	        function (val) {
	          if (!locked) {
	            locked = true
	            parent.$set(parentKey, val)
	            locked = false
	          }
	        },
	        { sync: true }
	      )
	    }
	  },

	  unbind: function () {
	    if (this.parentWatcher) {
	      this.parentWatcher.teardown()
	    }
	    if (this.childWatcher) {
	      this.childWatcher.teardown()
	    }
	  }
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(3)
	var Observer = __webpack_require__(18)
	var expParser = __webpack_require__(22)
	var batcher = __webpack_require__(25)
	var uid = 0

	/**
	 * A watcher parses an expression, collects dependencies,
	 * and fires callback when the expression value changes.
	 * This is used for both the $watch() api and directives.
	 *
	 * @param {Vue} vm
	 * @param {String} expression
	 * @param {Function} cb
	 * @param {Object} options
	 *                 - {Array} filters
	 *                 - {Boolean} twoWay
	 *                 - {Boolean} deep
	 *                 - {Boolean} user
	 *                 - {Boolean} sync
	 *                 - {Function} [preProcess]
	 * @constructor
	 */

	function Watcher (vm, expOrFn, cb, options) {
	  var isFn = typeof expOrFn === 'function'
	  this.vm = vm
	  vm._watchers.push(this)
	  this.expression = isFn ? '' : expOrFn
	  this.cb = cb
	  this.id = ++uid // uid for batching
	  this.active = true
	  options = options || {}
	  this.deep = !!options.deep
	  this.user = !!options.user
	  this.twoWay = !!options.twoWay
	  this.sync = !!options.sync
	  this.filters = options.filters
	  this.preProcess = options.preProcess
	  this.deps = []
	  this.newDeps = []
	  // parse expression for getter/setter
	  if (isFn) {
	    this.getter = expOrFn
	    this.setter = undefined
	  } else {
	    var res = expParser.parse(expOrFn, options.twoWay)
	    this.getter = res.get
	    this.setter = res.set
	  }
	  this.value = this.get()
	}

	var p = Watcher.prototype

	/**
	 * Add a dependency to this directive.
	 *
	 * @param {Dep} dep
	 */

	p.addDep = function (dep) {
	  var newDeps = this.newDeps
	  var old = this.deps
	  if (_.indexOf(newDeps, dep) < 0) {
	    newDeps.push(dep)
	    var i = _.indexOf(old, dep)
	    if (i < 0) {
	      dep.addSub(this)
	    } else {
	      old[i] = null
	    }
	  }
	}

	/**
	 * Evaluate the getter, and re-collect dependencies.
	 */

	p.get = function () {
	  this.beforeGet()
	  var vm = this.vm
	  var value
	  try {
	    value = this.getter.call(vm, vm)
	  } catch (e) {
	    if (config.warnExpressionErrors) {
	      _.warn(
	        'Error when evaluating expression "' +
	        this.expression + '"', e
	      )
	    }
	  }
	  // "touch" every property so they are all tracked as
	  // dependencies for deep watching
	  if (this.deep) {
	    traverse(value)
	  }
	  if (this.preProcess) {
	    value = this.preProcess(value)
	  }
	  if (this.filters) {
	    value = vm._applyFilters(value, null, this.filters, false)
	  }
	  this.afterGet()
	  return value
	}

	/**
	 * Set the corresponding value with the setter.
	 *
	 * @param {*} value
	 */

	p.set = function (value) {
	  var vm = this.vm
	  if (this.filters) {
	    value = vm._applyFilters(
	      value, this.value, this.filters, true)
	  }
	  try {
	    this.setter.call(vm, vm, value)
	  } catch (e) {
	    if (config.warnExpressionErrors) {
	      _.warn(
	        'Error when evaluating setter "' +
	        this.expression + '"', e
	      )
	    }
	  }
	}

	/**
	 * Prepare for dependency collection.
	 */

	p.beforeGet = function () {
	  Observer.setTarget(this)
	}

	/**
	 * Clean up for dependency collection.
	 */

	p.afterGet = function () {
	  Observer.setTarget(null)
	  var i = this.deps.length
	  while (i--) {
	    var dep = this.deps[i]
	    if (dep) {
	      dep.removeSub(this)
	    }
	  }
	  this.deps = this.newDeps
	  this.newDeps = []
	}

	/**
	 * Subscriber interface.
	 * Will be called when a dependency changes.
	 */

	p.update = function () {
	  if (this.sync || !config.async) {
	    this.run()
	  } else {
	    batcher.push(this)
	  }
	}

	/**
	 * Batcher job interface.
	 * Will be called by the batcher.
	 */

	p.run = function () {
	  if (this.active) {
	    var value = this.get()
	    if (
	      value !== this.value ||
	      Array.isArray(value) ||
	      this.deep
	    ) {
	      var oldValue = this.value
	      this.value = value
	      this.cb(value, oldValue)
	    }
	  }
	}

	/**
	 * Remove self from all dependencies' subcriber list.
	 */

	p.teardown = function () {
	  if (this.active) {
	    // remove self from vm's watcher list
	    // we can skip this if the vm if being destroyed
	    // which can improve teardown performance.
	    if (!this.vm._isBeingDestroyed) {
	      this.vm._watchers.$remove(this)
	    }
	    var i = this.deps.length
	    while (i--) {
	      this.deps[i].removeSub(this)
	    }
	    this.active = false
	    this.vm = this.cb = this.value = null
	  }
	}


	/**
	 * Recrusively traverse an object to evoke all converted
	 * getters, so that every nested property inside the object
	 * is collected as a "deep" dependency.
	 *
	 * @param {Object} obj
	 */

	function traverse (obj) {
	  var key, val, i
	  for (key in obj) {
	    val = obj[key]
	    if (_.isArray(val)) {
	      i = val.length
	      while (i--) traverse(val[i])
	    } else if (_.isObject(val)) {
	      traverse(val)
	    }
	  }
	}

	module.exports = Watcher


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(3)
	var Dep = __webpack_require__(19)
	var arrayMethods = __webpack_require__(20)
	var arrayKeys = Object.getOwnPropertyNames(arrayMethods)
	__webpack_require__(21)

	var uid = 0

	/**
	 * Type enums
	 */

	var ARRAY  = 0
	var OBJECT = 1

	/**
	 * Observer class that are attached to each observed
	 * object. Once attached, the observer converts target
	 * object's property keys into getter/setters that
	 * collect dependencies and dispatches updates.
	 *
	 * @param {Array|Object} value
	 * @param {Number} type
	 * @constructor
	 */

	function Observer (value, type) {
	  this.id = ++uid
	  this.value = value
	  this.active = true
	  this.deps = []
	  _.define(value, '__ob__', this)
	  if (type === ARRAY) {
	    var augment = config.proto && _.hasProto
	      ? protoAugment
	      : copyAugment
	    augment(value, arrayMethods, arrayKeys)
	    this.observeArray(value)
	  } else if (type === OBJECT) {
	    this.walk(value)
	  }
	}

	// Static methods

	/**
	 * Attempt to create an observer instance for a value,
	 * returns the new observer if successfully observed,
	 * or the existing observer if the value already has one.
	 *
	 * @param {*} value
	 * @return {Observer|undefined}
	 * @static
	 */

	Observer.create = function (value) {
	  if (
	    value &&
	    value.hasOwnProperty('__ob__') &&
	    value.__ob__ instanceof Observer
	  ) {
	    return value.__ob__
	  } else if (_.isArray(value)) {
	    return new Observer(value, ARRAY)
	  } else if (
	    _.isPlainObject(value) &&
	    !value._isVue // avoid Vue instance
	  ) {
	    return new Observer(value, OBJECT)
	  }
	}

	/**
	 * Set the target watcher that is currently being evaluated.
	 *
	 * @param {Watcher} watcher
	 */

	Observer.setTarget = function (watcher) {
	  Dep.target = watcher
	}

	// Instance methods

	var p = Observer.prototype

	/**
	 * Walk through each property and convert them into
	 * getter/setters. This method should only be called when
	 * value type is Object. Properties prefixed with `$` or `_`
	 * and accessor properties are ignored.
	 *
	 * @param {Object} obj
	 */

	p.walk = function (obj) {
	  var keys = Object.keys(obj)
	  var i = keys.length
	  var key, prefix
	  while (i--) {
	    key = keys[i]
	    prefix = key.charCodeAt(0)
	    if (prefix !== 0x24 && prefix !== 0x5F) { // skip $ or _
	      this.convert(key, obj[key])
	    }
	  }
	}

	/**
	 * Try to carete an observer for a child value,
	 * and if value is array, link dep to the array.
	 *
	 * @param {*} val
	 * @return {Dep|undefined}
	 */

	p.observe = function (val) {
	  return Observer.create(val)
	}

	/**
	 * Observe a list of Array items.
	 *
	 * @param {Array} items
	 */

	p.observeArray = function (items) {
	  var i = items.length
	  while (i--) {
	    this.observe(items[i])
	  }
	}

	/**
	 * Convert a property into getter/setter so we can emit
	 * the events when the property is accessed/changed.
	 *
	 * @param {String} key
	 * @param {*} val
	 */

	p.convert = function (key, val) {
	  var ob = this
	  var childOb = ob.observe(val)
	  var dep = new Dep()
	  if (childOb) {
	    childOb.deps.push(dep)
	  }
	  Object.defineProperty(ob.value, key, {
	    enumerable: true,
	    configurable: true,
	    get: function () {
	      if (ob.active) {
	        dep.depend()
	      }
	      return val
	    },
	    set: function (newVal) {
	      if (newVal === val) return
	      // remove dep from old value
	      var oldChildOb = val && val.__ob__
	      if (oldChildOb) {
	        oldChildOb.deps.$remove(dep)
	      }
	      val = newVal
	      // add dep to new value
	      var newChildOb = ob.observe(newVal)
	      if (newChildOb) {
	        newChildOb.deps.push(dep)
	      }
	      dep.notify()
	    }
	  })
	}

	/**
	 * Notify change on all self deps on an observer.
	 * This is called when a mutable value mutates. e.g.
	 * when an Array's mutating methods are called, or an
	 * Object's $add/$delete are called.
	 */

	p.notify = function () {
	  var deps = this.deps
	  for (var i = 0, l = deps.length; i < l; i++) {
	    deps[i].notify()
	  }
	}

	/**
	 * Add an owner vm, so that when $add/$delete mutations
	 * happen we can notify owner vms to proxy the keys and
	 * digest the watchers. This is only called when the object
	 * is observed as an instance's root $data.
	 *
	 * @param {Vue} vm
	 */

	p.addVm = function (vm) {
	  (this.vms || (this.vms = [])).push(vm)
	}

	/**
	 * Remove an owner vm. This is called when the object is
	 * swapped out as an instance's $data object.
	 *
	 * @param {Vue} vm
	 */

	p.removeVm = function (vm) {
	  this.vms.$remove(vm)
	}

	// helpers

	/**
	 * Augment an target Object or Array by intercepting
	 * the prototype chain using __proto__
	 *
	 * @param {Object|Array} target
	 * @param {Object} proto
	 */

	function protoAugment (target, src) {
	  target.__proto__ = src
	}

	/**
	 * Augment an target Object or Array by defining
	 * hidden properties.
	 *
	 * @param {Object|Array} target
	 * @param {Object} proto
	 */

	function copyAugment (target, src, keys) {
	  var i = keys.length
	  var key
	  while (i--) {
	    key = keys[i]
	    _.define(target, key, src[key])
	  }
	}

	module.exports = Observer


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * A dep is an observable that can have multiple
	 * directives subscribing to it.
	 *
	 * @constructor
	 */

	function Dep () {
	  this.subs = []
	}

	// the current target watcher being evaluated.
	// this is globally unique because there could be only one
	// watcher being evaluated at any time.
	Dep.target = null

	var p = Dep.prototype

	/**
	 * Add a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	p.addSub = function (sub) {
	  this.subs.push(sub)
	}

	/**
	 * Remove a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	p.removeSub = function (sub) {
	  this.subs.$remove(sub)
	}

	/**
	 * Add self as a dependency to the target watcher.
	 */

	p.depend = function () {
	  if (Dep.target) {
	    Dep.target.addDep(this)
	  }
	}

	/**
	 * Notify all subscribers of a new value.
	 */

	p.notify = function () {
	  // stablize the subscriber list first
	  var subs = _.toArray(this.subs)
	  for (var i = 0, l = subs.length; i < l; i++) {
	    subs[i].update()
	  }
	}

	module.exports = Dep


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var arrayProto = Array.prototype
	var arrayMethods = Object.create(arrayProto)

	/**
	 * Intercept mutating methods and emit events
	 */

	;[
	  'push',
	  'pop',
	  'shift',
	  'unshift',
	  'splice',
	  'sort',
	  'reverse'
	]
	.forEach(function (method) {
	  // cache original method
	  var original = arrayProto[method]
	  _.define(arrayMethods, method, function mutator () {
	    // avoid leaking arguments:
	    // http://jsperf.com/closure-with-arguments
	    var i = arguments.length
	    var args = new Array(i)
	    while (i--) {
	      args[i] = arguments[i]
	    }
	    var result = original.apply(this, args)
	    var ob = this.__ob__
	    var inserted
	    switch (method) {
	      case 'push':
	        inserted = args
	        break
	      case 'unshift':
	        inserted = args
	        break
	      case 'splice':
	        inserted = args.slice(2)
	        break
	    }
	    if (inserted) ob.observeArray(inserted)
	    // notify change
	    ob.notify()
	    return result
	  })
	})

	/**
	 * Swap the element at the given index with a new value
	 * and emits corresponding event.
	 *
	 * @param {Number} index
	 * @param {*} val
	 * @return {*} - replaced element
	 */

	_.define(
	  arrayProto,
	  '$set',
	  function $set (index, val) {
	    if (index >= this.length) {
	      this.length = index + 1
	    }
	    return this.splice(index, 1, val)[0]
	  }
	)

	/**
	 * Convenience method to remove the element at given index.
	 *
	 * @param {Number} index
	 * @param {*} val
	 */

	_.define(
	  arrayProto,
	  '$remove',
	  function $remove (index) {
	    /* istanbul ignore if */
	    if (!this.length) return
	    if (typeof index !== 'number') {
	      index = _.indexOf(this, index)
	    }
	    if (index > -1) {
	      this.splice(index, 1)
	    }
	  }
	)

	module.exports = arrayMethods

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var objProto = Object.prototype

	/**
	 * Add a new property to an observed object
	 * and emits corresponding event
	 *
	 * @param {String} key
	 * @param {*} val
	 * @public
	 */

	_.define(
	  objProto,
	  '$add',
	  function $add (key, val) {
	    if (this.hasOwnProperty(key)) return
	    var ob = this.__ob__
	    if (!ob || _.isReserved(key)) {
	      this[key] = val
	      return
	    }
	    ob.convert(key, val)
	    ob.notify()
	    if (ob.vms) {
	      var i = ob.vms.length
	      while (i--) {
	        var vm = ob.vms[i]
	        vm._proxy(key)
	        vm._digest()
	      }
	    }
	  }
	)

	/**
	 * Set a property on an observed object, calling add to
	 * ensure the property is observed.
	 *
	 * @param {String} key
	 * @param {*} val
	 * @public
	 */

	_.define(
	  objProto,
	  '$set',
	  function $set (key, val) {
	    this.$add(key, val)
	    this[key] = val
	  }
	)

	/**
	 * Deletes a property from an observed object
	 * and emits corresponding event
	 *
	 * @param {String} key
	 * @public
	 */

	_.define(
	  objProto,
	  '$delete',
	  function $delete (key) {
	    if (!this.hasOwnProperty(key)) return
	    delete this[key]
	    var ob = this.__ob__
	    if (!ob || _.isReserved(key)) {
	      return
	    }
	    ob.notify()
	    if (ob.vms) {
	      var i = ob.vms.length
	      while (i--) {
	        var vm = ob.vms[i]
	        vm._unproxy(key)
	        vm._digest()
	      }
	    }
	  }
	)

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Path = __webpack_require__(23)
	var Cache = __webpack_require__(13)
	var notevil = __webpack_require__(24)
	var expressionCache = new Cache(1000)

	var allowedKeywords =
	  'Math,Date,this,true,false,null,undefined,Infinity,NaN,' +
	  'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' +
	  'encodeURIComponent,parseInt,parseFloat'
	var allowedKeywordsRE =
	  new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)')

	// keywords that don't make sense inside expressions
	var improperKeywords =
	  'break,case,class,catch,const,continue,debugger,default,' +
	  'delete,do,else,export,extends,finally,for,function,if,' +
	  'import,in,instanceof,let,return,super,switch,throw,try,' +
	  'var,while,with,yield,enum,await,implements,package,' +
	  'proctected,static,interface,private,public'
	var improperKeywordsRE =
	  new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)')

	var wsRE = /\s/g
	var newlineRE = /\n/g
	var saveRE = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|new |typeof |void /g
	var restoreRE = /"(\d+)"/g
	var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
	var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
	var booleanLiteralRE = /^(true|false)$/

	/**
	 * Save / Rewrite / Restore
	 *
	 * When rewriting paths found in an expression, it is
	 * possible for the same letter sequences to be found in
	 * strings and Object literal property keys. Therefore we
	 * remove and store these parts in a temporary array, and
	 * restore them after the path rewrite.
	 */

	var saved = []

	/**
	 * Save replacer
	 *
	 * The save regex can match two possible cases:
	 * 1. An opening object literal
	 * 2. A string
	 * If matched as a plain string, we need to escape its
	 * newlines, since the string needs to be preserved when
	 * generating the function body.
	 *
	 * @param {String} str
	 * @param {String} isString - str if matched as a string
	 * @return {String} - placeholder with index
	 */

	function save (str, isString) {
	  var i = saved.length
	  saved[i] = isString
	    ? str.replace(newlineRE, '\\n')
	    : str
	  return '"' + i + '"'
	}

	/**
	 * Path rewrite replacer
	 *
	 * @param {String} raw
	 * @return {String}
	 */

	function rewrite (raw) {
	  var c = raw.charAt(0)
	  var path = raw.slice(1)
	  if (allowedKeywordsRE.test(path)) {
	    return raw
	  } else {
	    path = path.indexOf('"') > -1
	      ? path.replace(restoreRE, restore)
	      : path
	    return c + 'scope.' + path
	  }
	}

	/**
	 * Restore replacer
	 *
	 * @param {String} str
	 * @param {String} i - matched save index
	 * @return {String}
	 */

	function restore (str, i) {
	  return saved[i]
	}

	/**
	 * Rewrite an expression, prefixing all path accessors with
	 * `scope.` and generate getter/setter functions.
	 *
	 * @param {String} exp
	 * @param {Boolean} needSet
	 * @return {Function}
	 */

	function compileExpFns (exp, needSet) {
	  if (improperKeywordsRE.test(exp)) {
	    _.warn(
	      'Avoid using reserved keywords in expression: '
	      + exp
	    )
	  }
	  // reset state
	  saved.length = 0
	  // save strings and object literal keys
	  var body = exp
	    .replace(saveRE, save)
	    .replace(wsRE, '')
	  // rewrite all paths
	  // pad 1 space here becaue the regex matches 1 extra char
	  body = (' ' + body)
	    .replace(pathReplaceRE, rewrite)
	    .replace(restoreRE, restore)
	  var getter = makeGetter(body)
	  if (getter) {
	    return {
	      get: getter,
	      body: body,
	      set: needSet
	        ? makeSetter(body)
	        : null
	    }
	  }
	}

	/**
	 * Compile getter setters for a simple path.
	 *
	 * @param {String} exp
	 * @return {Function}
	 */

	function compilePathFns (exp) {
	  var getter, path
	  if (exp.indexOf('[') < 0) {
	    // really simple path
	    path = exp.split('.')
	    path.raw = exp
	    getter = Path.compileGetter(path)
	  } else {
	    // do the real parsing
	    path = Path.parse(exp)
	    getter = path.get
	  }
	  return {
	    get: getter,
	    // always generate setter for simple paths
	    set: function (obj, val) {
	      Path.set(obj, path, val)
	    }
	  }
	}

	/**
	 * Build a getter function. Requires eval.
	 *
	 * We isolate the try/catch so it doesn't affect the
	 * optimization of the parse function when it is not called.
	 *
	 * @param {String} body
	 * @return {Function|undefined}
	 */

	function makeGetter (body) {
	  try {
	    var fn = notevil.Function(
	      'scope', 'Math',
	      'return ' + body + ';'
	    )
	    return function (scope) {
	      return fn.call(this, scope, Math)
	    }
	  } catch (e) {
	    _.warn(
	      'Invalid expression. ' +
	      'Generated function body: ' + body
	    )
	  }
	}

	/**
	 * Build a setter function.
	 *
	 * This is only needed in rare situations like "a[b]" where
	 * a settable path requires dynamic evaluation.
	 *
	 * This setter function may throw error when called if the
	 * expression body is not a valid left-hand expression in
	 * assignment.
	 *
	 * @param {String} body
	 * @return {Function|undefined}
	 */

	function makeSetter (body) {
	  try {
	    var fn = notevil.Function(
	      'scope', 'value', 'Math',
	      body + ' = value;'
	    )
	    return function (scope, value) {
	      try {
	        fn.call(this, scope, value, Math)
	      } catch (e) {}
	    }
	  } catch (e) {
	    _.warn('Invalid setter function body: ' + body)
	  }
	}

	/**
	 * Check for setter existence on a cache hit.
	 *
	 * @param {Function} hit
	 */

	function checkSetter (hit) {
	  if (!hit.set) {
	    hit.set = makeSetter(hit.body)
	  }
	}

	/**
	 * Parse an expression into re-written getter/setters.
	 *
	 * @param {String} exp
	 * @param {Boolean} needSet
	 * @return {Function}
	 */

	exports.parse = function (exp, needSet) {
	  exp = exp.trim()
	  // try cache
	  var hit = expressionCache.get(exp)
	  if (hit) {
	    if (needSet) {
	      checkSetter(hit)
	    }
	    return hit
	  }
	  // we do a simple path check to optimize for them.
	  // the check fails valid paths with unusal whitespaces,
	  // but that's too rare and we don't care.
	  // also skip boolean literals and paths that start with
	  // global "Math"
	  var res = exports.isSimplePath(exp)
	    ? compilePathFns(exp)
	    : compileExpFns(exp, needSet)
	  expressionCache.put(exp, res)
	  return res
	}

	/**
	 * Check if an expression is a simple path.
	 *
	 * @param {String} exp
	 * @return {Boolean}
	 */

	exports.isSimplePath = function (exp) {
	  return pathTestRE.test(exp) &&
	    // don't treat true/false as paths
	    !booleanLiteralRE.test(exp) &&
	    // Math constants e.g. Math.PI, Math.E etc.
	    exp.slice(0, 5) !== 'Math.'
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Cache = __webpack_require__(13)
	var pathCache = new Cache(1000)
	exports.identRE = /^[$_a-zA-Z]+[\w$]*$/

	/**
	 * Path-parsing algorithm scooped from Polymer/observe-js
	 */

	var pathStateMachine = {
	  'beforePath': {
	    'ws': ['beforePath'],
	    'ident': ['inIdent', 'append'],
	    '[': ['beforeElement'],
	    'eof': ['afterPath']
	  },

	  'inPath': {
	    'ws': ['inPath'],
	    '.': ['beforeIdent'],
	    '[': ['beforeElement'],
	    'eof': ['afterPath']
	  },

	  'beforeIdent': {
	    'ws': ['beforeIdent'],
	    'ident': ['inIdent', 'append']
	  },

	  'inIdent': {
	    'ident': ['inIdent', 'append'],
	    '0': ['inIdent', 'append'],
	    'number': ['inIdent', 'append'],
	    'ws': ['inPath', 'push'],
	    '.': ['beforeIdent', 'push'],
	    '[': ['beforeElement', 'push'],
	    'eof': ['afterPath', 'push'],
	    ']': ['inPath', 'push']
	  },

	  'beforeElement': {
	    'ws': ['beforeElement'],
	    '0': ['afterZero', 'append'],
	    'number': ['inIndex', 'append'],
	    "'": ['inSingleQuote', 'append', ''],
	    '"': ['inDoubleQuote', 'append', ''],
	    "ident": ['inIdent', 'append', '*']
	  },

	  'afterZero': {
	    'ws': ['afterElement', 'push'],
	    ']': ['inPath', 'push']
	  },

	  'inIndex': {
	    '0': ['inIndex', 'append'],
	    'number': ['inIndex', 'append'],
	    'ws': ['afterElement'],
	    ']': ['inPath', 'push']
	  },

	  'inSingleQuote': {
	    "'": ['afterElement'],
	    'eof': 'error',
	    'else': ['inSingleQuote', 'append']
	  },

	  'inDoubleQuote': {
	    '"': ['afterElement'],
	    'eof': 'error',
	    'else': ['inDoubleQuote', 'append']
	  },

	  'afterElement': {
	    'ws': ['afterElement'],
	    ']': ['inPath', 'push']
	  }
	}

	function noop () {}

	/**
	 * Determine the type of a character in a keypath.
	 *
	 * @param {Char} char
	 * @return {String} type
	 */

	function getPathCharType (char) {
	  if (char === undefined) {
	    return 'eof'
	  }

	  var code = char.charCodeAt(0)

	  switch(code) {
	    case 0x5B: // [
	    case 0x5D: // ]
	    case 0x2E: // .
	    case 0x22: // "
	    case 0x27: // '
	    case 0x30: // 0
	      return char

	    case 0x5F: // _
	    case 0x24: // $
	      return 'ident'

	    case 0x20: // Space
	    case 0x09: // Tab
	    case 0x0A: // Newline
	    case 0x0D: // Return
	    case 0xA0:  // No-break space
	    case 0xFEFF:  // Byte Order Mark
	    case 0x2028:  // Line Separator
	    case 0x2029:  // Paragraph Separator
	      return 'ws'
	  }

	  // a-z, A-Z
	  if ((0x61 <= code && code <= 0x7A) ||
	      (0x41 <= code && code <= 0x5A)) {
	    return 'ident'
	  }

	  // 1-9
	  if (0x31 <= code && code <= 0x39) {
	    return 'number'
	  }

	  return 'else'
	}

	/**
	 * Parse a string path into an array of segments
	 * Todo implement cache
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	function parsePath (path) {
	  var keys = []
	  var index = -1
	  var mode = 'beforePath'
	  var c, newChar, key, type, transition, action, typeMap

	  var actions = {
	    push: function() {
	      if (key === undefined) {
	        return
	      }
	      keys.push(key)
	      key = undefined
	    },
	    append: function() {
	      if (key === undefined) {
	        key = newChar
	      } else {
	        key += newChar
	      }
	    }
	  }

	  function maybeUnescapeQuote () {
	    var nextChar = path[index + 1]
	    if ((mode === 'inSingleQuote' && nextChar === "'") ||
	        (mode === 'inDoubleQuote' && nextChar === '"')) {
	      index++
	      newChar = nextChar
	      actions.append()
	      return true
	    }
	  }

	  while (mode) {
	    index++
	    c = path[index]

	    if (c === '\\' && maybeUnescapeQuote()) {
	      continue
	    }

	    type = getPathCharType(c)
	    typeMap = pathStateMachine[mode]
	    transition = typeMap[type] || typeMap['else'] || 'error'

	    if (transition === 'error') {
	      return // parse error
	    }

	    mode = transition[0]
	    action = actions[transition[1]] || noop
	    newChar = transition[2]
	    newChar = newChar === undefined
	      ? c
	      : newChar === '*'
	        ? newChar + c
	        : newChar
	    action()

	    if (mode === 'afterPath') {
	      keys.raw = path
	      return keys
	    }
	  }
	}

	/**
	 * Compiles a getter function with a fixed path.
	 * The fixed path getter supresses errors.
	 *
	 * @param {Array} path
	 * @return {Function}
	 */

	exports.compileGetter = function (path) {
	  return function get (obj) {
	    var original = obj
	    var segment
	    for (var i = 0, l = path.length; i < l; i++) {
	      segment = path[i]
	      if (segment.charAt(0) === '*') {
	        segment = original[segment.slice(1)]
	      }
	      obj = obj[segment]
	      if (i === l - 1) {
	        return obj
	      } else if (!_.isObject(obj)) {
	        return
	      }
	    }
	  }
	}

	/**
	 * External parse that check for a cache hit first
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	exports.parse = function (path) {
	  var hit = pathCache.get(path)
	  if (!hit) {
	    hit = parsePath(path)
	    if (hit) {
	      hit.get = exports.compileGetter(hit)
	      pathCache.put(path, hit)
	    }
	  }
	  return hit
	}

	/**
	 * Get from an object from a path string
	 *
	 * @param {Object} obj
	 * @param {String} path
	 */

	exports.get = function (obj, path) {
	  path = exports.parse(path)
	  if (path) {
	    return path.get(obj)
	  }
	}

	/**
	 * Set on an object from a path
	 *
	 * @param {Object} obj
	 * @param {String | Array} path
	 * @param {*} val
	 */

	exports.set = function (obj, path, val) {
	  var original = obj
	  if (typeof path === 'string') {
	    path = exports.parse(path)
	  }
	  if (!path || !_.isObject(obj)) {
	    return false
	  }
	  var last, key
	  for (var i = 0, l = path.length; i < l; i++) {
	    last = obj
	    key = path[i]
	    if (key.charAt(0) === '*') {
	      key = original[key.slice(1)]
	    }
	    if (i < l - 1) {
	      obj = obj[key]
	      if (!_.isObject(obj)) {
	        obj = {}
	        last.$add(key, obj)
	        warnNonExistent(path)
	      }
	    } else {
	      if (_.isArray(obj)) {
	        obj.$set(key, val)
	      } else if (key in obj) {
	        obj[key] = val
	      } else {
	        obj.$add(key, val)
	        warnNonExistent(path)
	      }
	    }
	  }
	  return true
	}

	function warnNonExistent (path) {
	  _.warn(
	    'You are setting a non-existent path "' + path.raw + '" ' +
	    'on a vm instance. Consider pre-initializing the property ' +
	    'with the "data" option for more reliable reactivity ' +
	    'and better performance.'
	  )
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	module.exports =
	/******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		/* WEBPACK VAR INJECTION */(function(global) {var parse = __webpack_require__(1).parse
		var hoist = __webpack_require__(2)

		var InfiniteChecker = __webpack_require__(3)
		var Primitives = __webpack_require__(4)

		module.exports = safeEval
		module.exports.eval = safeEval
		module.exports.FunctionFactory = FunctionFactory
		module.exports.Function = FunctionFactory()

		var maxIterations = 1000000

		// 'eval' with a controlled environment
		function safeEval(src, parentContext){
		  var tree = prepareAst(src)
		  var context = Object.create(parentContext || {})
		  return finalValue(evaluateAst(tree, context))
		}

		// create a 'Function' constructor for a controlled environment
		function FunctionFactory(parentContext){
		  var context = Object.create(parentContext || {})
		  return function Function() {
		    // normalize arguments array
		    var args = Array.prototype.slice.call(arguments)
		    var src = args.slice(-1)[0]
		    args = args.slice(0,-1)
		    if (typeof src === 'string'){
		      //HACK: esprima doesn't like returns outside functions
		      src = parse('function a(){' + src + '}').body[0].body
		    }
		    var tree = prepareAst(src)
		    return getFunction(tree, args, context)
		  }
		}

		// takes an AST or js source and returns an AST
		function prepareAst(src){
		  var tree = (typeof src === 'string') ? parse(src) : src
		  return hoist(tree)
		}

		// evaluate an AST in the given context
		function evaluateAst(tree, context){

		  var safeFunction = FunctionFactory(context)
		  var primitives = Primitives(context)

		  // block scoped context for catch (ex) and 'let'
		  var blockContext = context

		  return walk(tree)

		  // recursively walk every node in an array
		  function walkAll(nodes){
		    var result = undefined
		    for (var i=0;i<nodes.length;i++){
		      var childNode = nodes[i]
		      if (childNode.type === 'EmptyStatement') continue
		      result = walk(childNode)
		      if (result instanceof ReturnValue){
		        return result
		      }
		    }
		    return result
		  }

		  // recursively evalutate the node of an AST
		  function walk(node){
		    if (!node) return
		    switch (node.type) {

		      case 'Program':
		        return walkAll(node.body)

		      case 'BlockStatement':
		        enterBlock()
		        var result = walkAll(node.body)
		        leaveBlock()
		        return result

		      case 'FunctionDeclaration':
		        var params = node.params.map(getName)
		        var value = getFunction(node.body, params, blockContext)
		        return context[node.id.name] = value

		      case 'FunctionExpression':
		        var params = node.params.map(getName)
		        return getFunction(node.body, params, blockContext)

		      case 'ReturnStatement':
		        var value = walk(node.argument)
		        return new ReturnValue('return', value)

		      case 'BreakStatement':
		        return new ReturnValue('break')

		      case 'ContinueStatement':
		        return new ReturnValue('continue')

		      case 'ExpressionStatement':
		        return walk(node.expression)

		      case 'AssignmentExpression':
		        return setValue(blockContext, node.left, node.right, node.operator)

		      case 'UpdateExpression':
		        return setValue(blockContext, node.argument, null, node.operator)

		      case 'VariableDeclaration':
		        node.declarations.forEach(function(declaration){
		          var target = node.kind === 'let' ? blockContext : context
		          if (declaration.init){
		            target[declaration.id.name] = walk(declaration.init)
		          } else {
		            target[declaration.id.name] = undefined
		          }
		        })
		        break

		      case 'SwitchStatement':
		        var defaultHandler = null
		        var matched = false
		        var value = walk(node.discriminant)
		        var result = undefined

		        enterBlock()

		        var i = 0
		        while (result == null){
		          if (i<node.cases.length){
		            if (node.cases[i].test){ // check or fall through
		              matched = matched || (walk(node.cases[i].test) === value)
		            } else if (defaultHandler == null) {
		              defaultHandler = i
		            }
		            if (matched){
		              var r = walkAll(node.cases[i].consequent)
		              if (r instanceof ReturnValue){ // break out
		                if (r.type == 'break') break
		                result = r
		              }
		            }
		            i += 1 // continue
		          } else if (!matched && defaultHandler != null){
		            // go back and do the default handler
		            i = defaultHandler
		            matched = true
		          } else {
		            // nothing we can do
		            break
		          }
		        }

		        leaveBlock()
		        return result

		      case 'IfStatement':
		        if (walk(node.test)){
		          return walk(node.consequent)
		        } else if (node.alternate) {
		          return walk(node.alternate)
		        }

		      case 'ForStatement':
		        var infinite = InfiniteChecker(maxIterations)
		        var result = undefined

		        enterBlock() // allow lets on delarations
		        for (walk(node.init); walk(node.test); walk(node.update)){
		          var r = walk(node.body)

		          // handle early return, continue and break
		          if (r instanceof ReturnValue){
		            if (r.type == 'continue') continue
		            if (r.type == 'break') break
		            result = r
		            break
		          }

		          infinite.check()
		        }
		        leaveBlock()
		        return result

		      case 'ForInStatement':
		        var infinite = InfiniteChecker(maxIterations)
		        var result = undefined

		        var value = walk(node.right)
		        var property = node.left

		        var target = context
		        enterBlock()

		        if (property.type == 'VariableDeclaration'){
		          walk(property)
		          property = property.declarations[0].id
		          if (property.kind === 'let'){
		            target = blockContext
		          }
		        }

		        for (var key in value){
		          setValue(target, property, {type: 'Literal', value: key})
		          var r = walk(node.body)

		          // handle early return, continue and break
		          if (r instanceof ReturnValue){
		            if (r.type == 'continue') continue
		            if (r.type == 'break') break
		            result = r
		            break
		          }

		          infinite.check()
		        }
		        leaveBlock()

		        return result

		      case 'WhileStatement':
		        var infinite = InfiniteChecker(maxIterations)
		        while (walk(node.test)){
		          walk(node.body)
		          infinite.check()
		        }
		        break

		      case 'TryStatement':
		        try {
		          walk(node.block)
		        } catch (error) {
		          enterBlock()
		          var catchClause = node.handlers[0]
		          if (catchClause) {
		            blockContext[catchClause.param.name] = error
		            walk(catchClause.body)
		          }
		          leaveBlock()
		        } finally {
		          if (node.finalizer) {
		            walk(node.finalizer)
		          }
		        }
		        break

		      case 'Literal':
		        return node.value

		      case 'UnaryExpression':
		        var val = walk(node.argument)
		        switch(node.operator) {
		          case '+': return +val
		          case '-': return -val
		          case '~': return ~val
		          case '!': return !val
		          case 'typeof': return typeof val
		          default: return unsupportedExpression(node)
		        }

		      case 'ArrayExpression':
		        var obj = blockContext['Array']()
		        for (var i=0;i<node.elements.length;i++){
		          obj.push(walk(node.elements[i]))
		        }
		        return obj

		      case 'ObjectExpression':
		        var obj = blockContext['Object']()
		        for (var i = 0; i < node.properties.length; i++) {
		          var prop = node.properties[i]
		          var value = (prop.value === null) ? prop.value : walk(prop.value)
		          obj[prop.key.value || prop.key.name] = value
		        }
		        return obj

		      case 'NewExpression':
		        var args = node.arguments.map(function(arg){
		          return walk(arg)
		        })
		        var target = walk(node.callee)
		        return primitives.applyNew(target, args)


		      case 'BinaryExpression':
		        var l = walk(node.left)
		        var r = walk(node.right)
		        switch(node.operator) {
		          case '==':  return l === r
		          case '===': return l === r
		          case '!=':  return l != r
		          case '!==': return l !== r
		          case '+':   return l + r
		          case '-':   return l - r
		          case '*':   return l * r
		          case '/':   return l / r
		          case '%':   return l % r
		          case '<':   return l < r
		          case '<=':  return l <= r
		          case '>':   return l > r
		          case '>=':  return l >= r
		          case '|':   return l | r
		          case '&':   return l & r
		          case '^':   return l ^ r
		          case 'instanceof': return l instanceof r
		          default: return unsupportedExpression(node)
		        }

		      case 'LogicalExpression':
		        switch(node.operator) {
		          case '&&':  return walk(node.left) && walk(node.right)
		          case '||':  return walk(node.left) || walk(node.right)
		          default: return unsupportedExpression(node)
		        }

		      case 'ThisExpression':
		        return blockContext['this']

		      case 'Identifier':
		        if (node.name === 'undefined'){
		          return undefined
		        } else if (hasProperty(blockContext, node.name, primitives)){
		          return finalValue(blockContext[node.name])
		        } else {
		          throw new ReferenceError(node.name + ' is not defined')
		        }

		      case 'CallExpression':
		        var args = node.arguments.map(function(arg){
		          return walk(arg)
		        })
		        var object = null
		        var target = walk(node.callee)

		        if (node.callee.type === 'MemberExpression'){
		          object = walk(node.callee.object)
		        }
		        return target.apply(object, args)

		      case 'MemberExpression':
		        var obj = walk(node.object)
		        if (node.computed){
		          var prop = walk(node.property)
		        } else {
		          var prop = node.property.name
		        }
		        obj = primitives.getPropertyObject(obj, prop)
		        return checkValue(obj[prop]);

		      case 'ConditionalExpression':
		        var val = walk(node.test)
		        return val ? walk(node.consequent) : walk(node.alternate)

		      case 'EmptyStatement':
		        return

		      default:
		        return unsupportedExpression(node)
		    }
		  }

		  // safely retrieve a value
		  function checkValue(value){
		    if (value === Function){
		      value = safeFunction
		    }
		    return finalValue(value)
		  }

		  // block scope context control
		  function enterBlock(){
		    blockContext = Object.create(blockContext)
		  }
		  function leaveBlock(){
		    blockContext = Object.getPrototypeOf(blockContext)
		  }

		  // set a value in the specified context if allowed
		  function setValue(object, left, right, operator){
		    var name = null

		    if (left.type === 'Identifier'){
		      name = left.name
		      // handle parent context shadowing
		      object = objectForKey(object, name, primitives)
		    } else if (left.type === 'MemberExpression'){
		      if (left.computed){
		        name = walk(left.property)
		      } else {
		        name = left.property.name
		      }
		      object = walk(left.object)
		    }

		    // stop built in properties from being able to be changed
		    if (canSetProperty(object, name, primitives)){
		      switch(operator) {
		        case undefined: return object[name] = walk(right)
		        case '=':  return object[name] = walk(right)
		        case '+=': return object[name] += walk(right)
		        case '-=': return object[name] -= walk(right)
		        case '++': return object[name]++
		        case '--': return object[name]--
		      }
		    }

		  }

		}

		// when an unsupported expression is encountered, throw an error
		function unsupportedExpression(node){
		  console.error(node)
		  var err = new Error('Unsupported expression: ' + node.type)
		  err.node = node
		  throw err
		}

		// walk a provided object's prototypal hierarchy to retrieve an inherited object
		function objectForKey(object, key, primitives){
		  var proto = primitives.getPrototypeOf(object)
		  if (!proto || hasOwnProperty(object, key)){
		    return object
		  } else {
		    return objectForKey(proto, key, primitives)
		  }
		}

		function hasProperty(object, key, primitives){
		  var proto = primitives.getPrototypeOf(object)
		  var hasOwn = hasOwnProperty(object, key)
		  if (object[key] !== undefined){
		    return true
		  } else if (!proto || hasOwn){
		    return hasOwn
		  } else {
		    return hasProperty(proto, key, primitives)
		  }
		}

		function hasOwnProperty(object, key){
		  return Object.prototype.hasOwnProperty.call(object, key)
		}

		function propertyIsEnumerable(object, key){
		  return Object.prototype.propertyIsEnumerable.call(object, key)
		}


		// determine if we have write access to a property
		function canSetProperty(object, property, primitives){
		  if (property === '__proto__' || primitives.isPrimitive(object)){
		    return false
		  } else if (object != null){

		    if (hasOwnProperty(object, property)){
		      if (propertyIsEnumerable(object, property)){
		        return true
		      } else {
		        return false
		      }
		    } else {
		      return canSetProperty(primitives.getPrototypeOf(object), property, primitives)
		    }

		  } else {
		    return true
		  }
		}

		// generate a function with specified context
		function getFunction(body, params, parentContext){
		  return function(){
		    var context = Object.create(parentContext)
		    if (this == global){
		      context['this'] = null
		    } else {
		      context['this'] = this
		    }
		    // normalize arguments array
		    var args = Array.prototype.slice.call(arguments)
		    context['arguments'] = arguments
		    args.forEach(function(arg,idx){
		      var param = params[idx]
		      if (param){
		        context[param] = arg
		      }
		    })
		    var result = evaluateAst(body, context)

		    if (result instanceof ReturnValue){
		      return result.value
		    }
		  }
		}

		function finalValue(value){
		  if (value instanceof ReturnValue){
		    return value.value
		  }
		  return value
		}

		// get the name of an identifier
		function getName(identifier){
		  return identifier.name
		}

		// a ReturnValue struct for differentiating between expression result and return statement
		function ReturnValue(type, value){
		  this.type = type
		  this.value = value
		}

		/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

	/***/ },
	/* 1 */
	/***/ function(module, exports, __webpack_require__) {

		var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
		  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
		  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
		  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
		  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
		  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
		  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
		  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

		  Redistribution and use in source and binary forms, with or without
		  modification, are permitted provided that the following conditions are met:

		    * Redistributions of source code must retain the above copyright
		      notice, this list of conditions and the following disclaimer.
		    * Redistributions in binary form must reproduce the above copyright
		      notice, this list of conditions and the following disclaimer in the
		      documentation and/or other materials provided with the distribution.

		  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
		  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
		  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
		  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
		  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
		  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
		  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
		  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
		  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		*/

		/*jslint bitwise:true plusplus:true */
		/*global esprima:true, define:true, exports:true, window: true,
		throwError: true, createLiteral: true, generateStatement: true,
		parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
		parseFunctionDeclaration: true, parseFunctionExpression: true,
		parseFunctionSourceElements: true, parseVariableIdentifier: true,
		parseLeftHandSideExpression: true,
		parseStatement: true, parseSourceElement: true */

		(function (root, factory) {
		    'use strict';

		    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
		    // Rhino, and plain browser loading.
		    if (true) {
		        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		    } else if (typeof exports !== 'undefined') {
		        factory(exports);
		    } else {
		        factory((root.esprima = {}));
		    }
		}(this, function (exports) {
		    'use strict';

		    var Token,
		        TokenName,
		        Syntax,
		        PropertyKind,
		        Messages,
		        Regex,
		        source,
		        strict,
		        index,
		        lineNumber,
		        lineStart,
		        length,
		        buffer,
		        state,
		        extra;

		    Token = {
		        BooleanLiteral: 1,
		        EOF: 2,
		        Identifier: 3,
		        Keyword: 4,
		        NullLiteral: 5,
		        NumericLiteral: 6,
		        Punctuator: 7,
		        StringLiteral: 8
		    };

		    TokenName = {};
		    TokenName[Token.BooleanLiteral] = 'Boolean';
		    TokenName[Token.EOF] = '<end>';
		    TokenName[Token.Identifier] = 'Identifier';
		    TokenName[Token.Keyword] = 'Keyword';
		    TokenName[Token.NullLiteral] = 'Null';
		    TokenName[Token.NumericLiteral] = 'Numeric';
		    TokenName[Token.Punctuator] = 'Punctuator';
		    TokenName[Token.StringLiteral] = 'String';

		    Syntax = {
		        AssignmentExpression: 'AssignmentExpression',
		        ArrayExpression: 'ArrayExpression',
		        BlockStatement: 'BlockStatement',
		        BinaryExpression: 'BinaryExpression',
		        BreakStatement: 'BreakStatement',
		        CallExpression: 'CallExpression',
		        CatchClause: 'CatchClause',
		        ConditionalExpression: 'ConditionalExpression',
		        ContinueStatement: 'ContinueStatement',
		        DoWhileStatement: 'DoWhileStatement',
		        DebuggerStatement: 'DebuggerStatement',
		        EmptyStatement: 'EmptyStatement',
		        ExpressionStatement: 'ExpressionStatement',
		        ForStatement: 'ForStatement',
		        ForInStatement: 'ForInStatement',
		        FunctionDeclaration: 'FunctionDeclaration',
		        FunctionExpression: 'FunctionExpression',
		        Identifier: 'Identifier',
		        IfStatement: 'IfStatement',
		        Literal: 'Literal',
		        LabeledStatement: 'LabeledStatement',
		        LogicalExpression: 'LogicalExpression',
		        MemberExpression: 'MemberExpression',
		        NewExpression: 'NewExpression',
		        ObjectExpression: 'ObjectExpression',
		        Program: 'Program',
		        Property: 'Property',
		        ReturnStatement: 'ReturnStatement',
		        SequenceExpression: 'SequenceExpression',
		        SwitchStatement: 'SwitchStatement',
		        SwitchCase: 'SwitchCase',
		        ThisExpression: 'ThisExpression',
		        ThrowStatement: 'ThrowStatement',
		        TryStatement: 'TryStatement',
		        UnaryExpression: 'UnaryExpression',
		        UpdateExpression: 'UpdateExpression',
		        VariableDeclaration: 'VariableDeclaration',
		        VariableDeclarator: 'VariableDeclarator',
		        WhileStatement: 'WhileStatement',
		        WithStatement: 'WithStatement'
		    };

		    PropertyKind = {
		        Data: 1,
		        Get: 2,
		        Set: 4
		    };

		    // Error messages should be identical to V8.
		    Messages = {
		        UnexpectedToken:  'Unexpected token %0',
		        UnexpectedNumber:  'Unexpected number',
		        UnexpectedString:  'Unexpected string',
		        UnexpectedIdentifier:  'Unexpected identifier',
		        UnexpectedReserved:  'Unexpected reserved word',
		        UnexpectedEOS:  'Unexpected end of input',
		        NewlineAfterThrow:  'Illegal newline after throw',
		        InvalidRegExp: 'Invalid regular expression',
		        UnterminatedRegExp:  'Invalid regular expression: missing /',
		        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
		        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
		        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
		        NoCatchOrFinally:  'Missing catch or finally after try',
		        UnknownLabel: 'Undefined label \'%0\'',
		        Redeclaration: '%0 \'%1\' has already been declared',
		        IllegalContinue: 'Illegal continue statement',
		        IllegalBreak: 'Illegal break statement',
		        IllegalReturn: 'Illegal return statement',
		        StrictModeWith:  'Strict mode code may not include a with statement',
		        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
		        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
		        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
		        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
		        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
		        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
		        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
		        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
		        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
		        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
		        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
		        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
		        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
		        StrictReservedWord:  'Use of future reserved word in strict mode'
		    };

		    // See also tools/generate-unicode-regex.py.
		    Regex = {
		        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
		        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
		    };

		    // Ensure the condition is true, otherwise throw an error.
		    // This is only to have a better contract semantic, i.e. another safety net
		    // to catch a logic error. The condition shall be fulfilled in normal case.
		    // Do NOT use this to enforce a certain condition on any user input.

		    function assert(condition, message) {
		        if (!condition) {
		            throw new Error('ASSERT: ' + message);
		        }
		    }

		    function sliceSource(from, to) {
		        return source.slice(from, to);
		    }

		    if (typeof 'esprima'[0] === 'undefined') {
		        sliceSource = function sliceArraySource(from, to) {
		            return source.slice(from, to).join('');
		        };
		    }

		    function isDecimalDigit(ch) {
		        return '0123456789'.indexOf(ch) >= 0;
		    }

		    function isHexDigit(ch) {
		        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
		    }

		    function isOctalDigit(ch) {
		        return '01234567'.indexOf(ch) >= 0;
		    }


		    // 7.2 White Space

		    function isWhiteSpace(ch) {
		        return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
		            (ch === '\u000C') || (ch === '\u00A0') ||
		            (ch.charCodeAt(0) >= 0x1680 &&
		             '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(ch) >= 0);
		    }

		    // 7.3 Line Terminators

		    function isLineTerminator(ch) {
		        return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
		    }

		    // 7.6 Identifier Names and Identifiers

		    function isIdentifierStart(ch) {
		        return (ch === '$') || (ch === '_') || (ch === '\\') ||
		            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
		            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierStart.test(ch));
		    }

		    function isIdentifierPart(ch) {
		        return (ch === '$') || (ch === '_') || (ch === '\\') ||
		            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
		            ((ch >= '0') && (ch <= '9')) ||
		            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
		    }

		    // 7.6.1.2 Future Reserved Words

		    function isFutureReservedWord(id) {
		        switch (id) {

		        // Future reserved words.
		        case 'class':
		        case 'enum':
		        case 'export':
		        case 'extends':
		        case 'import':
		        case 'super':
		            return true;
		        }

		        return false;
		    }

		    function isStrictModeReservedWord(id) {
		        switch (id) {

		        // Strict Mode reserved words.
		        case 'implements':
		        case 'interface':
		        case 'package':
		        case 'private':
		        case 'protected':
		        case 'public':
		        case 'static':
		        case 'yield':
		        case 'let':
		            return true;
		        }

		        return false;
		    }

		    function isRestrictedWord(id) {
		        return id === 'eval' || id === 'arguments';
		    }

		    // 7.6.1.1 Keywords

		    function isKeyword(id) {
		        var keyword = false;
		        switch (id.length) {
		        case 2:
		            keyword = (id === 'if') || (id === 'in') || (id === 'do');
		            break;
		        case 3:
		            keyword = (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
		            break;
		        case 4:
		            keyword = (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with');
		            break;
		        case 5:
		            keyword = (id === 'while') || (id === 'break') || (id === 'catch') || (id === 'throw');
		            break;
		        case 6:
		            keyword = (id === 'return') || (id === 'typeof') || (id === 'delete') || (id === 'switch');
		            break;
		        case 7:
		            keyword = (id === 'default') || (id === 'finally');
		            break;
		        case 8:
		            keyword = (id === 'function') || (id === 'continue') || (id === 'debugger');
		            break;
		        case 10:
		            keyword = (id === 'instanceof');
		            break;
		        }

		        if (keyword) {
		            return true;
		        }

		        switch (id) {
		        // Future reserved words.
		        // 'const' is specialized as Keyword in V8.
		        case 'const':
		            return true;

		        // For compatiblity to SpiderMonkey and ES.next
		        case 'yield':
		        case 'let':
		            return true;
		        }

		        if (strict && isStrictModeReservedWord(id)) {
		            return true;
		        }

		        return isFutureReservedWord(id);
		    }

		    // 7.4 Comments

		    function skipComment() {
		        var ch, blockComment, lineComment;

		        blockComment = false;
		        lineComment = false;

		        while (index < length) {
		            ch = source[index];

		            if (lineComment) {
		                ch = source[index++];
		                if (isLineTerminator(ch)) {
		                    lineComment = false;
		                    if (ch === '\r' && source[index] === '\n') {
		                        ++index;
		                    }
		                    ++lineNumber;
		                    lineStart = index;
		                }
		            } else if (blockComment) {
		                if (isLineTerminator(ch)) {
		                    if (ch === '\r' && source[index + 1] === '\n') {
		                        ++index;
		                    }
		                    ++lineNumber;
		                    ++index;
		                    lineStart = index;
		                    if (index >= length) {
		                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                    }
		                } else {
		                    ch = source[index++];
		                    if (index >= length) {
		                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                    }
		                    if (ch === '*') {
		                        ch = source[index];
		                        if (ch === '/') {
		                            ++index;
		                            blockComment = false;
		                        }
		                    }
		                }
		            } else if (ch === '/') {
		                ch = source[index + 1];
		                if (ch === '/') {
		                    index += 2;
		                    lineComment = true;
		                } else if (ch === '*') {
		                    index += 2;
		                    blockComment = true;
		                    if (index >= length) {
		                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                    }
		                } else {
		                    break;
		                }
		            } else if (isWhiteSpace(ch)) {
		                ++index;
		            } else if (isLineTerminator(ch)) {
		                ++index;
		                if (ch ===  '\r' && source[index] === '\n') {
		                    ++index;
		                }
		                ++lineNumber;
		                lineStart = index;
		            } else {
		                break;
		            }
		        }
		    }

		    function scanHexEscape(prefix) {
		        var i, len, ch, code = 0;

		        len = (prefix === 'u') ? 4 : 2;
		        for (i = 0; i < len; ++i) {
		            if (index < length && isHexDigit(source[index])) {
		                ch = source[index++];
		                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
		            } else {
		                return '';
		            }
		        }
		        return String.fromCharCode(code);
		    }

		    function scanIdentifier() {
		        var ch, start, id, restore;

		        ch = source[index];
		        if (!isIdentifierStart(ch)) {
		            return;
		        }

		        start = index;
		        if (ch === '\\') {
		            ++index;
		            if (source[index] !== 'u') {
		                return;
		            }
		            ++index;
		            restore = index;
		            ch = scanHexEscape('u');
		            if (ch) {
		                if (ch === '\\' || !isIdentifierStart(ch)) {
		                    return;
		                }
		                id = ch;
		            } else {
		                index = restore;
		                id = 'u';
		            }
		        } else {
		            id = source[index++];
		        }

		        while (index < length) {
		            ch = source[index];
		            if (!isIdentifierPart(ch)) {
		                break;
		            }
		            if (ch === '\\') {
		                ++index;
		                if (source[index] !== 'u') {
		                    return;
		                }
		                ++index;
		                restore = index;
		                ch = scanHexEscape('u');
		                if (ch) {
		                    if (ch === '\\' || !isIdentifierPart(ch)) {
		                        return;
		                    }
		                    id += ch;
		                } else {
		                    index = restore;
		                    id += 'u';
		                }
		            } else {
		                id += source[index++];
		            }
		        }

		        // There is no keyword or literal with only one character.
		        // Thus, it must be an identifier.
		        if (id.length === 1) {
		            return {
		                type: Token.Identifier,
		                value: id,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        if (isKeyword(id)) {
		            return {
		                type: Token.Keyword,
		                value: id,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        // 7.8.1 Null Literals

		        if (id === 'null') {
		            return {
		                type: Token.NullLiteral,
		                value: id,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        // 7.8.2 Boolean Literals

		        if (id === 'true' || id === 'false') {
		            return {
		                type: Token.BooleanLiteral,
		                value: id,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        return {
		            type: Token.Identifier,
		            value: id,
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            range: [start, index]
		        };
		    }

		    // 7.7 Punctuators

		    function scanPunctuator() {
		        var start = index,
		            ch1 = source[index],
		            ch2,
		            ch3,
		            ch4;

		        // Check for most common single-character punctuators.

		        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
		            ++index;
		            return {
		                type: Token.Punctuator,
		                value: ch1,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
		            ++index;
		            return {
		                type: Token.Punctuator,
		                value: ch1,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        // Dot (.) can also start a floating-point number, hence the need
		        // to check the next character.

		        ch2 = source[index + 1];
		        if (ch1 === '.' && !isDecimalDigit(ch2)) {
		            return {
		                type: Token.Punctuator,
		                value: source[index++],
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        // Peek more characters.

		        ch3 = source[index + 2];
		        ch4 = source[index + 3];

		        // 4-character punctuator: >>>=

		        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
		            if (ch4 === '=') {
		                index += 4;
		                return {
		                    type: Token.Punctuator,
		                    value: '>>>=',
		                    lineNumber: lineNumber,
		                    lineStart: lineStart,
		                    range: [start, index]
		                };
		            }
		        }

		        // 3-character punctuators: === !== >>> <<= >>=

		        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
		            index += 3;
		            return {
		                type: Token.Punctuator,
		                value: '===',
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
		            index += 3;
		            return {
		                type: Token.Punctuator,
		                value: '!==',
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
		            index += 3;
		            return {
		                type: Token.Punctuator,
		                value: '>>>',
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
		            index += 3;
		            return {
		                type: Token.Punctuator,
		                value: '<<=',
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
		            index += 3;
		            return {
		                type: Token.Punctuator,
		                value: '>>=',
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }

		        // 2-character punctuators: <= >= == != ++ -- << >> && ||
		        // += -= *= %= &= |= ^= /=

		        if (ch2 === '=') {
		            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
		                index += 2;
		                return {
		                    type: Token.Punctuator,
		                    value: ch1 + ch2,
		                    lineNumber: lineNumber,
		                    lineStart: lineStart,
		                    range: [start, index]
		                };
		            }
		        }

		        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
		            if ('+-<>&|'.indexOf(ch2) >= 0) {
		                index += 2;
		                return {
		                    type: Token.Punctuator,
		                    value: ch1 + ch2,
		                    lineNumber: lineNumber,
		                    lineStart: lineStart,
		                    range: [start, index]
		                };
		            }
		        }

		        // The remaining 1-character punctuators.

		        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
		            return {
		                type: Token.Punctuator,
		                value: source[index++],
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [start, index]
		            };
		        }
		    }

		    // 7.8.3 Numeric Literals

		    function scanNumericLiteral() {
		        var number, start, ch;

		        ch = source[index];
		        assert(isDecimalDigit(ch) || (ch === '.'),
		            'Numeric literal must start with a decimal digit or a decimal point');

		        start = index;
		        number = '';
		        if (ch !== '.') {
		            number = source[index++];
		            ch = source[index];

		            // Hex number starts with '0x'.
		            // Octal number starts with '0'.
		            if (number === '0') {
		                if (ch === 'x' || ch === 'X') {
		                    number += source[index++];
		                    while (index < length) {
		                        ch = source[index];
		                        if (!isHexDigit(ch)) {
		                            break;
		                        }
		                        number += source[index++];
		                    }

		                    if (number.length <= 2) {
		                        // only 0x
		                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                    }

		                    if (index < length) {
		                        ch = source[index];
		                        if (isIdentifierStart(ch)) {
		                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                        }
		                    }
		                    return {
		                        type: Token.NumericLiteral,
		                        value: parseInt(number, 16),
		                        lineNumber: lineNumber,
		                        lineStart: lineStart,
		                        range: [start, index]
		                    };
		                } else if (isOctalDigit(ch)) {
		                    number += source[index++];
		                    while (index < length) {
		                        ch = source[index];
		                        if (!isOctalDigit(ch)) {
		                            break;
		                        }
		                        number += source[index++];
		                    }

		                    if (index < length) {
		                        ch = source[index];
		                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
		                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                        }
		                    }
		                    return {
		                        type: Token.NumericLiteral,
		                        value: parseInt(number, 8),
		                        octal: true,
		                        lineNumber: lineNumber,
		                        lineStart: lineStart,
		                        range: [start, index]
		                    };
		                }

		                // decimal number starts with '0' such as '09' is illegal.
		                if (isDecimalDigit(ch)) {
		                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                }
		            }

		            while (index < length) {
		                ch = source[index];
		                if (!isDecimalDigit(ch)) {
		                    break;
		                }
		                number += source[index++];
		            }
		        }

		        if (ch === '.') {
		            number += source[index++];
		            while (index < length) {
		                ch = source[index];
		                if (!isDecimalDigit(ch)) {
		                    break;
		                }
		                number += source[index++];
		            }
		        }

		        if (ch === 'e' || ch === 'E') {
		            number += source[index++];

		            ch = source[index];
		            if (ch === '+' || ch === '-') {
		                number += source[index++];
		            }

		            ch = source[index];
		            if (isDecimalDigit(ch)) {
		                number += source[index++];
		                while (index < length) {
		                    ch = source[index];
		                    if (!isDecimalDigit(ch)) {
		                        break;
		                    }
		                    number += source[index++];
		                }
		            } else {
		                ch = 'character ' + ch;
		                if (index >= length) {
		                    ch = '<end>';
		                }
		                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		            }
		        }

		        if (index < length) {
		            ch = source[index];
		            if (isIdentifierStart(ch)) {
		                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		            }
		        }

		        return {
		            type: Token.NumericLiteral,
		            value: parseFloat(number),
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            range: [start, index]
		        };
		    }

		    // 7.8.4 String Literals

		    function scanStringLiteral() {
		        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

		        quote = source[index];
		        assert((quote === '\'' || quote === '"'),
		            'String literal must starts with a quote');

		        start = index;
		        ++index;

		        while (index < length) {
		            ch = source[index++];

		            if (ch === quote) {
		                quote = '';
		                break;
		            } else if (ch === '\\') {
		                ch = source[index++];
		                if (!isLineTerminator(ch)) {
		                    switch (ch) {
		                    case 'n':
		                        str += '\n';
		                        break;
		                    case 'r':
		                        str += '\r';
		                        break;
		                    case 't':
		                        str += '\t';
		                        break;
		                    case 'u':
		                    case 'x':
		                        restore = index;
		                        unescaped = scanHexEscape(ch);
		                        if (unescaped) {
		                            str += unescaped;
		                        } else {
		                            index = restore;
		                            str += ch;
		                        }
		                        break;
		                    case 'b':
		                        str += '\b';
		                        break;
		                    case 'f':
		                        str += '\f';
		                        break;
		                    case 'v':
		                        str += '\x0B';
		                        break;

		                    default:
		                        if (isOctalDigit(ch)) {
		                            code = '01234567'.indexOf(ch);

		                            // \0 is not octal escape sequence
		                            if (code !== 0) {
		                                octal = true;
		                            }

		                            if (index < length && isOctalDigit(source[index])) {
		                                octal = true;
		                                code = code * 8 + '01234567'.indexOf(source[index++]);

		                                // 3 digits are only allowed when string starts
		                                // with 0, 1, 2, 3
		                                if ('0123'.indexOf(ch) >= 0 &&
		                                        index < length &&
		                                        isOctalDigit(source[index])) {
		                                    code = code * 8 + '01234567'.indexOf(source[index++]);
		                                }
		                            }
		                            str += String.fromCharCode(code);
		                        } else {
		                            str += ch;
		                        }
		                        break;
		                    }
		                } else {
		                    ++lineNumber;
		                    if (ch ===  '\r' && source[index] === '\n') {
		                        ++index;
		                    }
		                }
		            } else if (isLineTerminator(ch)) {
		                break;
		            } else {
		                str += ch;
		            }
		        }

		        if (quote !== '') {
		            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		        }

		        return {
		            type: Token.StringLiteral,
		            value: str,
		            octal: octal,
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            range: [start, index]
		        };
		    }

		    function scanRegExp() {
		        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

		        buffer = null;
		        skipComment();

		        start = index;
		        ch = source[index];
		        assert(ch === '/', 'Regular expression literal must start with a slash');
		        str = source[index++];

		        while (index < length) {
		            ch = source[index++];
		            str += ch;
		            if (ch === '\\') {
		                ch = source[index++];
		                // ECMA-262 7.8.5
		                if (isLineTerminator(ch)) {
		                    throwError({}, Messages.UnterminatedRegExp);
		                }
		                str += ch;
		            } else if (classMarker) {
		                if (ch === ']') {
		                    classMarker = false;
		                }
		            } else {
		                if (ch === '/') {
		                    terminated = true;
		                    break;
		                } else if (ch === '[') {
		                    classMarker = true;
		                } else if (isLineTerminator(ch)) {
		                    throwError({}, Messages.UnterminatedRegExp);
		                }
		            }
		        }

		        if (!terminated) {
		            throwError({}, Messages.UnterminatedRegExp);
		        }

		        // Exclude leading and trailing slash.
		        pattern = str.substr(1, str.length - 2);

		        flags = '';
		        while (index < length) {
		            ch = source[index];
		            if (!isIdentifierPart(ch)) {
		                break;
		            }

		            ++index;
		            if (ch === '\\' && index < length) {
		                ch = source[index];
		                if (ch === 'u') {
		                    ++index;
		                    restore = index;
		                    ch = scanHexEscape('u');
		                    if (ch) {
		                        flags += ch;
		                        str += '\\u';
		                        for (; restore < index; ++restore) {
		                            str += source[restore];
		                        }
		                    } else {
		                        index = restore;
		                        flags += 'u';
		                        str += '\\u';
		                    }
		                } else {
		                    str += '\\';
		                }
		            } else {
		                flags += ch;
		                str += ch;
		            }
		        }

		        try {
		            value = new RegExp(pattern, flags);
		        } catch (e) {
		            throwError({}, Messages.InvalidRegExp);
		        }

		        return {
		            literal: str,
		            value: value,
		            range: [start, index]
		        };
		    }

		    function isIdentifierName(token) {
		        return token.type === Token.Identifier ||
		            token.type === Token.Keyword ||
		            token.type === Token.BooleanLiteral ||
		            token.type === Token.NullLiteral;
		    }

		    function advance() {
		        var ch, token;

		        skipComment();

		        if (index >= length) {
		            return {
		                type: Token.EOF,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                range: [index, index]
		            };
		        }

		        token = scanPunctuator();
		        if (typeof token !== 'undefined') {
		            return token;
		        }

		        ch = source[index];

		        if (ch === '\'' || ch === '"') {
		            return scanStringLiteral();
		        }

		        if (ch === '.' || isDecimalDigit(ch)) {
		            return scanNumericLiteral();
		        }

		        token = scanIdentifier();
		        if (typeof token !== 'undefined') {
		            return token;
		        }

		        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		    }

		    function lex() {
		        var token;

		        if (buffer) {
		            index = buffer.range[1];
		            lineNumber = buffer.lineNumber;
		            lineStart = buffer.lineStart;
		            token = buffer;
		            buffer = null;
		            return token;
		        }

		        buffer = null;
		        return advance();
		    }

		    function lookahead() {
		        var pos, line, start;

		        if (buffer !== null) {
		            return buffer;
		        }

		        pos = index;
		        line = lineNumber;
		        start = lineStart;
		        buffer = advance();
		        index = pos;
		        lineNumber = line;
		        lineStart = start;

		        return buffer;
		    }

		    // Return true if there is a line terminator before the next token.

		    function peekLineTerminator() {
		        var pos, line, start, found;

		        pos = index;
		        line = lineNumber;
		        start = lineStart;
		        skipComment();
		        found = lineNumber !== line;
		        index = pos;
		        lineNumber = line;
		        lineStart = start;

		        return found;
		    }

		    // Throw an exception

		    function throwError(token, messageFormat) {
		        var error,
		            args = Array.prototype.slice.call(arguments, 2),
		            msg = messageFormat.replace(
		                /%(\d)/g,
		                function (whole, index) {
		                    return args[index] || '';
		                }
		            );

		        if (typeof token.lineNumber === 'number') {
		            error = new Error('Line ' + token.lineNumber + ': ' + msg);
		            error.index = token.range[0];
		            error.lineNumber = token.lineNumber;
		            error.column = token.range[0] - lineStart + 1;
		        } else {
		            error = new Error('Line ' + lineNumber + ': ' + msg);
		            error.index = index;
		            error.lineNumber = lineNumber;
		            error.column = index - lineStart + 1;
		        }

		        throw error;
		    }

		    function throwErrorTolerant() {
		        try {
		            throwError.apply(null, arguments);
		        } catch (e) {
		            if (extra.errors) {
		                extra.errors.push(e);
		            } else {
		                throw e;
		            }
		        }
		    }


		    // Throw an exception because of the token.

		    function throwUnexpected(token) {
		        if (token.type === Token.EOF) {
		            throwError(token, Messages.UnexpectedEOS);
		        }

		        if (token.type === Token.NumericLiteral) {
		            throwError(token, Messages.UnexpectedNumber);
		        }

		        if (token.type === Token.StringLiteral) {
		            throwError(token, Messages.UnexpectedString);
		        }

		        if (token.type === Token.Identifier) {
		            throwError(token, Messages.UnexpectedIdentifier);
		        }

		        if (token.type === Token.Keyword) {
		            if (isFutureReservedWord(token.value)) {
		                throwError(token, Messages.UnexpectedReserved);
		            } else if (strict && isStrictModeReservedWord(token.value)) {
		                throwErrorTolerant(token, Messages.StrictReservedWord);
		                return;
		            }
		            throwError(token, Messages.UnexpectedToken, token.value);
		        }

		        // BooleanLiteral, NullLiteral, or Punctuator.
		        throwError(token, Messages.UnexpectedToken, token.value);
		    }

		    // Expect the next token to match the specified punctuator.
		    // If not, an exception will be thrown.

		    function expect(value) {
		        var token = lex();
		        if (token.type !== Token.Punctuator || token.value !== value) {
		            throwUnexpected(token);
		        }
		    }

		    // Expect the next token to match the specified keyword.
		    // If not, an exception will be thrown.

		    function expectKeyword(keyword) {
		        var token = lex();
		        if (token.type !== Token.Keyword || token.value !== keyword) {
		            throwUnexpected(token);
		        }
		    }

		    // Return true if the next token matches the specified punctuator.

		    function match(value) {
		        var token = lookahead();
		        return token.type === Token.Punctuator && token.value === value;
		    }

		    // Return true if the next token matches the specified keyword

		    function matchKeyword(keyword) {
		        var token = lookahead();
		        return token.type === Token.Keyword && token.value === keyword;
		    }

		    // Return true if the next token is an assignment operator

		    function matchAssign() {
		        var token = lookahead(),
		            op = token.value;

		        if (token.type !== Token.Punctuator) {
		            return false;
		        }
		        return op === '=' ||
		            op === '*=' ||
		            op === '/=' ||
		            op === '%=' ||
		            op === '+=' ||
		            op === '-=' ||
		            op === '<<=' ||
		            op === '>>=' ||
		            op === '>>>=' ||
		            op === '&=' ||
		            op === '^=' ||
		            op === '|=';
		    }

		    function consumeSemicolon() {
		        var token, line;

		        // Catch the very common case first.
		        if (source[index] === ';') {
		            lex();
		            return;
		        }

		        line = lineNumber;
		        skipComment();
		        if (lineNumber !== line) {
		            return;
		        }

		        if (match(';')) {
		            lex();
		            return;
		        }

		        token = lookahead();
		        if (token.type !== Token.EOF && !match('}')) {
		            throwUnexpected(token);
		        }
		    }

		    // Return true if provided expression is LeftHandSideExpression

		    function isLeftHandSide(expr) {
		        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
		    }

		    // 11.1.4 Array Initialiser

		    function parseArrayInitialiser() {
		        var elements = [];

		        expect('[');

		        while (!match(']')) {
		            if (match(',')) {
		                lex();
		                elements.push(null);
		            } else {
		                elements.push(parseAssignmentExpression());

		                if (!match(']')) {
		                    expect(',');
		                }
		            }
		        }

		        expect(']');

		        return {
		            type: Syntax.ArrayExpression,
		            elements: elements
		        };
		    }

		    // 11.1.5 Object Initialiser

		    function parsePropertyFunction(param, first) {
		        var previousStrict, body;

		        previousStrict = strict;
		        body = parseFunctionSourceElements();
		        if (first && strict && isRestrictedWord(param[0].name)) {
		            throwErrorTolerant(first, Messages.StrictParamName);
		        }
		        strict = previousStrict;

		        return {
		            type: Syntax.FunctionExpression,
		            id: null,
		            params: param,
		            defaults: [],
		            body: body,
		            rest: null,
		            generator: false,
		            expression: false
		        };
		    }

		    function parseObjectPropertyKey() {
		        var token = lex();

		        // Note: This function is called only from parseObjectProperty(), where
		        // EOF and Punctuator tokens are already filtered out.

		        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
		            if (strict && token.octal) {
		                throwErrorTolerant(token, Messages.StrictOctalLiteral);
		            }
		            return createLiteral(token);
		        }

		        return {
		            type: Syntax.Identifier,
		            name: token.value
		        };
		    }

		    function parseObjectProperty() {
		        var token, key, id, param;

		        token = lookahead();

		        if (token.type === Token.Identifier) {

		            id = parseObjectPropertyKey();

		            // Property Assignment: Getter and Setter.

		            if (token.value === 'get' && !match(':')) {
		                key = parseObjectPropertyKey();
		                expect('(');
		                expect(')');
		                return {
		                    type: Syntax.Property,
		                    key: key,
		                    value: parsePropertyFunction([]),
		                    kind: 'get'
		                };
		            } else if (token.value === 'set' && !match(':')) {
		                key = parseObjectPropertyKey();
		                expect('(');
		                token = lookahead();
		                if (token.type !== Token.Identifier) {
		                    expect(')');
		                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
		                    return {
		                        type: Syntax.Property,
		                        key: key,
		                        value: parsePropertyFunction([]),
		                        kind: 'set'
		                    };
		                } else {
		                    param = [ parseVariableIdentifier() ];
		                    expect(')');
		                    return {
		                        type: Syntax.Property,
		                        key: key,
		                        value: parsePropertyFunction(param, token),
		                        kind: 'set'
		                    };
		                }
		            } else {
		                expect(':');
		                return {
		                    type: Syntax.Property,
		                    key: id,
		                    value: parseAssignmentExpression(),
		                    kind: 'init'
		                };
		            }
		        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
		            throwUnexpected(token);
		        } else {
		            key = parseObjectPropertyKey();
		            expect(':');
		            return {
		                type: Syntax.Property,
		                key: key,
		                value: parseAssignmentExpression(),
		                kind: 'init'
		            };
		        }
		    }

		    function parseObjectInitialiser() {
		        var properties = [], property, name, kind, map = {}, toString = String;

		        expect('{');

		        while (!match('}')) {
		            property = parseObjectProperty();

		            if (property.key.type === Syntax.Identifier) {
		                name = property.key.name;
		            } else {
		                name = toString(property.key.value);
		            }
		            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
		            if (Object.prototype.hasOwnProperty.call(map, name)) {
		                if (map[name] === PropertyKind.Data) {
		                    if (strict && kind === PropertyKind.Data) {
		                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
		                    } else if (kind !== PropertyKind.Data) {
		                        throwErrorTolerant({}, Messages.AccessorDataProperty);
		                    }
		                } else {
		                    if (kind === PropertyKind.Data) {
		                        throwErrorTolerant({}, Messages.AccessorDataProperty);
		                    } else if (map[name] & kind) {
		                        throwErrorTolerant({}, Messages.AccessorGetSet);
		                    }
		                }
		                map[name] |= kind;
		            } else {
		                map[name] = kind;
		            }

		            properties.push(property);

		            if (!match('}')) {
		                expect(',');
		            }
		        }

		        expect('}');

		        return {
		            type: Syntax.ObjectExpression,
		            properties: properties
		        };
		    }

		    // 11.1.6 The Grouping Operator

		    function parseGroupExpression() {
		        var expr;

		        expect('(');

		        expr = parseExpression();

		        expect(')');

		        return expr;
		    }


		    // 11.1 Primary Expressions

		    function parsePrimaryExpression() {
		        var token = lookahead(),
		            type = token.type;

		        if (type === Token.Identifier) {
		            return {
		                type: Syntax.Identifier,
		                name: lex().value
		            };
		        }

		        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
		            if (strict && token.octal) {
		                throwErrorTolerant(token, Messages.StrictOctalLiteral);
		            }
		            return createLiteral(lex());
		        }

		        if (type === Token.Keyword) {
		            if (matchKeyword('this')) {
		                lex();
		                return {
		                    type: Syntax.ThisExpression
		                };
		            }

		            if (matchKeyword('function')) {
		                return parseFunctionExpression();
		            }
		        }

		        if (type === Token.BooleanLiteral) {
		            lex();
		            token.value = (token.value === 'true');
		            return createLiteral(token);
		        }

		        if (type === Token.NullLiteral) {
		            lex();
		            token.value = null;
		            return createLiteral(token);
		        }

		        if (match('[')) {
		            return parseArrayInitialiser();
		        }

		        if (match('{')) {
		            return parseObjectInitialiser();
		        }

		        if (match('(')) {
		            return parseGroupExpression();
		        }

		        if (match('/') || match('/=')) {
		            return createLiteral(scanRegExp());
		        }

		        return throwUnexpected(lex());
		    }

		    // 11.2 Left-Hand-Side Expressions

		    function parseArguments() {
		        var args = [];

		        expect('(');

		        if (!match(')')) {
		            while (index < length) {
		                args.push(parseAssignmentExpression());
		                if (match(')')) {
		                    break;
		                }
		                expect(',');
		            }
		        }

		        expect(')');

		        return args;
		    }

		    function parseNonComputedProperty() {
		        var token = lex();

		        if (!isIdentifierName(token)) {
		            throwUnexpected(token);
		        }

		        return {
		            type: Syntax.Identifier,
		            name: token.value
		        };
		    }

		    function parseNonComputedMember() {
		        expect('.');

		        return parseNonComputedProperty();
		    }

		    function parseComputedMember() {
		        var expr;

		        expect('[');

		        expr = parseExpression();

		        expect(']');

		        return expr;
		    }

		    function parseNewExpression() {
		        var expr;

		        expectKeyword('new');

		        expr = {
		            type: Syntax.NewExpression,
		            callee: parseLeftHandSideExpression(),
		            'arguments': []
		        };

		        if (match('(')) {
		            expr['arguments'] = parseArguments();
		        }

		        return expr;
		    }

		    function parseLeftHandSideExpressionAllowCall() {
		        var expr;

		        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

		        while (match('.') || match('[') || match('(')) {
		            if (match('(')) {
		                expr = {
		                    type: Syntax.CallExpression,
		                    callee: expr,
		                    'arguments': parseArguments()
		                };
		            } else if (match('[')) {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: true,
		                    object: expr,
		                    property: parseComputedMember()
		                };
		            } else {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: false,
		                    object: expr,
		                    property: parseNonComputedMember()
		                };
		            }
		        }

		        return expr;
		    }


		    function parseLeftHandSideExpression() {
		        var expr;

		        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

		        while (match('.') || match('[')) {
		            if (match('[')) {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: true,
		                    object: expr,
		                    property: parseComputedMember()
		                };
		            } else {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: false,
		                    object: expr,
		                    property: parseNonComputedMember()
		                };
		            }
		        }

		        return expr;
		    }

		    // 11.3 Postfix Expressions

		    function parsePostfixExpression() {
		        var expr = parseLeftHandSideExpressionAllowCall(), token;

		        token = lookahead();
		        if (token.type !== Token.Punctuator) {
		            return expr;
		        }

		        if ((match('++') || match('--')) && !peekLineTerminator()) {
		            // 11.3.1, 11.3.2
		            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
		                throwErrorTolerant({}, Messages.StrictLHSPostfix);
		            }
		            if (!isLeftHandSide(expr)) {
		                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
		            }

		            expr = {
		                type: Syntax.UpdateExpression,
		                operator: lex().value,
		                argument: expr,
		                prefix: false
		            };
		        }

		        return expr;
		    }

		    // 11.4 Unary Operators

		    function parseUnaryExpression() {
		        var token, expr;

		        token = lookahead();
		        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
		            return parsePostfixExpression();
		        }

		        if (match('++') || match('--')) {
		            token = lex();
		            expr = parseUnaryExpression();
		            // 11.4.4, 11.4.5
		            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
		                throwErrorTolerant({}, Messages.StrictLHSPrefix);
		            }

		            if (!isLeftHandSide(expr)) {
		                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
		            }

		            expr = {
		                type: Syntax.UpdateExpression,
		                operator: token.value,
		                argument: expr,
		                prefix: true
		            };
		            return expr;
		        }

		        if (match('+') || match('-') || match('~') || match('!')) {
		            expr = {
		                type: Syntax.UnaryExpression,
		                operator: lex().value,
		                argument: parseUnaryExpression(),
		                prefix: true
		            };
		            return expr;
		        }

		        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
		            expr = {
		                type: Syntax.UnaryExpression,
		                operator: lex().value,
		                argument: parseUnaryExpression(),
		                prefix: true
		            };
		            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
		                throwErrorTolerant({}, Messages.StrictDelete);
		            }
		            return expr;
		        }

		        return parsePostfixExpression();
		    }

		    // 11.5 Multiplicative Operators

		    function parseMultiplicativeExpression() {
		        var expr = parseUnaryExpression();

		        while (match('*') || match('/') || match('%')) {
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: lex().value,
		                left: expr,
		                right: parseUnaryExpression()
		            };
		        }

		        return expr;
		    }

		    // 11.6 Additive Operators

		    function parseAdditiveExpression() {
		        var expr = parseMultiplicativeExpression();

		        while (match('+') || match('-')) {
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: lex().value,
		                left: expr,
		                right: parseMultiplicativeExpression()
		            };
		        }

		        return expr;
		    }

		    // 11.7 Bitwise Shift Operators

		    function parseShiftExpression() {
		        var expr = parseAdditiveExpression();

		        while (match('<<') || match('>>') || match('>>>')) {
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: lex().value,
		                left: expr,
		                right: parseAdditiveExpression()
		            };
		        }

		        return expr;
		    }
		    // 11.8 Relational Operators

		    function parseRelationalExpression() {
		        var expr, previousAllowIn;

		        previousAllowIn = state.allowIn;
		        state.allowIn = true;

		        expr = parseShiftExpression();

		        while (match('<') || match('>') || match('<=') || match('>=') || (previousAllowIn && matchKeyword('in')) || matchKeyword('instanceof')) {
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: lex().value,
		                left: expr,
		                right: parseShiftExpression()
		            };
		        }

		        state.allowIn = previousAllowIn;
		        return expr;
		    }

		    // 11.9 Equality Operators

		    function parseEqualityExpression() {
		        var expr = parseRelationalExpression();

		        while (match('==') || match('!=') || match('===') || match('!==')) {
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: lex().value,
		                left: expr,
		                right: parseRelationalExpression()
		            };
		        }

		        return expr;
		    }

		    // 11.10 Binary Bitwise Operators

		    function parseBitwiseANDExpression() {
		        var expr = parseEqualityExpression();

		        while (match('&')) {
		            lex();
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: '&',
		                left: expr,
		                right: parseEqualityExpression()
		            };
		        }

		        return expr;
		    }

		    function parseBitwiseXORExpression() {
		        var expr = parseBitwiseANDExpression();

		        while (match('^')) {
		            lex();
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: '^',
		                left: expr,
		                right: parseBitwiseANDExpression()
		            };
		        }

		        return expr;
		    }

		    function parseBitwiseORExpression() {
		        var expr = parseBitwiseXORExpression();

		        while (match('|')) {
		            lex();
		            expr = {
		                type: Syntax.BinaryExpression,
		                operator: '|',
		                left: expr,
		                right: parseBitwiseXORExpression()
		            };
		        }

		        return expr;
		    }

		    // 11.11 Binary Logical Operators

		    function parseLogicalANDExpression() {
		        var expr = parseBitwiseORExpression();

		        while (match('&&')) {
		            lex();
		            expr = {
		                type: Syntax.LogicalExpression,
		                operator: '&&',
		                left: expr,
		                right: parseBitwiseORExpression()
		            };
		        }

		        return expr;
		    }

		    function parseLogicalORExpression() {
		        var expr = parseLogicalANDExpression();

		        while (match('||')) {
		            lex();
		            expr = {
		                type: Syntax.LogicalExpression,
		                operator: '||',
		                left: expr,
		                right: parseLogicalANDExpression()
		            };
		        }

		        return expr;
		    }

		    // 11.12 Conditional Operator

		    function parseConditionalExpression() {
		        var expr, previousAllowIn, consequent;

		        expr = parseLogicalORExpression();

		        if (match('?')) {
		            lex();
		            previousAllowIn = state.allowIn;
		            state.allowIn = true;
		            consequent = parseAssignmentExpression();
		            state.allowIn = previousAllowIn;
		            expect(':');

		            expr = {
		                type: Syntax.ConditionalExpression,
		                test: expr,
		                consequent: consequent,
		                alternate: parseAssignmentExpression()
		            };
		        }

		        return expr;
		    }

		    // 11.13 Assignment Operators

		    function parseAssignmentExpression() {
		        var token, expr;

		        token = lookahead();
		        expr = parseConditionalExpression();

		        if (matchAssign()) {
		            // LeftHandSideExpression
		            if (!isLeftHandSide(expr)) {
		                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
		            }

		            // 11.13.1
		            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
		                throwErrorTolerant(token, Messages.StrictLHSAssignment);
		            }

		            expr = {
		                type: Syntax.AssignmentExpression,
		                operator: lex().value,
		                left: expr,
		                right: parseAssignmentExpression()
		            };
		        }

		        return expr;
		    }

		    // 11.14 Comma Operator

		    function parseExpression() {
		        var expr = parseAssignmentExpression();

		        if (match(',')) {
		            expr = {
		                type: Syntax.SequenceExpression,
		                expressions: [ expr ]
		            };

		            while (index < length) {
		                if (!match(',')) {
		                    break;
		                }
		                lex();
		                expr.expressions.push(parseAssignmentExpression());
		            }

		        }
		        return expr;
		    }

		    // 12.1 Block

		    function parseStatementList() {
		        var list = [],
		            statement;

		        while (index < length) {
		            if (match('}')) {
		                break;
		            }
		            statement = parseSourceElement();
		            if (typeof statement === 'undefined') {
		                break;
		            }
		            list.push(statement);
		        }

		        return list;
		    }

		    function parseBlock() {
		        var block;

		        expect('{');

		        block = parseStatementList();

		        expect('}');

		        return {
		            type: Syntax.BlockStatement,
		            body: block
		        };
		    }

		    // 12.2 Variable Statement

		    function parseVariableIdentifier() {
		        var token = lex();

		        if (token.type !== Token.Identifier) {
		            throwUnexpected(token);
		        }

		        return {
		            type: Syntax.Identifier,
		            name: token.value
		        };
		    }

		    function parseVariableDeclaration(kind) {
		        var id = parseVariableIdentifier(),
		            init = null;

		        // 12.2.1
		        if (strict && isRestrictedWord(id.name)) {
		            throwErrorTolerant({}, Messages.StrictVarName);
		        }

		        if (kind === 'const') {
		            expect('=');
		            init = parseAssignmentExpression();
		        } else if (match('=')) {
		            lex();
		            init = parseAssignmentExpression();
		        }

		        return {
		            type: Syntax.VariableDeclarator,
		            id: id,
		            init: init
		        };
		    }

		    function parseVariableDeclarationList(kind) {
		        var list = [];

		        do {
		            list.push(parseVariableDeclaration(kind));
		            if (!match(',')) {
		                break;
		            }
		            lex();
		        } while (index < length);

		        return list;
		    }

		    function parseVariableStatement() {
		        var declarations;

		        expectKeyword('var');

		        declarations = parseVariableDeclarationList();

		        consumeSemicolon();

		        return {
		            type: Syntax.VariableDeclaration,
		            declarations: declarations,
		            kind: 'var'
		        };
		    }

		    // kind may be `const` or `let`
		    // Both are experimental and not in the specification yet.
		    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
		    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
		    function parseConstLetDeclaration(kind) {
		        var declarations;

		        expectKeyword(kind);

		        declarations = parseVariableDeclarationList(kind);

		        consumeSemicolon();

		        return {
		            type: Syntax.VariableDeclaration,
		            declarations: declarations,
		            kind: kind
		        };
		    }

		    // 12.3 Empty Statement

		    function parseEmptyStatement() {
		        expect(';');

		        return {
		            type: Syntax.EmptyStatement
		        };
		    }

		    // 12.4 Expression Statement

		    function parseExpressionStatement() {
		        var expr = parseExpression();

		        consumeSemicolon();

		        return {
		            type: Syntax.ExpressionStatement,
		            expression: expr
		        };
		    }

		    // 12.5 If statement

		    function parseIfStatement() {
		        var test, consequent, alternate;

		        expectKeyword('if');

		        expect('(');

		        test = parseExpression();

		        expect(')');

		        consequent = parseStatement();

		        if (matchKeyword('else')) {
		            lex();
		            alternate = parseStatement();
		        } else {
		            alternate = null;
		        }

		        return {
		            type: Syntax.IfStatement,
		            test: test,
		            consequent: consequent,
		            alternate: alternate
		        };
		    }

		    // 12.6 Iteration Statements

		    function parseDoWhileStatement() {
		        var body, test, oldInIteration;

		        expectKeyword('do');

		        oldInIteration = state.inIteration;
		        state.inIteration = true;

		        body = parseStatement();

		        state.inIteration = oldInIteration;

		        expectKeyword('while');

		        expect('(');

		        test = parseExpression();

		        expect(')');

		        if (match(';')) {
		            lex();
		        }

		        return {
		            type: Syntax.DoWhileStatement,
		            body: body,
		            test: test
		        };
		    }

		    function parseWhileStatement() {
		        var test, body, oldInIteration;

		        expectKeyword('while');

		        expect('(');

		        test = parseExpression();

		        expect(')');

		        oldInIteration = state.inIteration;
		        state.inIteration = true;

		        body = parseStatement();

		        state.inIteration = oldInIteration;

		        return {
		            type: Syntax.WhileStatement,
		            test: test,
		            body: body
		        };
		    }

		    function parseForVariableDeclaration() {
		        var token = lex();

		        return {
		            type: Syntax.VariableDeclaration,
		            declarations: parseVariableDeclarationList(),
		            kind: token.value
		        };
		    }

		    function parseForStatement() {
		        var init, test, update, left, right, body, oldInIteration;

		        init = test = update = null;

		        expectKeyword('for');

		        expect('(');

		        if (match(';')) {
		            lex();
		        } else {
		            if (matchKeyword('var') || matchKeyword('let')) {
		                state.allowIn = false;
		                init = parseForVariableDeclaration();
		                state.allowIn = true;

		                if (init.declarations.length === 1 && matchKeyword('in')) {
		                    lex();
		                    left = init;
		                    right = parseExpression();
		                    init = null;
		                }
		            } else {
		                state.allowIn = false;
		                init = parseExpression();
		                state.allowIn = true;

		                if (matchKeyword('in')) {
		                    // LeftHandSideExpression
		                    if (!isLeftHandSide(init)) {
		                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);
		                    }

		                    lex();
		                    left = init;
		                    right = parseExpression();
		                    init = null;
		                }
		            }

		            if (typeof left === 'undefined') {
		                expect(';');
		            }
		        }

		        if (typeof left === 'undefined') {

		            if (!match(';')) {
		                test = parseExpression();
		            }
		            expect(';');

		            if (!match(')')) {
		                update = parseExpression();
		            }
		        }

		        expect(')');

		        oldInIteration = state.inIteration;
		        state.inIteration = true;

		        body = parseStatement();

		        state.inIteration = oldInIteration;

		        if (typeof left === 'undefined') {
		            return {
		                type: Syntax.ForStatement,
		                init: init,
		                test: test,
		                update: update,
		                body: body
		            };
		        }

		        return {
		            type: Syntax.ForInStatement,
		            left: left,
		            right: right,
		            body: body,
		            each: false
		        };
		    }

		    // 12.7 The continue statement

		    function parseContinueStatement() {
		        var token, label = null;

		        expectKeyword('continue');

		        // Optimize the most common form: 'continue;'.
		        if (source[index] === ';') {
		            lex();

		            if (!state.inIteration) {
		                throwError({}, Messages.IllegalContinue);
		            }

		            return {
		                type: Syntax.ContinueStatement,
		                label: null
		            };
		        }

		        if (peekLineTerminator()) {
		            if (!state.inIteration) {
		                throwError({}, Messages.IllegalContinue);
		            }

		            return {
		                type: Syntax.ContinueStatement,
		                label: null
		            };
		        }

		        token = lookahead();
		        if (token.type === Token.Identifier) {
		            label = parseVariableIdentifier();

		            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
		                throwError({}, Messages.UnknownLabel, label.name);
		            }
		        }

		        consumeSemicolon();

		        if (label === null && !state.inIteration) {
		            throwError({}, Messages.IllegalContinue);
		        }

		        return {
		            type: Syntax.ContinueStatement,
		            label: label
		        };
		    }

		    // 12.8 The break statement

		    function parseBreakStatement() {
		        var token, label = null;

		        expectKeyword('break');

		        // Optimize the most common form: 'break;'.
		        if (source[index] === ';') {
		            lex();

		            if (!(state.inIteration || state.inSwitch)) {
		                throwError({}, Messages.IllegalBreak);
		            }

		            return {
		                type: Syntax.BreakStatement,
		                label: null
		            };
		        }

		        if (peekLineTerminator()) {
		            if (!(state.inIteration || state.inSwitch)) {
		                throwError({}, Messages.IllegalBreak);
		            }

		            return {
		                type: Syntax.BreakStatement,
		                label: null
		            };
		        }

		        token = lookahead();
		        if (token.type === Token.Identifier) {
		            label = parseVariableIdentifier();

		            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
		                throwError({}, Messages.UnknownLabel, label.name);
		            }
		        }

		        consumeSemicolon();

		        if (label === null && !(state.inIteration || state.inSwitch)) {
		            throwError({}, Messages.IllegalBreak);
		        }

		        return {
		            type: Syntax.BreakStatement,
		            label: label
		        };
		    }

		    // 12.9 The return statement

		    function parseReturnStatement() {
		        var token, argument = null;

		        expectKeyword('return');

		        if (!state.inFunctionBody) {
		            throwErrorTolerant({}, Messages.IllegalReturn);
		        }

		        // 'return' followed by a space and an identifier is very common.
		        if (source[index] === ' ') {
		            if (isIdentifierStart(source[index + 1])) {
		                argument = parseExpression();
		                consumeSemicolon();
		                return {
		                    type: Syntax.ReturnStatement,
		                    argument: argument
		                };
		            }
		        }

		        if (peekLineTerminator()) {
		            return {
		                type: Syntax.ReturnStatement,
		                argument: null
		            };
		        }

		        if (!match(';')) {
		            token = lookahead();
		            if (!match('}') && token.type !== Token.EOF) {
		                argument = parseExpression();
		            }
		        }

		        consumeSemicolon();

		        return {
		            type: Syntax.ReturnStatement,
		            argument: argument
		        };
		    }

		    // 12.10 The with statement

		    function parseWithStatement() {
		        var object, body;

		        if (strict) {
		            throwErrorTolerant({}, Messages.StrictModeWith);
		        }

		        expectKeyword('with');

		        expect('(');

		        object = parseExpression();

		        expect(')');

		        body = parseStatement();

		        return {
		            type: Syntax.WithStatement,
		            object: object,
		            body: body
		        };
		    }

		    // 12.10 The swith statement

		    function parseSwitchCase() {
		        var test,
		            consequent = [],
		            statement;

		        if (matchKeyword('default')) {
		            lex();
		            test = null;
		        } else {
		            expectKeyword('case');
		            test = parseExpression();
		        }
		        expect(':');

		        while (index < length) {
		            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
		                break;
		            }
		            statement = parseStatement();
		            if (typeof statement === 'undefined') {
		                break;
		            }
		            consequent.push(statement);
		        }

		        return {
		            type: Syntax.SwitchCase,
		            test: test,
		            consequent: consequent
		        };
		    }

		    function parseSwitchStatement() {
		        var discriminant, cases, clause, oldInSwitch, defaultFound;

		        expectKeyword('switch');

		        expect('(');

		        discriminant = parseExpression();

		        expect(')');

		        expect('{');

		        cases = [];

		        if (match('}')) {
		            lex();
		            return {
		                type: Syntax.SwitchStatement,
		                discriminant: discriminant,
		                cases: cases
		            };
		        }

		        oldInSwitch = state.inSwitch;
		        state.inSwitch = true;
		        defaultFound = false;

		        while (index < length) {
		            if (match('}')) {
		                break;
		            }
		            clause = parseSwitchCase();
		            if (clause.test === null) {
		                if (defaultFound) {
		                    throwError({}, Messages.MultipleDefaultsInSwitch);
		                }
		                defaultFound = true;
		            }
		            cases.push(clause);
		        }

		        state.inSwitch = oldInSwitch;

		        expect('}');

		        return {
		            type: Syntax.SwitchStatement,
		            discriminant: discriminant,
		            cases: cases
		        };
		    }

		    // 12.13 The throw statement

		    function parseThrowStatement() {
		        var argument;

		        expectKeyword('throw');

		        if (peekLineTerminator()) {
		            throwError({}, Messages.NewlineAfterThrow);
		        }

		        argument = parseExpression();

		        consumeSemicolon();

		        return {
		            type: Syntax.ThrowStatement,
		            argument: argument
		        };
		    }

		    // 12.14 The try statement

		    function parseCatchClause() {
		        var param;

		        expectKeyword('catch');

		        expect('(');
		        if (match(')')) {
		            throwUnexpected(lookahead());
		        }

		        param = parseVariableIdentifier();
		        // 12.14.1
		        if (strict && isRestrictedWord(param.name)) {
		            throwErrorTolerant({}, Messages.StrictCatchVariable);
		        }

		        expect(')');

		        return {
		            type: Syntax.CatchClause,
		            param: param,
		            body: parseBlock()
		        };
		    }

		    function parseTryStatement() {
		        var block, handlers = [], finalizer = null;

		        expectKeyword('try');

		        block = parseBlock();

		        if (matchKeyword('catch')) {
		            handlers.push(parseCatchClause());
		        }

		        if (matchKeyword('finally')) {
		            lex();
		            finalizer = parseBlock();
		        }

		        if (handlers.length === 0 && !finalizer) {
		            throwError({}, Messages.NoCatchOrFinally);
		        }

		        return {
		            type: Syntax.TryStatement,
		            block: block,
		            guardedHandlers: [],
		            handlers: handlers,
		            finalizer: finalizer
		        };
		    }

		    // 12.15 The debugger statement

		    function parseDebuggerStatement() {
		        expectKeyword('debugger');

		        consumeSemicolon();

		        return {
		            type: Syntax.DebuggerStatement
		        };
		    }

		    // 12 Statements

		    function parseStatement() {
		        var token = lookahead(),
		            expr,
		            labeledBody;

		        if (token.type === Token.EOF) {
		            throwUnexpected(token);
		        }

		        if (token.type === Token.Punctuator) {
		            switch (token.value) {
		            case ';':
		                return parseEmptyStatement();
		            case '{':
		                return parseBlock();
		            case '(':
		                return parseExpressionStatement();
		            default:
		                break;
		            }
		        }

		        if (token.type === Token.Keyword) {
		            switch (token.value) {
		            case 'break':
		                return parseBreakStatement();
		            case 'continue':
		                return parseContinueStatement();
		            case 'debugger':
		                return parseDebuggerStatement();
		            case 'do':
		                return parseDoWhileStatement();
		            case 'for':
		                return parseForStatement();
		            case 'function':
		                return parseFunctionDeclaration();
		            case 'if':
		                return parseIfStatement();
		            case 'return':
		                return parseReturnStatement();
		            case 'switch':
		                return parseSwitchStatement();
		            case 'throw':
		                return parseThrowStatement();
		            case 'try':
		                return parseTryStatement();
		            case 'var':
		                return parseVariableStatement();
		            case 'while':
		                return parseWhileStatement();
		            case 'with':
		                return parseWithStatement();
		            default:
		                break;
		            }
		        }

		        expr = parseExpression();

		        // 12.12 Labelled Statements
		        if ((expr.type === Syntax.Identifier) && match(':')) {
		            lex();

		            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
		                throwError({}, Messages.Redeclaration, 'Label', expr.name);
		            }

		            state.labelSet[expr.name] = true;
		            labeledBody = parseStatement();
		            delete state.labelSet[expr.name];

		            return {
		                type: Syntax.LabeledStatement,
		                label: expr,
		                body: labeledBody
		            };
		        }

		        consumeSemicolon();

		        return {
		            type: Syntax.ExpressionStatement,
		            expression: expr
		        };
		    }

		    // 13 Function Definition

		    function parseFunctionSourceElements() {
		        var sourceElement, sourceElements = [], token, directive, firstRestricted,
		            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;

		        expect('{');

		        while (index < length) {
		            token = lookahead();
		            if (token.type !== Token.StringLiteral) {
		                break;
		            }

		            sourceElement = parseSourceElement();
		            sourceElements.push(sourceElement);
		            if (sourceElement.expression.type !== Syntax.Literal) {
		                // this is not directive
		                break;
		            }
		            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
		            if (directive === 'use strict') {
		                strict = true;
		                if (firstRestricted) {
		                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
		                }
		            } else {
		                if (!firstRestricted && token.octal) {
		                    firstRestricted = token;
		                }
		            }
		        }

		        oldLabelSet = state.labelSet;
		        oldInIteration = state.inIteration;
		        oldInSwitch = state.inSwitch;
		        oldInFunctionBody = state.inFunctionBody;

		        state.labelSet = {};
		        state.inIteration = false;
		        state.inSwitch = false;
		        state.inFunctionBody = true;

		        while (index < length) {
		            if (match('}')) {
		                break;
		            }
		            sourceElement = parseSourceElement();
		            if (typeof sourceElement === 'undefined') {
		                break;
		            }
		            sourceElements.push(sourceElement);
		        }

		        expect('}');

		        state.labelSet = oldLabelSet;
		        state.inIteration = oldInIteration;
		        state.inSwitch = oldInSwitch;
		        state.inFunctionBody = oldInFunctionBody;

		        return {
		            type: Syntax.BlockStatement,
		            body: sourceElements
		        };
		    }

		    function parseFunctionDeclaration() {
		        var id, param, params = [], body, token, stricted, firstRestricted, message, previousStrict, paramSet;

		        expectKeyword('function');
		        token = lookahead();
		        id = parseVariableIdentifier();
		        if (strict) {
		            if (isRestrictedWord(token.value)) {
		                throwErrorTolerant(token, Messages.StrictFunctionName);
		            }
		        } else {
		            if (isRestrictedWord(token.value)) {
		                firstRestricted = token;
		                message = Messages.StrictFunctionName;
		            } else if (isStrictModeReservedWord(token.value)) {
		                firstRestricted = token;
		                message = Messages.StrictReservedWord;
		            }
		        }

		        expect('(');

		        if (!match(')')) {
		            paramSet = {};
		            while (index < length) {
		                token = lookahead();
		                param = parseVariableIdentifier();
		                if (strict) {
		                    if (isRestrictedWord(token.value)) {
		                        stricted = token;
		                        message = Messages.StrictParamName;
		                    }
		                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
		                        stricted = token;
		                        message = Messages.StrictParamDupe;
		                    }
		                } else if (!firstRestricted) {
		                    if (isRestrictedWord(token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictParamName;
		                    } else if (isStrictModeReservedWord(token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictReservedWord;
		                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictParamDupe;
		                    }
		                }
		                params.push(param);
		                paramSet[param.name] = true;
		                if (match(')')) {
		                    break;
		                }
		                expect(',');
		            }
		        }

		        expect(')');

		        previousStrict = strict;
		        body = parseFunctionSourceElements();
		        if (strict && firstRestricted) {
		            throwError(firstRestricted, message);
		        }
		        if (strict && stricted) {
		            throwErrorTolerant(stricted, message);
		        }
		        strict = previousStrict;

		        return {
		            type: Syntax.FunctionDeclaration,
		            id: id,
		            params: params,
		            defaults: [],
		            body: body,
		            rest: null,
		            generator: false,
		            expression: false
		        };
		    }

		    function parseFunctionExpression() {
		        var token, id = null, stricted, firstRestricted, message, param, params = [], body, previousStrict, paramSet;

		        expectKeyword('function');

		        if (!match('(')) {
		            token = lookahead();
		            id = parseVariableIdentifier();
		            if (strict) {
		                if (isRestrictedWord(token.value)) {
		                    throwErrorTolerant(token, Messages.StrictFunctionName);
		                }
		            } else {
		                if (isRestrictedWord(token.value)) {
		                    firstRestricted = token;
		                    message = Messages.StrictFunctionName;
		                } else if (isStrictModeReservedWord(token.value)) {
		                    firstRestricted = token;
		                    message = Messages.StrictReservedWord;
		                }
		            }
		        }

		        expect('(');

		        if (!match(')')) {
		            paramSet = {};
		            while (index < length) {
		                token = lookahead();
		                param = parseVariableIdentifier();
		                if (strict) {
		                    if (isRestrictedWord(token.value)) {
		                        stricted = token;
		                        message = Messages.StrictParamName;
		                    }
		                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
		                        stricted = token;
		                        message = Messages.StrictParamDupe;
		                    }
		                } else if (!firstRestricted) {
		                    if (isRestrictedWord(token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictParamName;
		                    } else if (isStrictModeReservedWord(token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictReservedWord;
		                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictParamDupe;
		                    }
		                }
		                params.push(param);
		                paramSet[param.name] = true;
		                if (match(')')) {
		                    break;
		                }
		                expect(',');
		            }
		        }

		        expect(')');

		        previousStrict = strict;
		        body = parseFunctionSourceElements();
		        if (strict && firstRestricted) {
		            throwError(firstRestricted, message);
		        }
		        if (strict && stricted) {
		            throwErrorTolerant(stricted, message);
		        }
		        strict = previousStrict;

		        return {
		            type: Syntax.FunctionExpression,
		            id: id,
		            params: params,
		            defaults: [],
		            body: body,
		            rest: null,
		            generator: false,
		            expression: false
		        };
		    }

		    // 14 Program

		    function parseSourceElement() {
		        var token = lookahead();

		        if (token.type === Token.Keyword) {
		            switch (token.value) {
		            case 'const':
		            case 'let':
		                return parseConstLetDeclaration(token.value);
		            case 'function':
		                return parseFunctionDeclaration();
		            default:
		                return parseStatement();
		            }
		        }

		        if (token.type !== Token.EOF) {
		            return parseStatement();
		        }
		    }

		    function parseSourceElements() {
		        var sourceElement, sourceElements = [], token, directive, firstRestricted;

		        while (index < length) {
		            token = lookahead();
		            if (token.type !== Token.StringLiteral) {
		                break;
		            }

		            sourceElement = parseSourceElement();
		            sourceElements.push(sourceElement);
		            if (sourceElement.expression.type !== Syntax.Literal) {
		                // this is not directive
		                break;
		            }
		            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
		            if (directive === 'use strict') {
		                strict = true;
		                if (firstRestricted) {
		                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
		                }
		            } else {
		                if (!firstRestricted && token.octal) {
		                    firstRestricted = token;
		                }
		            }
		        }

		        while (index < length) {
		            sourceElement = parseSourceElement();
		            if (typeof sourceElement === 'undefined') {
		                break;
		            }
		            sourceElements.push(sourceElement);
		        }
		        return sourceElements;
		    }

		    function parseProgram() {
		        var program;
		        strict = false;
		        program = {
		            type: Syntax.Program,
		            body: parseSourceElements()
		        };
		        return program;
		    }

		    // The following functions are needed only when the option to preserve
		    // the comments is active.

		    function addComment(type, value, start, end, loc) {
		        assert(typeof start === 'number', 'Comment must have valid position');

		        // Because the way the actual token is scanned, often the comments
		        // (if any) are skipped twice during the lexical analysis.
		        // Thus, we need to skip adding a comment if the comment array already
		        // handled it.
		        if (extra.comments.length > 0) {
		            if (extra.comments[extra.comments.length - 1].range[1] > start) {
		                return;
		            }
		        }

		        extra.comments.push({
		            type: type,
		            value: value,
		            range: [start, end],
		            loc: loc
		        });
		    }

		    function scanComment() {
		        var comment, ch, loc, start, blockComment, lineComment;

		        comment = '';
		        blockComment = false;
		        lineComment = false;

		        while (index < length) {
		            ch = source[index];

		            if (lineComment) {
		                ch = source[index++];
		                if (isLineTerminator(ch)) {
		                    loc.end = {
		                        line: lineNumber,
		                        column: index - lineStart - 1
		                    };
		                    lineComment = false;
		                    addComment('Line', comment, start, index - 1, loc);
		                    if (ch === '\r' && source[index] === '\n') {
		                        ++index;
		                    }
		                    ++lineNumber;
		                    lineStart = index;
		                    comment = '';
		                } else if (index >= length) {
		                    lineComment = false;
		                    comment += ch;
		                    loc.end = {
		                        line: lineNumber,
		                        column: length - lineStart
		                    };
		                    addComment('Line', comment, start, length, loc);
		                } else {
		                    comment += ch;
		                }
		            } else if (blockComment) {
		                if (isLineTerminator(ch)) {
		                    if (ch === '\r' && source[index + 1] === '\n') {
		                        ++index;
		                        comment += '\r\n';
		                    } else {
		                        comment += ch;
		                    }
		                    ++lineNumber;
		                    ++index;
		                    lineStart = index;
		                    if (index >= length) {
		                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                    }
		                } else {
		                    ch = source[index++];
		                    if (index >= length) {
		                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                    }
		                    comment += ch;
		                    if (ch === '*') {
		                        ch = source[index];
		                        if (ch === '/') {
		                            comment = comment.substr(0, comment.length - 1);
		                            blockComment = false;
		                            ++index;
		                            loc.end = {
		                                line: lineNumber,
		                                column: index - lineStart
		                            };
		                            addComment('Block', comment, start, index, loc);
		                            comment = '';
		                        }
		                    }
		                }
		            } else if (ch === '/') {
		                ch = source[index + 1];
		                if (ch === '/') {
		                    loc = {
		                        start: {
		                            line: lineNumber,
		                            column: index - lineStart
		                        }
		                    };
		                    start = index;
		                    index += 2;
		                    lineComment = true;
		                    if (index >= length) {
		                        loc.end = {
		                            line: lineNumber,
		                            column: index - lineStart
		                        };
		                        lineComment = false;
		                        addComment('Line', comment, start, index, loc);
		                    }
		                } else if (ch === '*') {
		                    start = index;
		                    index += 2;
		                    blockComment = true;
		                    loc = {
		                        start: {
		                            line: lineNumber,
		                            column: index - lineStart - 2
		                        }
		                    };
		                    if (index >= length) {
		                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                    }
		                } else {
		                    break;
		                }
		            } else if (isWhiteSpace(ch)) {
		                ++index;
		            } else if (isLineTerminator(ch)) {
		                ++index;
		                if (ch ===  '\r' && source[index] === '\n') {
		                    ++index;
		                }
		                ++lineNumber;
		                lineStart = index;
		            } else {
		                break;
		            }
		        }
		    }

		    function filterCommentLocation() {
		        var i, entry, comment, comments = [];

		        for (i = 0; i < extra.comments.length; ++i) {
		            entry = extra.comments[i];
		            comment = {
		                type: entry.type,
		                value: entry.value
		            };
		            if (extra.range) {
		                comment.range = entry.range;
		            }
		            if (extra.loc) {
		                comment.loc = entry.loc;
		            }
		            comments.push(comment);
		        }

		        extra.comments = comments;
		    }

		    function collectToken() {
		        var start, loc, token, range, value;

		        skipComment();
		        start = index;
		        loc = {
		            start: {
		                line: lineNumber,
		                column: index - lineStart
		            }
		        };

		        token = extra.advance();
		        loc.end = {
		            line: lineNumber,
		            column: index - lineStart
		        };

		        if (token.type !== Token.EOF) {
		            range = [token.range[0], token.range[1]];
		            value = sliceSource(token.range[0], token.range[1]);
		            extra.tokens.push({
		                type: TokenName[token.type],
		                value: value,
		                range: range,
		                loc: loc
		            });
		        }

		        return token;
		    }

		    function collectRegex() {
		        var pos, loc, regex, token;

		        skipComment();

		        pos = index;
		        loc = {
		            start: {
		                line: lineNumber,
		                column: index - lineStart
		            }
		        };

		        regex = extra.scanRegExp();
		        loc.end = {
		            line: lineNumber,
		            column: index - lineStart
		        };

		        // Pop the previous token, which is likely '/' or '/='
		        if (extra.tokens.length > 0) {
		            token = extra.tokens[extra.tokens.length - 1];
		            if (token.range[0] === pos && token.type === 'Punctuator') {
		                if (token.value === '/' || token.value === '/=') {
		                    extra.tokens.pop();
		                }
		            }
		        }

		        extra.tokens.push({
		            type: 'RegularExpression',
		            value: regex.literal,
		            range: [pos, index],
		            loc: loc
		        });

		        return regex;
		    }

		    function filterTokenLocation() {
		        var i, entry, token, tokens = [];

		        for (i = 0; i < extra.tokens.length; ++i) {
		            entry = extra.tokens[i];
		            token = {
		                type: entry.type,
		                value: entry.value
		            };
		            if (extra.range) {
		                token.range = entry.range;
		            }
		            if (extra.loc) {
		                token.loc = entry.loc;
		            }
		            tokens.push(token);
		        }

		        extra.tokens = tokens;
		    }

		    function createLiteral(token) {
		        return {
		            type: Syntax.Literal,
		            value: token.value
		        };
		    }

		    function createRawLiteral(token) {
		        return {
		            type: Syntax.Literal,
		            value: token.value,
		            raw: sliceSource(token.range[0], token.range[1])
		        };
		    }

		    function createLocationMarker() {
		        var marker = {};

		        marker.range = [index, index];
		        marker.loc = {
		            start: {
		                line: lineNumber,
		                column: index - lineStart
		            },
		            end: {
		                line: lineNumber,
		                column: index - lineStart
		            }
		        };

		        marker.end = function () {
		            this.range[1] = index;
		            this.loc.end.line = lineNumber;
		            this.loc.end.column = index - lineStart;
		        };

		        marker.applyGroup = function (node) {
		            if (extra.range) {
		                node.groupRange = [this.range[0], this.range[1]];
		            }
		            if (extra.loc) {
		                node.groupLoc = {
		                    start: {
		                        line: this.loc.start.line,
		                        column: this.loc.start.column
		                    },
		                    end: {
		                        line: this.loc.end.line,
		                        column: this.loc.end.column
		                    }
		                };
		            }
		        };

		        marker.apply = function (node) {
		            if (extra.range) {
		                node.range = [this.range[0], this.range[1]];
		            }
		            if (extra.loc) {
		                node.loc = {
		                    start: {
		                        line: this.loc.start.line,
		                        column: this.loc.start.column
		                    },
		                    end: {
		                        line: this.loc.end.line,
		                        column: this.loc.end.column
		                    }
		                };
		            }
		        };

		        return marker;
		    }

		    function trackGroupExpression() {
		        var marker, expr;

		        skipComment();
		        marker = createLocationMarker();
		        expect('(');

		        expr = parseExpression();

		        expect(')');

		        marker.end();
		        marker.applyGroup(expr);

		        return expr;
		    }

		    function trackLeftHandSideExpression() {
		        var marker, expr;

		        skipComment();
		        marker = createLocationMarker();

		        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

		        while (match('.') || match('[')) {
		            if (match('[')) {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: true,
		                    object: expr,
		                    property: parseComputedMember()
		                };
		                marker.end();
		                marker.apply(expr);
		            } else {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: false,
		                    object: expr,
		                    property: parseNonComputedMember()
		                };
		                marker.end();
		                marker.apply(expr);
		            }
		        }

		        return expr;
		    }

		    function trackLeftHandSideExpressionAllowCall() {
		        var marker, expr;

		        skipComment();
		        marker = createLocationMarker();

		        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

		        while (match('.') || match('[') || match('(')) {
		            if (match('(')) {
		                expr = {
		                    type: Syntax.CallExpression,
		                    callee: expr,
		                    'arguments': parseArguments()
		                };
		                marker.end();
		                marker.apply(expr);
		            } else if (match('[')) {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: true,
		                    object: expr,
		                    property: parseComputedMember()
		                };
		                marker.end();
		                marker.apply(expr);
		            } else {
		                expr = {
		                    type: Syntax.MemberExpression,
		                    computed: false,
		                    object: expr,
		                    property: parseNonComputedMember()
		                };
		                marker.end();
		                marker.apply(expr);
		            }
		        }

		        return expr;
		    }

		    function filterGroup(node) {
		        var n, i, entry;

		        n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
		        for (i in node) {
		            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
		                entry = node[i];
		                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
		                    n[i] = entry;
		                } else {
		                    n[i] = filterGroup(entry);
		                }
		            }
		        }
		        return n;
		    }

		    function wrapTrackingFunction(range, loc) {

		        return function (parseFunction) {

		            function isBinary(node) {
		                return node.type === Syntax.LogicalExpression ||
		                    node.type === Syntax.BinaryExpression;
		            }

		            function visit(node) {
		                var start, end;

		                if (isBinary(node.left)) {
		                    visit(node.left);
		                }
		                if (isBinary(node.right)) {
		                    visit(node.right);
		                }

		                if (range) {
		                    if (node.left.groupRange || node.right.groupRange) {
		                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
		                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
		                        node.range = [start, end];
		                    } else if (typeof node.range === 'undefined') {
		                        start = node.left.range[0];
		                        end = node.right.range[1];
		                        node.range = [start, end];
		                    }
		                }
		                if (loc) {
		                    if (node.left.groupLoc || node.right.groupLoc) {
		                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
		                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
		                        node.loc = {
		                            start: start,
		                            end: end
		                        };
		                    } else if (typeof node.loc === 'undefined') {
		                        node.loc = {
		                            start: node.left.loc.start,
		                            end: node.right.loc.end
		                        };
		                    }
		                }
		            }

		            return function () {
		                var marker, node;

		                skipComment();

		                marker = createLocationMarker();
		                node = parseFunction.apply(null, arguments);
		                marker.end();

		                if (range && typeof node.range === 'undefined') {
		                    marker.apply(node);
		                }

		                if (loc && typeof node.loc === 'undefined') {
		                    marker.apply(node);
		                }

		                if (isBinary(node)) {
		                    visit(node);
		                }

		                return node;
		            };
		        };
		    }

		    function patch() {

		        var wrapTracking;

		        if (extra.comments) {
		            extra.skipComment = skipComment;
		            skipComment = scanComment;
		        }

		        if (extra.raw) {
		            extra.createLiteral = createLiteral;
		            createLiteral = createRawLiteral;
		        }

		        if (extra.range || extra.loc) {

		            extra.parseGroupExpression = parseGroupExpression;
		            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
		            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
		            parseGroupExpression = trackGroupExpression;
		            parseLeftHandSideExpression = trackLeftHandSideExpression;
		            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;

		            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);

		            extra.parseAdditiveExpression = parseAdditiveExpression;
		            extra.parseAssignmentExpression = parseAssignmentExpression;
		            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
		            extra.parseBitwiseORExpression = parseBitwiseORExpression;
		            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
		            extra.parseBlock = parseBlock;
		            extra.parseFunctionSourceElements = parseFunctionSourceElements;
		            extra.parseCatchClause = parseCatchClause;
		            extra.parseComputedMember = parseComputedMember;
		            extra.parseConditionalExpression = parseConditionalExpression;
		            extra.parseConstLetDeclaration = parseConstLetDeclaration;
		            extra.parseEqualityExpression = parseEqualityExpression;
		            extra.parseExpression = parseExpression;
		            extra.parseForVariableDeclaration = parseForVariableDeclaration;
		            extra.parseFunctionDeclaration = parseFunctionDeclaration;
		            extra.parseFunctionExpression = parseFunctionExpression;
		            extra.parseLogicalANDExpression = parseLogicalANDExpression;
		            extra.parseLogicalORExpression = parseLogicalORExpression;
		            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
		            extra.parseNewExpression = parseNewExpression;
		            extra.parseNonComputedProperty = parseNonComputedProperty;
		            extra.parseObjectProperty = parseObjectProperty;
		            extra.parseObjectPropertyKey = parseObjectPropertyKey;
		            extra.parsePostfixExpression = parsePostfixExpression;
		            extra.parsePrimaryExpression = parsePrimaryExpression;
		            extra.parseProgram = parseProgram;
		            extra.parsePropertyFunction = parsePropertyFunction;
		            extra.parseRelationalExpression = parseRelationalExpression;
		            extra.parseStatement = parseStatement;
		            extra.parseShiftExpression = parseShiftExpression;
		            extra.parseSwitchCase = parseSwitchCase;
		            extra.parseUnaryExpression = parseUnaryExpression;
		            extra.parseVariableDeclaration = parseVariableDeclaration;
		            extra.parseVariableIdentifier = parseVariableIdentifier;

		            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
		            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
		            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
		            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
		            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
		            parseBlock = wrapTracking(extra.parseBlock);
		            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
		            parseCatchClause = wrapTracking(extra.parseCatchClause);
		            parseComputedMember = wrapTracking(extra.parseComputedMember);
		            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
		            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
		            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
		            parseExpression = wrapTracking(extra.parseExpression);
		            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
		            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
		            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
		            parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
		            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
		            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
		            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
		            parseNewExpression = wrapTracking(extra.parseNewExpression);
		            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
		            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
		            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
		            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
		            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
		            parseProgram = wrapTracking(extra.parseProgram);
		            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
		            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
		            parseStatement = wrapTracking(extra.parseStatement);
		            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
		            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
		            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
		            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
		            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
		        }

		        if (typeof extra.tokens !== 'undefined') {
		            extra.advance = advance;
		            extra.scanRegExp = scanRegExp;

		            advance = collectToken;
		            scanRegExp = collectRegex;
		        }
		    }

		    function unpatch() {
		        if (typeof extra.skipComment === 'function') {
		            skipComment = extra.skipComment;
		        }

		        if (extra.raw) {
		            createLiteral = extra.createLiteral;
		        }

		        if (extra.range || extra.loc) {
		            parseAdditiveExpression = extra.parseAdditiveExpression;
		            parseAssignmentExpression = extra.parseAssignmentExpression;
		            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
		            parseBitwiseORExpression = extra.parseBitwiseORExpression;
		            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
		            parseBlock = extra.parseBlock;
		            parseFunctionSourceElements = extra.parseFunctionSourceElements;
		            parseCatchClause = extra.parseCatchClause;
		            parseComputedMember = extra.parseComputedMember;
		            parseConditionalExpression = extra.parseConditionalExpression;
		            parseConstLetDeclaration = extra.parseConstLetDeclaration;
		            parseEqualityExpression = extra.parseEqualityExpression;
		            parseExpression = extra.parseExpression;
		            parseForVariableDeclaration = extra.parseForVariableDeclaration;
		            parseFunctionDeclaration = extra.parseFunctionDeclaration;
		            parseFunctionExpression = extra.parseFunctionExpression;
		            parseGroupExpression = extra.parseGroupExpression;
		            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
		            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
		            parseLogicalANDExpression = extra.parseLogicalANDExpression;
		            parseLogicalORExpression = extra.parseLogicalORExpression;
		            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
		            parseNewExpression = extra.parseNewExpression;
		            parseNonComputedProperty = extra.parseNonComputedProperty;
		            parseObjectProperty = extra.parseObjectProperty;
		            parseObjectPropertyKey = extra.parseObjectPropertyKey;
		            parsePrimaryExpression = extra.parsePrimaryExpression;
		            parsePostfixExpression = extra.parsePostfixExpression;
		            parseProgram = extra.parseProgram;
		            parsePropertyFunction = extra.parsePropertyFunction;
		            parseRelationalExpression = extra.parseRelationalExpression;
		            parseStatement = extra.parseStatement;
		            parseShiftExpression = extra.parseShiftExpression;
		            parseSwitchCase = extra.parseSwitchCase;
		            parseUnaryExpression = extra.parseUnaryExpression;
		            parseVariableDeclaration = extra.parseVariableDeclaration;
		            parseVariableIdentifier = extra.parseVariableIdentifier;
		        }

		        if (typeof extra.scanRegExp === 'function') {
		            advance = extra.advance;
		            scanRegExp = extra.scanRegExp;
		        }
		    }

		    function stringToArray(str) {
		        var length = str.length,
		            result = [],
		            i;
		        for (i = 0; i < length; ++i) {
		            result[i] = str.charAt(i);
		        }
		        return result;
		    }

		    function parse(code, options) {
		        var program, toString;

		        toString = String;
		        if (typeof code !== 'string' && !(code instanceof String)) {
		            code = toString(code);
		        }

		        source = code;
		        index = 0;
		        lineNumber = (source.length > 0) ? 1 : 0;
		        lineStart = 0;
		        length = source.length;
		        buffer = null;
		        state = {
		            allowIn: true,
		            labelSet: {},
		            inFunctionBody: false,
		            inIteration: false,
		            inSwitch: false
		        };

		        extra = {};
		        if (typeof options !== 'undefined') {
		            extra.range = (typeof options.range === 'boolean') && options.range;
		            extra.loc = (typeof options.loc === 'boolean') && options.loc;
		            extra.raw = (typeof options.raw === 'boolean') && options.raw;
		            if (typeof options.tokens === 'boolean' && options.tokens) {
		                extra.tokens = [];
		            }
		            if (typeof options.comment === 'boolean' && options.comment) {
		                extra.comments = [];
		            }
		            if (typeof options.tolerant === 'boolean' && options.tolerant) {
		                extra.errors = [];
		            }
		        }

		        if (length > 0) {
		            if (typeof source[0] === 'undefined') {
		                // Try first to convert to a string. This is good as fast path
		                // for old IE which understands string indexing for string
		                // literals only and not for string object.
		                if (code instanceof String) {
		                    source = code.valueOf();
		                }

		                // Force accessing the characters via an array.
		                if (typeof source[0] === 'undefined') {
		                    source = stringToArray(code);
		                }
		            }
		        }

		        patch();
		        try {
		            program = parseProgram();
		            if (typeof extra.comments !== 'undefined') {
		                filterCommentLocation();
		                program.comments = extra.comments;
		            }
		            if (typeof extra.tokens !== 'undefined') {
		                filterTokenLocation();
		                program.tokens = extra.tokens;
		            }
		            if (typeof extra.errors !== 'undefined') {
		                program.errors = extra.errors;
		            }
		            if (extra.range || extra.loc) {
		                program.body = filterGroup(program.body);
		            }
		        } catch (e) {
		            throw e;
		        } finally {
		            unpatch();
		            extra = {};
		        }

		        return program;
		    }

		    // Sync with package.json.
		    exports.version = '1.0.4';

		    exports.parse = parse;

		    // Deep copy.
		    exports.Syntax = (function () {
		        var name, types = {};

		        if (typeof Object.create === 'function') {
		            types = Object.create(null);
		        }

		        for (name in Syntax) {
		            if (Syntax.hasOwnProperty(name)) {
		                types[name] = Syntax[name];
		            }
		        }

		        if (typeof Object.freeze === 'function') {
		            Object.freeze(types);
		        }

		        return types;
		    }());

		}));
		/* vim: set sw=4 ts=4 et tw=80 : */


	/***/ },
	/* 2 */
	/***/ function(module, exports, __webpack_require__) {

		module.exports = hoist

		function hoist(ast){

		  var parentStack = []
		  var variables = []
		  var functions = []

		  if (Array.isArray(ast)){

		    walkAll(ast)
		    prependScope(ast, variables, functions)
		    
		  } else {
		    walk(ast)
		  }

		  return ast

		  // walk through each node of a program of block statement
		  function walkAll(nodes){
		    var result = null
		    for (var i=0;i<nodes.length;i++){
		      var childNode = nodes[i]
		      if (childNode.type === 'EmptyStatement') continue
		      var result = walk(childNode)
		      if (result === 'remove'){
		        nodes.splice(i--, 1)
		      }
		    }
		  }

		  function walk(node){
		    var parent = parentStack[parentStack.length-1]
		    var remove = false
		    parentStack.push(node)

		    var excludeBody = false
		    if (shouldScope(node, parent)){
		      hoist(node.body)
		      excludeBody = true
		    }

		    if (node.type === 'VariableDeclarator'){
		      variables.push(node)
		    }

		    if (node.type === 'FunctionDeclaration'){
		      functions.push(node)
		      remove = true
		    }

		    for (var key in node){
		      if (key === 'type' || (excludeBody && key === 'body')) continue
		      if (key in node && node[key] && typeof node[key] == 'object'){
		        if (node[key].type){
		          walk(node[key])
		        } else if (Array.isArray(node[key])){
		          walkAll(node[key])
		        }
		      }
		    }

		    parentStack.pop()
		    if (remove){
		      return 'remove'
		    }
		  }
		}

		function shouldScope(node, parent){
		  if (node.type === 'Program'){
		    return true
		  } else if (node.type === 'BlockStatement'){
		    if (parent && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')){
		      return true
		    }
		  }
		}

		function prependScope(nodes, variables, functions){
		  if (variables && variables.length){
		    var declarations = []
		    for (var i=0;i<variables.length;i++){
		      declarations.push({
		        type: 'VariableDeclarator', 
		        id: variables[i].id,
		        init: null
		      })
		    }
		    
		    nodes.unshift({
		      type: 'VariableDeclaration', 
		      kind: 'var', 
		      declarations: declarations
		    })

		  }

		  if (functions && functions.length){
		    for (var i=0;i<functions.length;i++){
		      nodes.unshift(functions[i]) 
		    }
		  }
		}

	/***/ },
	/* 3 */
	/***/ function(module, exports, __webpack_require__) {

		module.exports = InfiniteChecker

		function InfiniteChecker(maxIterations){
		  if (this instanceof InfiniteChecker){
		    this.maxIterations = maxIterations
		    this.count = 0
		  } else {
		    return new InfiniteChecker(maxIterations)
		  }
		}

		InfiniteChecker.prototype.check = function(){
		  this.count += 1
		  if (this.count > this.maxIterations){
		    throw new Error('Infinite loop detected - reached max iterations')
		  }
		}

	/***/ },
	/* 4 */
	/***/ function(module, exports, __webpack_require__) {

		/* WEBPACK VAR INJECTION */(function(global) {var names = ['Object', 'String', 'Boolean', 'Number', 'RegExp', 'Date', 'Array']
		var immutable = {string: 'String', boolean: 'Boolean', number: 'Number' }

		var primitives = names.map(getGlobal)
		var protos = primitives.map(getProto)

		var protoReplacements = {}

		module.exports = Primitives

		function Primitives(context){
		  if (this instanceof Primitives){
		    this.context = context
		    for (var i=0;i<names.length;i++){
		      if (!this.context[names[i]]){
		        this.context[names[i]] = wrap(primitives[i])
		      }
		    }
		  } else {
		    return new Primitives(context)
		  }
		}

		Primitives.prototype.replace = function(value){
		  var primIndex = primitives.indexOf(value)
		  var protoIndex = protos.indexOf(value)

		  if (~primIndex){
		    var name = names[primIndex]
		    return this.context[name]
		  } else if (~protoIndex) {
		    var name = names[protoIndex]
		    return this.context[name].prototype
		  } else  {
		    return value
		  }
		}

		Primitives.prototype.getPropertyObject = function(object, property){
		  if (immutable[typeof object]){
		    return this.getPrototypeOf(object)
		  }
		  return object
		}

		Primitives.prototype.isPrimitive = function(value){
		  return !!~primitives.indexOf(value) || !!~protos.indexOf(value)
		}

		Primitives.prototype.getPrototypeOf = function(value){
		  if (value == null){ // handle null and undefined
		    return value
		  }

		  var immutableType = immutable[typeof value]
		  if (immutableType){
		    var proto = this.context[immutableType].prototype
		  } else {
		    var proto = Object.getPrototypeOf(value)
		  }

		  if (!proto || proto === Object.prototype){
		    return null
		  } else {
		    var replacement = this.replace(proto)
		    if (replacement === value){
		      replacement = this.replace(Object.prototype)
		    }
		    return replacement
		  }
		}

		Primitives.prototype.applyNew = function(func, args){
		  if (func.wrapped){
		    var prim = Object.getPrototypeOf(func)
		    var instance = new (Function.prototype.bind.apply(prim, arguments))
		    setProto(instance, func.prototype)
		    return instance
		  } else {
		    return new (Function.prototype.bind.apply(func, arguments))
		  }
		}

		function getProto(func){
		  return func.prototype
		}

		function getGlobal(str){
		  return global[str]
		}

		function setProto(obj, proto){
		  obj.__proto__ = proto
		}

		function wrap(prim){
		  var proto = Object.create(prim.prototype)

		  var result = function() {
		    if (this instanceof result){
		      prim.apply(this, arguments)
		    } else {
		      var instance = prim.apply(null, arguments)
		      setProto(instance, proto)
		      return instance
		    }
		  }
		  setProto(result, prim)
		  result.prototype = proto
		  result.wrapped = true
		  return result
		}
		/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

	/***/ }
	/******/ ]);

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var MAX_UPDATE_COUNT = 10

	// we have two separate queues: one for directive updates
	// and one for user watcher registered via $watch().
	// we want to guarantee directive updates to be called
	// before user watchers so that when user watchers are
	// triggered, the DOM would have already been in updated
	// state.
	var queue = []
	var userQueue = []
	var has = {}
	var waiting = false
	var flushing = false
	var internalQueueDepleted = false

	/**
	 * Reset the batcher's state.
	 */

	function reset () {
	  queue = []
	  userQueue = []
	  has = {}
	  waiting = flushing = internalQueueDepleted = false
	}

	/**
	 * Flush both queues and run the jobs.
	 */

	function flush () {
	  flushing = true
	  run(queue)
	  internalQueueDepleted = true
	  run(userQueue)
	  reset()
	}

	/**
	 * Run the jobs in a single queue.
	 *
	 * @param {Array} queue
	 */

	function run (queue) {
	  // do not cache length because more jobs might be pushed
	  // as we run existing jobs
	  for (var i = 0; i < queue.length; i++) {
	    queue[i].run()
	  }
	}

	/**
	 * Push a job into the job queue.
	 * Jobs with duplicate IDs will be skipped unless it's
	 * pushed when the queue is being flushed.
	 *
	 * @param {Object} job
	 *   properties:
	 *   - {String|Number} id
	 *   - {Function}      run
	 */

	exports.push = function (job) {
	  var id = job.id
	  if (!id || !has[id] || flushing) {
	    if (!has[id]) {
	      has[id] = 1
	    } else {
	      has[id]++
	      // detect possible infinite update loops
	      if (has[id] > MAX_UPDATE_COUNT) {
	        _.warn(
	          'You may have an infinite update loop for the ' +
	          'watcher with expression: "' + job.expression + '".'
	        )
	        return
	      }
	    }
	    // A user watcher callback could trigger another
	    // directive update during the flushing; at that time
	    // the directive queue would already have been run, so
	    // we call that update immediately as it is pushed.
	    if (flushing && !job.user && internalQueueDepleted) {
	      job.run()
	      return
	    }
	    ;(job.user ? userQueue : queue).push(job)
	    if (!waiting) {
	      waiting = true
	      _.nextTick(flush)
	    }
	  }
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var templateParser = __webpack_require__(12)

	module.exports = {

	  isLiteral: true,

	  /**
	   * Setup. Two possible usages:
	   *
	   * - static:
	   *   v-component="comp"
	   *
	   * - dynamic:
	   *   v-component="{{currentView}}"
	   */

	  bind: function () {
	    if (!this.el.__vue__) {
	      // create a ref anchor
	      this.anchor = _.createAnchor('v-component')
	      _.replace(this.el, this.anchor)
	      // check keep-alive options.
	      // If yes, instead of destroying the active vm when
	      // hiding (v-if) or switching (dynamic literal) it,
	      // we simply remove it from the DOM and save it in a
	      // cache object, with its constructor id as the key.
	      this.keepAlive = this._checkParam('keep-alive') != null
	      // check ref
	      this.refID = _.attr(this.el, 'ref')
	      if (this.keepAlive) {
	        this.cache = {}
	      }
	      // check inline-template
	      if (this._checkParam('inline-template') !== null) {
	        // extract inline template as a DocumentFragment
	        this.template = _.extractContent(this.el, true)
	      }
	      // component resolution related state
	      this._pendingCb =
	      this.ctorId =
	      this.Ctor = null
	      // if static, build right now.
	      if (!this._isDynamicLiteral) {
	        this.resolveCtor(this.expression, _.bind(function () {
	          var child = this.build()
	          child.$before(this.anchor)
	          this.setCurrent(child)
	        }, this))
	      } else {
	        // check dynamic component params
	        this.readyEvent = this._checkParam('wait-for')
	        this.transMode = this._checkParam('transition-mode')
	      }
	    } else {
	      _.warn(
	        'v-component="' + this.expression + '" cannot be ' +
	        'used on an already mounted instance.'
	      )
	    }
	  },

	  /**
	   * Public update, called by the watcher in the dynamic
	   * literal scenario, e.g. v-component="{{view}}"
	   */

	  update: function (value) {
	    this.setComponent(value)
	  },

	  /**
	   * Switch dynamic components. May resolve the component
	   * asynchronously, and perform transition based on
	   * specified transition mode. Accepts a few additional
	   * arguments specifically for vue-router.
	   *
	   * @param {String} value
	   * @param {Object} data
	   * @param {Function} afterBuild
	   * @param {Function} afterTransition
	   */

	  setComponent: function (value, data, afterBuild, afterTransition) {
	    this.invalidatePending()
	    if (!value) {
	      // just remove current
	      this.unbuild()
	      this.remove(this.childVM, afterTransition)
	      this.unsetCurrent()
	    } else {
	      this.resolveCtor(value, _.bind(function () {
	        this.unbuild()
	        var newComponent = this.build(data)
	        /* istanbul ignore if */
	        if (afterBuild) afterBuild(newComponent)
	        var self = this
	        if (this.readyEvent) {
	          newComponent.$once(this.readyEvent, function () {
	            self.transition(newComponent, afterTransition)
	          })
	        } else {
	          this.transition(newComponent, afterTransition)
	        }
	      }, this))
	    }
	  },

	  /**
	   * Resolve the component constructor to use when creating
	   * the child vm.
	   */

	  resolveCtor: function (id, cb) {
	    var self = this
	    this._pendingCb = _.cancellable(function (ctor) {
	      self.ctorId = id
	      self.Ctor = ctor
	      cb()
	    })
	    this.vm._resolveComponent(id, this._pendingCb)
	  },

	  /**
	   * When the component changes or unbinds before an async
	   * constructor is resolved, we need to invalidate its
	   * pending callback.
	   */

	  invalidatePending: function () {
	    if (this._pendingCb) {
	      this._pendingCb.cancel()
	      this._pendingCb = null
	    }
	  },

	  /**
	   * Instantiate/insert a new child vm.
	   * If keep alive and has cached instance, insert that
	   * instance; otherwise build a new one and cache it.
	   *
	   * @param {Object} [data]
	   * @return {Vue} - the created instance
	   */

	  build: function (data) {
	    if (this.keepAlive) {
	      var cached = this.cache[this.ctorId]
	      if (cached) {
	        return cached
	      }
	    }
	    var vm = this.vm
	    var el = templateParser.clone(this.el)
	    if (this.Ctor) {
	      var child = vm.$addChild({
	        el: el,
	        data: data,
	        template: this.template,
	        // if no inline-template, then the compiled
	        // linker can be cached for better performance.
	        _linkerCachable: !this.template,
	        _asComponent: true,
	        _host: this._host,
	        _isRouterView: this._isRouterView
	      }, this.Ctor)
	      if (this.keepAlive) {
	        this.cache[this.ctorId] = child
	      }
	      return child
	    }
	  },

	  /**
	   * Teardown the current child, but defers cleanup so
	   * that we can separate the destroy and removal steps.
	   */

	  unbuild: function () {
	    var child = this.childVM
	    if (!child || this.keepAlive) {
	      return
	    }
	    // the sole purpose of `deferCleanup` is so that we can
	    // "deactivate" the vm right now and perform DOM removal
	    // later.
	    child.$destroy(false, true)
	  },

	  /**
	   * Remove current destroyed child and manually do
	   * the cleanup after removal.
	   *
	   * @param {Function} cb
	   */

	  remove: function (child, cb) {
	    var keepAlive = this.keepAlive
	    if (child) {
	      child.$remove(function () {
	        if (!keepAlive) child._cleanup()
	        if (cb) cb()
	      })
	    } else if (cb) {
	      cb()
	    }
	  },

	  /**
	   * Actually swap the components, depending on the
	   * transition mode. Defaults to simultaneous.
	   *
	   * @param {Vue} target
	   * @param {Function} [cb]
	   */

	  transition: function (target, cb) {
	    var self = this
	    var current = this.childVM
	    this.unsetCurrent()
	    this.setCurrent(target)
	    switch (self.transMode) {
	      case 'in-out':
	        target.$before(self.anchor, function () {
	          self.remove(current, cb)
	        })
	        break
	      case 'out-in':
	        self.remove(current, function () {
	          if (!target._isDestroyed) {
	            target.$before(self.anchor, cb)
	          }
	        })
	        break
	      default:
	        self.remove(current)
	        target.$before(self.anchor, cb)
	    }
	  },

	  /**
	   * Set childVM and parent ref
	   */
	  
	  setCurrent: function (child) {
	    this.childVM = child
	    var refID = child._refID || this.refID
	    if (refID) {
	      this.vm.$[refID] = child
	    }
	  },

	  /**
	   * Unset childVM and parent ref
	   */

	  unsetCurrent: function () {
	    var child = this.childVM
	    this.childVM = null
	    var refID = (child && child._refID) || this.refID
	    if (refID) {
	      this.vm.$[refID] = null
	    }
	  },

	  /**
	   * Unbind.
	   */

	  unbind: function () {
	    this.invalidatePending()
	    this.unbuild()
	    // destroy all keep-alive cached instances
	    if (this.cache) {
	      for (var key in this.cache) {
	        this.cache[key].$destroy()
	      }
	      this.cache = null
	    }
	  }

	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(3)
	var templateParser = __webpack_require__(12)

	/**
	 * Process an element or a DocumentFragment based on a
	 * instance option object. This allows us to transclude
	 * a template node/fragment before the instance is created,
	 * so the processed fragment can then be cloned and reused
	 * in v-repeat.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	exports.transclude = function (el, options) {
	  // extract container attributes to pass them down
	  // to compiler, because they need to be compiled in
	  // parent scope. we are mutating the options object here
	  // assuming the same object will be used for compile
	  // right after this.
	  if (options) {
	    options._containerAttrs = extractAttrs(el)
	  }
	  // for template tags, what we want is its content as
	  // a documentFragment (for block instances)
	  if (_.isTemplate(el)) {
	    el = templateParser.parse(el)
	  }
	  if (options) {
	    if (options._asComponent && !options.template) {
	      options.template = '<content></content>'
	    }
	    if (options.template) {
	      options._content = _.extractContent(el)
	      el = transcludeTemplate(el, options)
	    }
	  }
	  if (el instanceof DocumentFragment) {
	    // anchors for block instance
	    // passing in `persist: true` to avoid them being
	    // discarded by IE during template cloning
	    _.prepend(_.createAnchor('v-start', true), el)
	    el.appendChild(_.createAnchor('v-end', true))
	  }
	  return el
	}

	/**
	 * Process the template option.
	 * If the replace option is true this will swap the $el.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	function transcludeTemplate (el, options) {
	  var template = options.template
	  var frag = templateParser.parse(template, true)
	  if (!frag) {
	    _.warn('Invalid template option: ' + template)
	  } else {
	    var replacer = frag.firstChild
	    if (options.replace) {
	      if (
	        frag.childNodes.length > 1 ||
	        replacer.nodeType !== 1 ||
	        // when root node has v-repeat, the instance ends up
	        // having multiple top-level nodes, thus becoming a
	        // block instance. (#835)
	        replacer.hasAttribute(config.prefix + 'repeat')
	      ) {
	        return frag
	      } else {
	        options._replacerAttrs = extractAttrs(replacer)
	        mergeAttrs(el, replacer)
	        return replacer
	      }
	    } else {
	      el.appendChild(frag)
	      return el
	    }
	  }
	}

	/**
	 * Helper to extract a component container's attribute names
	 * into a map.
	 *
	 * @param {Element} el
	 * @return {Object}
	 */

	function extractAttrs (el) {
	  if (el.nodeType === 1 && el.hasAttributes()) {
	    var attrs = el.attributes
	    var res = {}
	    var i = attrs.length
	    while (i--) {
	      res[attrs[i].name] = attrs[i].value
	    }
	    return res
	  }
	}

	/**
	 * Merge the attributes of two elements, and make sure
	 * the class names are merged properly.
	 *
	 * @param {Element} from
	 * @param {Element} to
	 */

	function mergeAttrs (from, to) {
	  var attrs = from.attributes
	  var i = attrs.length
	  var name, value
	  while (i--) {
	    name = attrs[i].name
	    value = attrs[i].value
	    if (!to.hasAttribute(name)) {
	      to.setAttribute(name, value)
	    } else if (name === 'class') {
	      to.className = to.className + ' ' + value
	    }
	  }
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// manipulation directives
	exports.text       = __webpack_require__(30)
	exports.html       = __webpack_require__(31)
	exports.attr       = __webpack_require__(32)
	exports.show       = __webpack_require__(33)
	exports['class']   = __webpack_require__(35)
	exports.el         = __webpack_require__(36)
	exports.ref        = __webpack_require__(37)
	exports.cloak      = __webpack_require__(38)
	exports.style      = __webpack_require__(29)
	exports.transition = __webpack_require__(39)

	// event listener directives
	exports.on         = __webpack_require__(42)
	exports.model      = __webpack_require__(43)

	// logic control directives
	exports.repeat     = __webpack_require__(48)
	exports['if']      = __webpack_require__(49)

	// internal directives that should not be used directly
	// but we still want to expose them for advanced usage.
	exports._component = __webpack_require__(26)
	exports._prop      = __webpack_require__(16)

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var prefixes = ['-webkit-', '-moz-', '-ms-']
	var camelPrefixes = ['Webkit', 'Moz', 'ms']
	var importantRE = /!important;?$/
	var camelRE = /([a-z])([A-Z])/g
	var testEl = null
	var propCache = {}

	module.exports = {

	  deep: true,

	  update: function (value) {
	    if (this.arg) {
	      this.setProp(this.arg, value)
	    } else {
	      if (typeof value === 'object') {
	        this.objectHandler(value)
	      } else {
	        this.el.style.cssText = value
	      }
	    }
	  },

	  objectHandler: function (value) {
	    // cache object styles so that only changed props
	    // are actually updated.
	    var cache = this.cache || (this.cache = {})
	    var prop, val
	    for (prop in cache) {
	      if (!(prop in value)) {
	        this.setProp(prop, null)
	        delete cache[prop]
	      }
	    }
	    for (prop in value) {
	      val = value[prop]
	      if (val !== cache[prop]) {
	        cache[prop] = val
	        this.setProp(prop, val)
	      }
	    }
	  },

	  setProp: function (prop, value) {
	    prop = normalize(prop)
	    if (!prop) return // unsupported prop
	    // cast possible numbers/booleans into strings
	    if (value != null) value += ''
	    if (value) {
	      var isImportant = importantRE.test(value)
	        ? 'important'
	        : ''
	      if (isImportant) {
	        value = value.replace(importantRE, '').trim()
	      }
	      this.el.style.setProperty(prop, value, isImportant)
	    } else {
	      this.el.style.removeProperty(prop)
	    }
	  }

	}

	/**
	 * Normalize a CSS property name.
	 * - cache result
	 * - auto prefix
	 * - camelCase -> dash-case
	 *
	 * @param {String} prop
	 * @return {String}
	 */

	function normalize (prop) {
	  if (propCache[prop]) {
	    return propCache[prop]
	  }
	  var res = prefix(prop)
	  propCache[prop] = propCache[res] = res
	  return res
	}

	/**
	 * Auto detect the appropriate prefix for a CSS property.
	 * https://gist.github.com/paulirish/523692
	 *
	 * @param {String} prop
	 * @return {String}
	 */

	function prefix (prop) {
	  prop = prop.replace(camelRE, '$1-$2').toLowerCase()
	  var camel = _.camelize(prop)
	  var upper = camel.charAt(0).toUpperCase() + camel.slice(1)
	  if (!testEl) {
	    testEl = document.createElement('div')
	  }
	  if (camel in testEl.style) {
	    return prop
	  }
	  var i = prefixes.length
	  var prefixed
	  while (i--) {
	    prefixed = camelPrefixes[i] + upper
	    if (prefixed in testEl.style) {
	      return prefixes[i] + prop
	    }
	  }
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    this.attr = this.el.nodeType === 3
	      ? 'nodeValue'
	      : 'textContent'
	  },

	  update: function (value) {
	    this.el[this.attr] = _.toString(value)
	  }
	  
	}

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var templateParser = __webpack_require__(12)

	module.exports = {

	  bind: function () {
	    // a comment node means this is a binding for
	    // {{{ inline unescaped html }}}
	    if (this.el.nodeType === 8) {
	      // hold nodes
	      this.nodes = []
	      // replace the placeholder with proper anchor
	      this.anchor = _.createAnchor('v-html')
	      _.replace(this.el, this.anchor)
	    }
	  },

	  update: function (value) {
	    value = _.toString(value)
	    if (this.nodes) {
	      this.swap(value)
	    } else {
	      this.el.innerHTML = value
	    }
	  },

	  swap: function (value) {
	    // remove old nodes
	    var i = this.nodes.length
	    while (i--) {
	      _.remove(this.nodes[i])
	    }
	    // convert new value to a fragment
	    // do not attempt to retrieve from id selector
	    var frag = templateParser.parse(value, true, true)
	    // save a reference to these nodes so we can remove later
	    this.nodes = _.toArray(frag.childNodes)
	    _.before(frag, this.anchor)
	  }

	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// xlink
	var xlinkNS = 'http://www.w3.org/1999/xlink'
	var xlinkRE = /^xlink:/

	module.exports = {

	  priority: 850,

	  update: function (value) {
	    if (this.arg) {
	      this.setAttr(this.arg, value)
	    } else if (typeof value === 'object') {
	      this.objectHandler(value)
	    }
	  },

	  objectHandler: function (value) {
	    // cache object attrs so that only changed attrs
	    // are actually updated.
	    var cache = this.cache || (this.cache = {})
	    var attr, val
	    for (attr in cache) {
	      if (!(attr in value)) {
	        this.setAttr(attr, null)
	        delete cache[attr]
	      }
	    }
	    for (attr in value) {
	      val = value[attr]
	      if (val !== cache[attr]) {
	        cache[attr] = val
	        this.setAttr(attr, val)
	      }
	    }
	  },

	  setAttr: function (attr, value) {
	    if (value || value === 0) {
	      if (xlinkRE.test(attr)) {
	        this.el.setAttributeNS(xlinkNS, attr, value)
	      } else {
	        this.el.setAttribute(attr, value)
	      }
	    } else {
	      this.el.removeAttribute(attr)
	    }
	  }

	}


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var transition = __webpack_require__(34)

	module.exports = function (value) {
	  var el = this.el
	  transition.apply(el, value ? 1 : -1, function () {
	    el.style.display = value ? '' : 'none'
	  }, this.vm)
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Append with transition.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.append = function (el, target, vm, cb) {
	  apply(el, 1, function () {
	    target.appendChild(el)
	  }, vm, cb)
	}

	/**
	 * InsertBefore with transition.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.before = function (el, target, vm, cb) {
	  apply(el, 1, function () {
	    _.before(el, target)
	  }, vm, cb)
	}

	/**
	 * Remove with transition.
	 *
	 * @oaram {Element} el
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.remove = function (el, vm, cb) {
	  apply(el, -1, function () {
	    _.remove(el)
	  }, vm, cb)
	}

	/**
	 * Remove by appending to another parent with transition.
	 * This is only used in block operations.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.removeThenAppend = function (el, target, vm, cb) {
	  apply(el, -1, function () {
	    target.appendChild(el)
	  }, vm, cb)
	}

	/**
	 * Append the childNodes of a fragment to target.
	 *
	 * @param {DocumentFragment} block
	 * @param {Node} target
	 * @param {Vue} vm
	 */

	exports.blockAppend = function (block, target, vm) {
	  var nodes = _.toArray(block.childNodes)
	  for (var i = 0, l = nodes.length; i < l; i++) {
	    exports.before(nodes[i], target, vm)
	  }
	}

	/**
	 * Remove a block of nodes between two edge nodes.
	 *
	 * @param {Node} start
	 * @param {Node} end
	 * @param {Vue} vm
	 */

	exports.blockRemove = function (start, end, vm) {
	  var node = start.nextSibling
	  var next
	  while (node !== end) {
	    next = node.nextSibling
	    exports.remove(node, vm)
	    node = next
	  }
	}

	/**
	 * Apply transitions with an operation callback.
	 *
	 * @oaram {Element} el
	 * @param {Number} direction
	 *                  1: enter
	 *                 -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	var apply = exports.apply = function (el, direction, op, vm, cb) {
	  var transition = el.__v_trans
	  if (
	    !transition ||
	    // skip if there are no js hooks and CSS transition is
	    // not supported
	    (!transition.hooks && !_.transitionEndEvent) ||
	    // skip transitions for initial compile
	    !vm._isCompiled ||
	    // if the vm is being manipulated by a parent directive
	    // during the parent's compilation phase, skip the
	    // animation.
	    (vm.$parent && !vm.$parent._isCompiled)
	  ) {
	    op()
	    if (cb) cb()
	    return
	  }
	  var action = direction > 0 ? 'enter' : 'leave'
	  transition[action](op, cb)
	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var addClass = _.addClass
	var removeClass = _.removeClass

	module.exports = {
	  
	  update: function (value) {
	    if (this.arg) {
	      // single toggle
	      var method = value ? addClass : removeClass
	      method(this.el, this.arg)
	    } else {
	      this.cleanup()
	      if (value && typeof value === 'string') {
	        // raw class text
	        addClass(this.el, value)
	        this.lastVal = value
	      } else if (_.isPlainObject(value)) {
	        // object toggle
	        for (var key in value) {
	          if (value[key]) {
	            addClass(this.el, key)
	          } else {
	            removeClass(this.el, key)
	          }
	        }
	        this.prevKeys = Object.keys(value)
	      }
	    }
	  },

	  cleanup: function (value) {
	    if (this.lastVal) {
	      removeClass(this.el, this.lastVal)
	    }
	    if (this.prevKeys) {
	      var i = this.prevKeys.length
	      while (i--) {
	        if (!value || !value[this.prevKeys[i]]) {
	          removeClass(this.el, this.prevKeys[i])
	        }
	      }
	    }
	  }
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    this.vm.$$[this.expression] = this.el
	  },

	  unbind: function () {
	    delete this.vm.$$[this.expression]
	  }
	  
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    var vm = this.el.__vue__
	    if (!vm) {
	      _.warn(
	        'v-ref should only be used on a component root element.'
	      )
	      return
	    }
	    // If we get here, it means this is a `v-ref` on a
	    // child, because parent scope `v-ref` is stripped in
	    // `v-component` already. So we just record our own ref
	    // here - it will overwrite parent ref in `v-component`,
	    // if any.
	    vm._refID = this.expression
	  }
	  
	}

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(3)

	module.exports = {

	  bind: function () {
	    var el = this.el
	    this.vm.$once('hook:compiled', function () {
	      el.removeAttribute(config.prefix + 'cloak')
	    })
	  }

	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Transition = __webpack_require__(40)

	module.exports = {

	  priority: 1000,
	  isLiteral: true,

	  bind: function () {
	    if (!this._isDynamicLiteral) {
	      this.update(this.expression)
	    }
	  },

	  update: function (id, oldId) {
	    var el = this.el
	    var vm = this.el.__vue__ || this.vm
	    var hooks = _.resolveAsset(vm.$options, 'transitions', id)
	    id = id || 'v'
	    el.__v_trans = new Transition(el, id, hooks, vm)
	    if (oldId) {
	      _.removeClass(el, oldId + '-transition')
	    }
	    _.addClass(el, id + '-transition')
	  }

	}

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var queue = __webpack_require__(41)
	var addClass = _.addClass
	var removeClass = _.removeClass
	var transitionEndEvent = _.transitionEndEvent
	var animationEndEvent = _.animationEndEvent
	var transDurationProp = _.transitionProp + 'Duration'
	var animDurationProp = _.animationProp + 'Duration'

	var TYPE_TRANSITION = 1
	var TYPE_ANIMATION = 2

	/**
	 * A Transition object that encapsulates the state and logic
	 * of the transition.
	 *
	 * @param {Element} el
	 * @param {String} id
	 * @param {Object} hooks
	 * @param {Vue} vm
	 */

	function Transition (el, id, hooks, vm) {
	  this.el = el
	  this.enterClass = id + '-enter'
	  this.leaveClass = id + '-leave'
	  this.hooks = hooks
	  this.vm = vm
	  // async state
	  this.pendingCssEvent =
	  this.pendingCssCb =
	  this.cancel =
	  this.pendingJsCb =
	  this.op =
	  this.cb = null
	  this.typeCache = {}
	  // bind
	  var self = this
	  ;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone']
	    .forEach(function (m) {
	      self[m] = _.bind(self[m], self)
	    })
	}

	var p = Transition.prototype

	/**
	 * Start an entering transition.
	 *
	 * 1. enter transition triggered
	 * 2. call beforeEnter hook
	 * 3. add enter class
	 * 4. insert/show element
	 * 5. call enter hook (with possible explicit js callback)
	 * 6. reflow
	 * 7. based on transition type:
	 *    - transition:
	 *        remove class now, wait for transitionend,
	 *        then done if there's no explicit js callback.
	 *    - animation:
	 *        wait for animationend, remove class,
	 *        then done if there's no explicit js callback.
	 *    - no css transition:
	 *        done now if there's no explicit js callback.
	 * 8. wait for either done or js callback, then call
	 *    afterEnter hook.
	 *
	 * @param {Function} op - insert/show the element
	 * @param {Function} [cb]
	 */

	p.enter = function (op, cb) {
	  this.cancelPending()
	  this.callHook('beforeEnter')
	  this.cb = cb
	  addClass(this.el, this.enterClass)
	  op()
	  this.callHookWithCb('enter')
	  this.cancel = this.hooks && this.hooks.enterCancelled
	  queue.push(this.enterNextTick)
	}

	/**
	 * The "nextTick" phase of an entering transition, which is
	 * to be pushed into a queue and executed after a reflow so
	 * that removing the class can trigger a CSS transition.
	 */

	p.enterNextTick = function () {
	  var type = this.getCssTransitionType(this.enterClass)
	  var enterDone = this.enterDone
	  if (type === TYPE_TRANSITION) {
	    // trigger transition by removing enter class now
	    removeClass(this.el, this.enterClass)
	    this.setupCssCb(transitionEndEvent, enterDone)
	  } else if (type === TYPE_ANIMATION) {
	    this.setupCssCb(animationEndEvent, enterDone)
	  } else if (!this.pendingJsCb) {
	    enterDone()
	  }
	}

	/**
	 * The "cleanup" phase of an entering transition.
	 */

	p.enterDone = function () {
	  this.cancel = this.pendingJsCb = null
	  removeClass(this.el, this.enterClass)
	  this.callHook('afterEnter')
	  if (this.cb) this.cb()
	}

	/**
	 * Start a leaving transition.
	 *
	 * 1. leave transition triggered.
	 * 2. call beforeLeave hook
	 * 3. add leave class (trigger css transition)
	 * 4. call leave hook (with possible explicit js callback)
	 * 5. reflow if no explicit js callback is provided
	 * 6. based on transition type:
	 *    - transition or animation:
	 *        wait for end event, remove class, then done if
	 *        there's no explicit js callback.
	 *    - no css transition: 
	 *        done if there's no explicit js callback.
	 * 7. wait for either done or js callback, then call
	 *    afterLeave hook.
	 *
	 * @param {Function} op - remove/hide the element
	 * @param {Function} [cb]
	 */

	p.leave = function (op, cb) {
	  this.cancelPending()
	  this.callHook('beforeLeave')
	  this.op = op
	  this.cb = cb
	  addClass(this.el, this.leaveClass)
	  this.callHookWithCb('leave')
	  this.cancel = this.hooks && this.hooks.enterCancelled
	  // only need to do leaveNextTick if there's no explicit
	  // js callback
	  if (!this.pendingJsCb) {
	    queue.push(this.leaveNextTick)
	  }
	}

	/**
	 * The "nextTick" phase of a leaving transition.
	 */

	p.leaveNextTick = function () {
	  var type = this.getCssTransitionType(this.leaveClass)
	  if (type) {
	    var event = type === TYPE_TRANSITION
	      ? transitionEndEvent
	      : animationEndEvent
	    this.setupCssCb(event, this.leaveDone)
	  } else {
	    this.leaveDone()
	  }
	}

	/**
	 * The "cleanup" phase of a leaving transition.
	 */

	p.leaveDone = function () {
	  this.cancel = this.pendingJsCb = null
	  this.op()
	  removeClass(this.el, this.leaveClass)
	  this.callHook('afterLeave')
	  if (this.cb) this.cb()
	}

	/**
	 * Cancel any pending callbacks from a previously running
	 * but not finished transition.
	 */

	p.cancelPending = function () {
	  this.op = this.cb = null
	  var hasPending = false
	  if (this.pendingCssCb) {
	    hasPending = true
	    _.off(this.el, this.pendingCssEvent, this.pendingCssCb)
	    this.pendingCssEvent = this.pendingCssCb = null
	  }
	  if (this.pendingJsCb) {
	    hasPending = true
	    this.pendingJsCb.cancel()
	    this.pendingJsCb = null
	  }
	  if (hasPending) {
	    removeClass(this.el, this.enterClass)
	    removeClass(this.el, this.leaveClass)
	  }
	  if (this.cancel) {
	    this.cancel.call(this.vm, this.el)
	    this.cancel = null
	  }
	}

	/**
	 * Call a user-provided synchronous hook function.
	 *
	 * @param {String} type
	 */

	p.callHook = function (type) {
	  if (this.hooks && this.hooks[type]) {
	    this.hooks[type].call(this.vm, this.el)
	  }
	}

	/**
	 * Call a user-provided, potentially-async hook function.
	 * We check for the length of arguments to see if the hook
	 * expects a `done` callback. If true, the transition's end
	 * will be determined by when the user calls that callback;
	 * otherwise, the end is determined by the CSS transition or
	 * animation.
	 *
	 * @param {String} type
	 */

	p.callHookWithCb = function (type) {
	  var hook = this.hooks && this.hooks[type]
	  if (hook) {
	    if (hook.length > 1) {
	      this.pendingJsCb = _.cancellable(this[type + 'Done'])
	    }
	    hook.call(this.vm, this.el, this.pendingJsCb)
	  }
	}

	/**
	 * Get an element's transition type based on the
	 * calculated styles.
	 *
	 * @param {String} className
	 * @return {Number}
	 */

	p.getCssTransitionType = function (className) {
	  /* istanbul ignore if */
	  if (
	    !transitionEndEvent ||
	    // skip CSS transitions if page is not visible -
	    // this solves the issue of transitionend events not
	    // firing until the page is visible again.
	    // pageVisibility API is supported in IE10+, same as
	    // CSS transitions.
	    document.hidden ||
	    // explicit js-only transition
	    (this.hooks && this.hooks.css === false)
	  ) {
	    return
	  }
	  var type = this.typeCache[className]
	  if (type) return type
	  var inlineStyles = this.el.style
	  var computedStyles = window.getComputedStyle(this.el)
	  var transDuration =
	    inlineStyles[transDurationProp] ||
	    computedStyles[transDurationProp]
	  if (transDuration && transDuration !== '0s') {
	    type = TYPE_TRANSITION
	  } else {
	    var animDuration =
	      inlineStyles[animDurationProp] ||
	      computedStyles[animDurationProp]
	    if (animDuration && animDuration !== '0s') {
	      type = TYPE_ANIMATION
	    }
	  }
	  if (type) {
	    this.typeCache[className] = type
	  }
	  return type
	}

	/**
	 * Setup a CSS transitionend/animationend callback.
	 *
	 * @param {String} event
	 * @param {Function} cb
	 */

	p.setupCssCb = function (event, cb) {
	  this.pendingCssEvent = event
	  var self = this
	  var el = this.el
	  var onEnd = this.pendingCssCb = function (e) {
	    if (e.target === el) {
	      _.off(el, event, onEnd)
	      self.pendingCssEvent = self.pendingCssCb = null
	      if (!self.pendingJsCb && cb) {
	        cb()
	      }
	    }
	  }
	  _.on(el, event, onEnd)
	}

	module.exports = Transition

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var queue = []
	var queued = false

	/**
	 * Push a job into the queue.
	 *
	 * @param {Function} job
	 */

	exports.push = function (job) {
	  queue.push(job)
	  if (!queued) {
	    queued = true
	    _.nextTick(flush)
	  }
	}

	/**
	 * Flush the queue, and do one forced reflow before
	 * triggering transitions.
	 */

	function flush () {
	  // Force layout
	  var f = document.documentElement.offsetHeight
	  for (var i = 0; i < queue.length; i++) {
	    queue[i]()
	  }
	  queue = []
	  queued = false
	  // dummy return, so js linters don't complain about
	  // unused variable f
	  return f
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  acceptStatement: true,
	  priority: 700,

	  bind: function () {
	    // deal with iframes
	    if (
	      this.el.tagName === 'IFRAME' &&
	      this.arg !== 'load'
	    ) {
	      var self = this
	      this.iframeBind = function () {
	        _.on(self.el.contentWindow, self.arg, self.handler)
	      }
	      _.on(this.el, 'load', this.iframeBind)
	    }
	  },

	  update: function (handler) {
	    if (typeof handler !== 'function') {
	      _.warn(
	        'Directive "v-on:' + this.expression + '" ' +
	        'expects a function value.'
	      )
	      return
	    }
	    this.reset()
	    var vm = this.vm
	    this.handler = function (e) {
	      e.targetVM = vm
	      vm.$event = e
	      var res = handler(e)
	      vm.$event = null
	      return res
	    }
	    if (this.iframeBind) {
	      this.iframeBind()
	    } else {
	      _.on(this.el, this.arg, this.handler)
	    }
	  },

	  reset: function () {
	    var el = this.iframeBind
	      ? this.el.contentWindow
	      : this.el
	    if (this.handler) {
	      _.off(el, this.arg, this.handler)
	    }
	  },

	  unbind: function () {
	    this.reset()
	    _.off(this.el, 'load', this.iframeBind)
	  }
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	var handlers = {
	  text: __webpack_require__(44),
	  radio: __webpack_require__(45),
	  select: __webpack_require__(46),
	  checkbox: __webpack_require__(47)
	}

	module.exports = {

	  priority: 800,
	  twoWay: true,
	  handlers: handlers,

	  /**
	   * Possible elements:
	   *   <select>
	   *   <textarea>
	   *   <input type="*">
	   *     - text
	   *     - checkbox
	   *     - radio
	   *     - number
	   *     - TODO: more types may be supplied as a plugin
	   */

	  bind: function () {
	    // friendly warning...
	    this.checkFilters()
	    if (this.hasRead && !this.hasWrite) {
	      _.warn(
	        'It seems you are using a read-only filter with ' +
	        'v-model. You might want to use a two-way filter ' +
	        'to ensure correct behavior.'
	      )
	    }
	    var el = this.el
	    var tag = el.tagName
	    var handler
	    if (tag === 'INPUT') {
	      handler = handlers[el.type] || handlers.text
	    } else if (tag === 'SELECT') {
	      handler = handlers.select
	    } else if (tag === 'TEXTAREA') {
	      handler = handlers.text
	    } else {
	      _.warn('v-model does not support element type: ' + tag)
	      return
	    }
	    handler.bind.call(this)
	    this.update = handler.update
	    this.unbind = handler.unbind
	  },

	  /**
	   * Check read/write filter stats.
	   */

	  checkFilters: function () {
	    var filters = this.filters
	    if (!filters) return
	    var i = filters.length
	    while (i--) {
	      var filter = _.resolveAsset(this.vm.$options, 'filters', filters[i].name)
	      if (typeof filter === 'function' || filter.read) {
	        this.hasRead = true
	      }
	      if (filter.write) {
	        this.hasWrite = true
	      }
	    }
	  }

	}

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el

	    // check params
	    // - lazy: update model on "change" instead of "input"
	    var lazy = this._checkParam('lazy') != null
	    // - number: cast value into number when updating model.
	    var number = this._checkParam('number') != null
	    // - debounce: debounce the input listener
	    var debounce = parseInt(this._checkParam('debounce'), 10)

	    // handle composition events.
	    //   http://blog.evanyou.me/2014/01/03/composition-event/
	    // skip this for Android because it handles composition
	    // events quite differently. Android doesn't trigger
	    // composition events for language input methods e.g.
	    // Chinese, but instead triggers them for spelling
	    // suggestions... (see Discussion/#162)
	    var composing = false
	    if (!_.isAndroid) {
	      this.onComposeStart = function () {
	        composing = true
	      }
	      this.onComposeEnd = function () {
	        composing = false
	        // in IE11 the "compositionend" event fires AFTER
	        // the "input" event, so the input handler is blocked
	        // at the end... have to call it here.
	        self.listener()
	      }
	      _.on(el,'compositionstart', this.onComposeStart)
	      _.on(el,'compositionend', this.onComposeEnd)
	    }

	    function syncToModel () {
	      var val = number
	        ? _.toNumber(el.value)
	        : el.value
	      self.set(val)
	    }

	    // if the directive has filters, we need to
	    // record cursor position and restore it after updating
	    // the input with the filtered value.
	    // also force update for type="range" inputs to enable
	    // "lock in range" (see #506)
	    if (this.hasRead || el.type === 'range') {
	      this.listener = function () {
	        if (composing) return
	        var charsOffset
	        // some HTML5 input types throw error here
	        try {
	          // record how many chars from the end of input
	          // the cursor was at
	          charsOffset = el.value.length - el.selectionStart
	        } catch (e) {}
	        // Fix IE10/11 infinite update cycle
	        // https://github.com/yyx990803/vue/issues/592
	        /* istanbul ignore if */
	        if (charsOffset < 0) {
	          return
	        }
	        syncToModel()
	        _.nextTick(function () {
	          // force a value update, because in
	          // certain cases the write filters output the
	          // same result for different input values, and
	          // the Observer set events won't be triggered.
	          var newVal = self._watcher.value
	          self.update(newVal)
	          if (charsOffset != null) {
	            var cursorPos =
	              _.toString(newVal).length - charsOffset
	            el.setSelectionRange(cursorPos, cursorPos)
	          }
	        })
	      }
	    } else {
	      this.listener = function () {
	        if (composing) return
	        syncToModel()
	      }
	    }

	    if (debounce) {
	      this.listener = _.debounce(this.listener, debounce)
	    }

	    // Now attach the main listener

	    this.event = lazy ? 'change' : 'input'
	    // Support jQuery events, since jQuery.trigger() doesn't
	    // trigger native events in some cases and some plugins
	    // rely on $.trigger()
	    // 
	    // We want to make sure if a listener is attached using
	    // jQuery, it is also removed with jQuery, that's why
	    // we do the check for each directive instance and
	    // store that check result on itself. This also allows
	    // easier test coverage control by unsetting the global
	    // jQuery variable in tests.
	    this.hasjQuery = typeof jQuery === 'function'
	    if (this.hasjQuery) {
	      jQuery(el).on(this.event, this.listener)
	    } else {
	      _.on(el, this.event, this.listener)
	    }

	    // IE9 doesn't fire input event on backspace/del/cut
	    if (!lazy && _.isIE9) {
	      this.onCut = function () {
	        _.nextTick(self.listener)
	      }
	      this.onDel = function (e) {
	        if (e.keyCode === 46 || e.keyCode === 8) {
	          self.listener()
	        }
	      }
	      _.on(el, 'cut', this.onCut)
	      _.on(el, 'keyup', this.onDel)
	    }

	    // set initial value if present
	    if (
	      el.hasAttribute('value') ||
	      (el.tagName === 'TEXTAREA' && el.value.trim())
	    ) {
	      this._initValue = number
	        ? _.toNumber(el.value)
	        : el.value
	    }
	  },

	  update: function (value) {
	    this.el.value = _.toString(value)
	  },

	  unbind: function () {
	    var el = this.el
	    if (this.hasjQuery) {
	      jQuery(el).off(this.event, this.listener)
	    } else {
	      _.off(el, this.event, this.listener)
	    }
	    if (this.onComposeStart) {
	      _.off(el, 'compositionstart', this.onComposeStart)
	      _.off(el, 'compositionend', this.onComposeEnd)
	    }
	    if (this.onCut) {
	      _.off(el,'cut', this.onCut)
	      _.off(el,'keyup', this.onDel)
	    }
	  }
	}

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    this.listener = function () {
	      self.set(el.value)
	    }
	    _.on(el, 'change', this.listener)
	    if (el.checked) {
	      this._initValue = el.value
	    }
	  },

	  update: function (value) {
	    /* jshint eqeqeq: false */
	    this.el.checked = value == this.el.value
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	  }

	}

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Watcher = __webpack_require__(17)
	var dirParser = __webpack_require__(15)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    // check options param
	    var optionsParam = this._checkParam('options')
	    if (optionsParam) {
	      initOptions.call(this, optionsParam)
	    }
	    this.number = this._checkParam('number') != null
	    this.multiple = el.hasAttribute('multiple')
	    this.listener = function () {
	      var value = self.multiple
	        ? getMultiValue(el)
	        : el.value
	      value = self.number
	        ? _.isArray(value)
	          ? value.map(_.toNumber)
	          : _.toNumber(value)
	        : value
	      self.set(value)
	    }
	    _.on(el, 'change', this.listener)
	    checkInitialValue.call(this)
	  },

	  update: function (value) {
	    /* jshint eqeqeq: false */
	    var el = this.el
	    el.selectedIndex = -1
	    var multi = this.multiple && _.isArray(value)
	    var options = el.options
	    var i = options.length
	    var option
	    while (i--) {
	      option = options[i]
	      option.selected = multi
	        ? indexOf(value, option.value) > -1
	        : value == option.value
	    }
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	    if (this.optionWatcher) {
	      this.optionWatcher.teardown()
	    }
	  }

	}

	/**
	 * Initialize the option list from the param.
	 *
	 * @param {String} expression
	 */

	function initOptions (expression) {
	  var self = this
	  var descriptor = dirParser.parse(expression)[0]
	  function optionUpdateWatcher (value) {
	    if (_.isArray(value)) {
	      self.el.innerHTML = ''
	      buildOptions(self.el, value)
	      if (self._watcher) {
	        self.update(self._watcher.value)
	      }
	    } else {
	      _.warn('Invalid options value for v-model: ' + value)
	    }
	  }
	  this.optionWatcher = new Watcher(
	    this.vm,
	    descriptor.expression,
	    optionUpdateWatcher,
	    {
	      deep: true,
	      filters: descriptor.filters
	    }
	  )
	  // update with initial value
	  optionUpdateWatcher(this.optionWatcher.value)
	}

	/**
	 * Build up option elements. IE9 doesn't create options
	 * when setting innerHTML on <select> elements, so we have
	 * to use DOM API here.
	 *
	 * @param {Element} parent - a <select> or an <optgroup>
	 * @param {Array} options
	 */

	function buildOptions (parent, options) {
	  var op, el
	  for (var i = 0, l = options.length; i < l; i++) {
	    op = options[i]
	    if (!op.options) {
	      el = document.createElement('option')
	      if (typeof op === 'string') {
	        el.text = el.value = op
	      } else {
	        /* jshint eqeqeq: false */
	        if (op.value != null) {
	          el.value = op.value
	        }
	        el.text = op.text || op.value || ''
	        if (op.disabled) {
	          el.disabled = true
	        }
	      }
	    } else {
	      el = document.createElement('optgroup')
	      el.label = op.label
	      buildOptions(el, op.options)
	    }
	    parent.appendChild(el)
	  }
	}

	/**
	 * Check the initial value for selected options.
	 */

	function checkInitialValue () {
	  var initValue
	  var options = this.el.options
	  for (var i = 0, l = options.length; i < l; i++) {
	    if (options[i].hasAttribute('selected')) {
	      if (this.multiple) {
	        (initValue || (initValue = []))
	          .push(options[i].value)
	      } else {
	        initValue = options[i].value
	      }
	    }
	  }
	  if (typeof initValue !== 'undefined') {
	    this._initValue = this.number
	      ? _.toNumber(initValue)
	      : initValue
	  }
	}

	/**
	 * Helper to extract a value array for select[multiple]
	 *
	 * @param {SelectElement} el
	 * @return {Array}
	 */

	function getMultiValue (el) {
	  return Array.prototype.filter
	    .call(el.options, filterSelected)
	    .map(getOptionValue)
	}

	function filterSelected (op) {
	  return op.selected
	}

	function getOptionValue (op) {
	  return op.value || op.text
	}

	/**
	 * Native Array.indexOf uses strict equal, but in this
	 * case we need to match string/numbers with soft equal.
	 *
	 * @param {Array} arr
	 * @param {*} val
	 */

	function indexOf (arr, val) {
	  /* jshint eqeqeq: false */
	  var i = arr.length
	  while (i--) {
	    if (arr[i] == val) return i
	  }
	  return -1
	}

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    this.listener = function () {
	      self.set(el.checked)
	    }
	    _.on(el, 'change', this.listener)
	    if (el.checked) {
	      this._initValue = el.checked
	    }
	  },

	  update: function (value) {
	    this.el.checked = !!value
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	  }

	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var isObject = _.isObject
	var isPlainObject = _.isPlainObject
	var textParser = __webpack_require__(14)
	var expParser = __webpack_require__(22)
	var templateParser = __webpack_require__(12)
	var compiler = __webpack_require__(10)
	var uid = 0

	// async component resolution states
	var UNRESOLVED = 0
	var PENDING = 1
	var RESOLVED = 2
	var ABORTED = 3

	module.exports = {

	  /**
	   * Setup.
	   */

	  bind: function () {
	    // uid as a cache identifier
	    this.id = '__v_repeat_' + (++uid)
	    // setup anchor nodes
	    this.start = _.createAnchor('v-repeat-start')
	    this.end = _.createAnchor('v-repeat-end')
	    _.replace(this.el, this.end)
	    _.before(this.start, this.end)
	    // check if this is a block repeat
	    this.template = _.isTemplate(this.el)
	      ? templateParser.parse(this.el, true)
	      : this.el
	    // check other directives that need to be handled
	    // at v-repeat level
	    this.checkIf()
	    this.checkRef()
	    this.checkComponent()
	    // check for trackby param
	    this.idKey =
	      this._checkParam('track-by') ||
	      this._checkParam('trackby') // 0.11.0 compat
	    // check for transition stagger
	    var stagger = +this._checkParam('stagger')
	    this.enterStagger = +this._checkParam('enter-stagger') || stagger
	    this.leaveStagger = +this._checkParam('leave-stagger') || stagger
	    this.cache = Object.create(null)
	  },

	  /**
	   * Warn against v-if usage.
	   */

	  checkIf: function () {
	    if (_.attr(this.el, 'if') !== null) {
	      _.warn(
	        'Don\'t use v-if with v-repeat. ' +
	        'Use v-show or the "filterBy" filter instead.'
	      )
	    }
	  },

	  /**
	   * Check if v-ref/ v-el is also present.
	   */

	  checkRef: function () {
	    var refID = _.attr(this.el, 'ref')
	    this.refID = refID
	      ? this.vm.$interpolate(refID)
	      : null
	    var elId = _.attr(this.el, 'el')
	    this.elId = elId
	      ? this.vm.$interpolate(elId)
	      : null
	  },

	  /**
	   * Check the component constructor to use for repeated
	   * instances. If static we resolve it now, otherwise it
	   * needs to be resolved at build time with actual data.
	   */

	  checkComponent: function () {
	    this.componentState = UNRESOLVED
	    var options = this.vm.$options
	    var id = _.checkComponent(this.el, options)
	    if (!id) {
	      // default constructor
	      this.Ctor = _.Vue
	      // inline repeats should inherit
	      this.inherit = true
	      // important: transclude with no options, just
	      // to ensure block start and block end
	      this.template = compiler.transclude(this.template)
	      var copy = _.extend({}, options)
	      copy._asComponent = false
	      this._linkFn = compiler.compile(this.template, copy)
	    } else {
	      this.Ctor = null
	      this.asComponent = true
	      // check inline-template
	      if (this._checkParam('inline-template') !== null) {
	        // extract inline template as a DocumentFragment
	        this.inlineTemplate = _.extractContent(this.el, true)
	      }
	      var tokens = textParser.parse(id)
	      if (tokens) {
	        // dynamic component to be resolved later
	        var ctorExp = textParser.tokensToExp(tokens)
	        this.ctorGetter = expParser.parse(ctorExp).get
	      } else {
	        // static
	        this.componentId = id
	        this.pendingData = null
	      }
	    }
	  },

	  resolveComponent: function () {
	    this.componentState = PENDING
	    this.vm._resolveComponent(this.componentId, _.bind(function (Ctor) {
	      if (this.componentState === ABORTED) {
	        return
	      }
	      this.Ctor = Ctor
	      this.componentState = RESOLVED
	      this.realUpdate(this.pendingData)
	      this.pendingData = null
	    }, this))
	  },

	    /**
	   * Resolve a dynamic component to use for an instance.
	   * The tricky part here is that there could be dynamic
	   * components depending on instance data.
	   *
	   * @param {Object} data
	   * @param {Object} meta
	   * @return {Function}
	   */

	  resolveDynamicComponent: function (data, meta) {
	    // create a temporary context object and copy data
	    // and meta properties onto it.
	    // use _.define to avoid accidentally overwriting scope
	    // properties.
	    var context = Object.create(this.vm)
	    var key
	    for (key in data) {
	      _.define(context, key, data[key])
	    }
	    for (key in meta) {
	      _.define(context, key, meta[key])
	    }
	    var id = this.ctorGetter.call(context, context)
	    var Ctor = _.resolveAsset(this.vm.$options, 'components', id)
	    _.assertAsset(Ctor, 'component', id)
	    if (!Ctor.options) {
	      _.warn(
	        'Async resolution is not supported for v-repeat ' +
	        '+ dynamic component. (component: ' + id + ')'
	      )
	      return _.Vue
	    }
	    return Ctor
	  },

	  /**
	   * Update.
	   * This is called whenever the Array mutates. If we have
	   * a component, we might need to wait for it to resolve
	   * asynchronously.
	   *
	   * @param {Array|Number|String} data
	   */

	  update: function (data) {
	    if (this.componentId) {
	      var state = this.componentState
	      if (state === UNRESOLVED) {
	        this.pendingData = data
	        // once resolved, it will call realUpdate
	        this.resolveComponent()
	      } else if (state === PENDING) {
	        this.pendingData = data
	      } else if (state === RESOLVED) {
	        this.realUpdate(data)
	      }
	    } else {
	      this.realUpdate(data)
	    }
	  },

	  /**
	   * The real update that actually modifies the DOM.
	   *
	   * @param {Array|Number|String} data
	   */

	  realUpdate: function (data) {
	    this.vms = this.diff(data, this.vms)
	    // update v-ref
	    if (this.refID) {
	      this.vm.$[this.refID] = this.converted
	        ? toRefObject(this.vms)
	        : this.vms
	    }
	    if (this.elId) {
	      this.vm.$$[this.elId] = this.vms.map(function (vm) {
	        return vm.$el
	      })
	    }
	  },

	  /**
	   * Diff, based on new data and old data, determine the
	   * minimum amount of DOM manipulations needed to make the
	   * DOM reflect the new data Array.
	   *
	   * The algorithm diffs the new data Array by storing a
	   * hidden reference to an owner vm instance on previously
	   * seen data. This allows us to achieve O(n) which is
	   * better than a levenshtein distance based algorithm,
	   * which is O(m * n).
	   *
	   * @param {Array} data
	   * @param {Array} oldVms
	   * @return {Array}
	   */

	  diff: function (data, oldVms) {
	    var idKey = this.idKey
	    var converted = this.converted
	    var start = this.start
	    var end = this.end
	    var inDoc = _.inDoc(start)
	    var alias = this.arg
	    var init = !oldVms
	    var vms = new Array(data.length)
	    var obj, raw, vm, i, l, primitive
	    // First pass, go through the new Array and fill up
	    // the new vms array. If a piece of data has a cached
	    // instance for it, we reuse it. Otherwise build a new
	    // instance.
	    for (i = 0, l = data.length; i < l; i++) {
	      obj = data[i]
	      raw = converted ? obj.$value : obj
	      primitive = !isObject(raw)
	      vm = !init && this.getVm(raw, i, converted ? obj.$key : null)
	      if (vm) { // reusable instance
	        vm._reused = true
	        vm.$index = i // update $index
	        // update data for track-by or object repeat,
	        // since in these two cases the data is replaced
	        // rather than mutated.
	        if (idKey || converted || primitive) {
	          if (alias) {
	            vm[alias] = raw
	          } else if (_.isPlainObject(raw)) {
	            vm.$data = raw
	          } else {
	            vm.$value = raw
	          }
	        }
	      } else { // new instance
	        vm = this.build(obj, i, true)
	        vm._reused = false
	      }
	      vms[i] = vm
	      // insert if this is first run
	      if (init) {
	        vm.$before(end)
	      }
	    }
	    // if this is the first run, we're done.
	    if (init) {
	      return vms
	    }
	    // Second pass, go through the old vm instances and
	    // destroy those who are not reused (and remove them
	    // from cache)
	    var removalIndex = 0
	    var totalRemoved = oldVms.length - vms.length
	    for (i = 0, l = oldVms.length; i < l; i++) {
	      vm = oldVms[i]
	      if (!vm._reused) {
	        this.uncacheVm(vm)
	        vm.$destroy(false, true) // defer cleanup until removal
	        this.remove(vm, removalIndex++, totalRemoved, inDoc)
	      }
	    }
	    // final pass, move/insert new instances into the
	    // right place.
	    var targetPrev, prevEl, currentPrev
	    var insertionIndex = 0
	    for (i = 0, l = vms.length; i < l; i++) {
	      vm = vms[i]
	      // this is the vm that we should be after
	      targetPrev = vms[i - 1]
	      prevEl = targetPrev
	        ? targetPrev._staggerCb
	          ? targetPrev._staggerAnchor
	          : targetPrev._blockEnd || targetPrev.$el
	        : start
	      if (vm._reused && !vm._staggerCb) {
	        currentPrev = findPrevVm(vm, start, this.id)
	        if (currentPrev !== targetPrev) {
	          this.move(vm, prevEl)
	        }
	      } else {
	        // new instance, or still in stagger.
	        // insert with updated stagger index.
	        this.insert(vm, insertionIndex++, prevEl, inDoc)
	      }
	      vm._reused = false
	    }
	    return vms
	  },

	  /**
	   * Build a new instance and cache it.
	   *
	   * @param {Object} data
	   * @param {Number} index
	   * @param {Boolean} needCache
	   */

	  build: function (data, index, needCache) {
	    var meta = { $index: index }
	    if (this.converted) {
	      meta.$key = data.$key
	    }
	    var raw = this.converted ? data.$value : data
	    var alias = this.arg
	    if (alias) {
	      data = {}
	      data[alias] = raw
	    } else if (!isPlainObject(raw)) {
	      // non-object values
	      data = {}
	      meta.$value = raw
	    } else {
	      // default
	      data = raw
	    }
	    // resolve constructor
	    var Ctor = this.Ctor || this.resolveDynamicComponent(data, meta)
	    var vm = this.vm.$addChild({
	      el: templateParser.clone(this.template),
	      data: data,
	      inherit: this.inherit,
	      template: this.inlineTemplate,
	      // repeater meta, e.g. $index, $key
	      _meta: meta,
	      // mark this as an inline-repeat instance
	      _repeat: this.inherit,
	      // is this a component?
	      _asComponent: this.asComponent,
	      // linker cachable if no inline-template
	      _linkerCachable: !this.inlineTemplate,
	      // transclusion host
	      _host: this._host,
	      // pre-compiled linker for simple repeats
	      _linkFn: this._linkFn,
	      // identifier, shows that this vm belongs to this collection
	      _repeatId: this.id
	    }, Ctor)
	    // cache instance
	    if (needCache) {
	      this.cacheVm(raw, vm, index, this.converted ? meta.$key : null)
	    }
	    // sync back changes for two-way bindings of primitive values
	    var type = typeof raw
	    var dir = this
	    if (
	      this.rawType === 'object' &&
	      (type === 'string' || type === 'number')
	    ) {
	      vm.$watch(alias || '$value', function (val) {
	        if (dir.filters) {
	          _.warn(
	            'You seem to be mutating the $value reference of ' +
	            'a v-repeat instance (likely through v-model) ' +
	            'and filtering the v-repeat at the same time. ' +
	            'This will not work properly with an Array of ' +
	            'primitive values. Please use an Array of ' +
	            'Objects instead.'
	          )
	        }
	        dir._withLock(function () {
	          if (dir.converted) {
	            dir.rawValue[vm.$key] = val
	          } else {
	            dir.rawValue.$set(vm.$index, val)
	          }
	        })
	      })
	    }
	    return vm
	  },

	  /**
	   * Unbind, teardown everything
	   */

	  unbind: function () {
	    this.componentState = ABORTED
	    if (this.refID) {
	      this.vm.$[this.refID] = null
	    }
	    if (this.vms) {
	      var i = this.vms.length
	      var vm
	      while (i--) {
	        vm = this.vms[i]
	        this.uncacheVm(vm)
	        vm.$destroy()
	      }
	    }
	  },

	  /**
	   * Cache a vm instance based on its data.
	   *
	   * If the data is an object, we save the vm's reference on
	   * the data object as a hidden property. Otherwise we
	   * cache them in an object and for each primitive value
	   * there is an array in case there are duplicates.
	   *
	   * @param {Object} data
	   * @param {Vue} vm
	   * @param {Number} index
	   * @param {String} [key]
	   */

	  cacheVm: function (data, vm, index, key) {
	    var idKey = this.idKey
	    var cache = this.cache
	    var primitive = !isObject(data)
	    var id
	    if (key || idKey || primitive) {
	      id = idKey
	        ? idKey === '$index'
	          ? index
	          : data[idKey]
	        : (key || index)
	      if (!cache[id]) {
	        cache[id] = vm
	      } else if (!primitive && idKey !== '$index') {
	        _.warn('Duplicate track-by key in v-repeat: ' + id)
	      }
	    } else {
	      id = this.id
	      if (data.hasOwnProperty(id)) {
	        if (data[id] === null) {
	          data[id] = vm
	        } else {
	          _.warn(
	            'Duplicate objects are not supported in v-repeat ' +
	            'when using components or transitions.'
	          )
	        }
	      } else {
	        _.define(data, id, vm)
	      }
	    }
	    vm._raw = data
	  },

	  /**
	   * Try to get a cached instance from a piece of data.
	   *
	   * @param {Object} data
	   * @param {Number} index
	   * @param {String} [key]
	   * @return {Vue|undefined}
	   */

	  getVm: function (data, index, key) {
	    var idKey = this.idKey
	    var primitive = !isObject(data)
	    if (key || idKey || primitive) {
	      var id = idKey
	        ? idKey === '$index'
	          ? index
	          : data[idKey]
	        : (key || index)
	      return this.cache[id]
	    } else {
	      return data[this.id]
	    }
	  },

	  /**
	   * Delete a cached vm instance.
	   *
	   * @param {Vue} vm
	   */

	  uncacheVm: function (vm) {
	    var data = vm._raw
	    var idKey = this.idKey
	    var index = vm.$index
	    var key = vm.$key
	    var primitive = !isObject(data)
	    if (idKey || key || primitive) {
	      var id = idKey
	        ? idKey === '$index'
	          ? index
	          : data[idKey]
	        : (key || index)
	      this.cache[id] = null
	    } else {
	      data[this.id] = null
	      vm._raw = null
	    }
	  },

	  /**
	   * Pre-process the value before piping it through the
	   * filters, and convert non-Array objects to arrays.
	   *
	   * This function will be bound to this directive instance
	   * and passed into the watcher.
	   *
	   * @param {*} value
	   * @return {Array}
	   * @private
	   */

	  _preProcess: function (value) {
	    // regardless of type, store the un-filtered raw value.
	    this.rawValue = value
	    var type = this.rawType = typeof value
	    if (!isPlainObject(value)) {
	      this.converted = false
	      if (type === 'number') {
	        value = range(value)
	      } else if (type === 'string') {
	        value = _.toArray(value)
	      }
	      return value || []
	    } else {
	      // convert plain object to array.
	      var keys = Object.keys(value)
	      var i = keys.length
	      var res = new Array(i)
	      var key
	      while (i--) {
	        key = keys[i]
	        res[i] = {
	          $key: key,
	          $value: value[key]
	        }
	      }
	      this.converted = true
	      return res
	    }
	  },

	  /**
	   * Insert an instance.
	   *
	   * @param {Vue} vm
	   * @param {Number} index
	   * @param {Node} prevEl
	   * @param {Boolean} inDoc
	   */

	  insert: function (vm, index, prevEl, inDoc) {
	    if (vm._staggerCb) {
	      vm._staggerCb.cancel()
	      vm._staggerCb = null
	    }
	    var staggerAmount = this.getStagger(vm, index, null, 'enter')
	    if (inDoc && staggerAmount) {
	      // create an anchor and insert it synchronously,
	      // so that we can resolve the correct order without
	      // worrying about some elements not inserted yet
	      var anchor = vm._staggerAnchor
	      if (!anchor) {
	        anchor = vm._staggerAnchor = _.createAnchor('stagger-anchor')
	        anchor.__vue__ = vm
	      }
	      _.after(anchor, prevEl)
	      var op = vm._staggerCb = _.cancellable(function () {
	        vm._staggerCb = null
	        vm.$before(anchor)
	        _.remove(anchor)
	      })
	      setTimeout(op, staggerAmount)
	    } else {
	      vm.$after(prevEl)
	    }
	  },

	  /**
	   * Move an already inserted instance.
	   *
	   * @param {Vue} vm
	   * @param {Node} prevEl
	   */

	  move: function (vm, prevEl) {
	    vm.$after(prevEl, null, false)
	  },

	  /**
	   * Remove an instance.
	   *
	   * @param {Vue} vm
	   * @param {Number} index
	   * @param {Boolean} inDoc
	   */

	  remove: function (vm, index, total, inDoc) {
	    if (vm._staggerCb) {
	      vm._staggerCb.cancel()
	      vm._staggerCb = null
	      // it's not possible for the same vm to be removed
	      // twice, so if we have a pending stagger callback,
	      // it means this vm is queued for enter but removed
	      // before its transition started. Since it is already
	      // destroyed, we can just leave it in detached state.
	      return
	    }
	    var staggerAmount = this.getStagger(vm, index, total, 'leave')
	    if (inDoc && staggerAmount) {
	      var op = vm._staggerCb = _.cancellable(function () {
	        vm._staggerCb = null
	        remove()
	      })
	      setTimeout(op, staggerAmount)
	    } else {
	      remove()
	    }
	    function remove () {
	      vm.$remove(function () {
	        vm._cleanup()
	      })
	    }
	  },

	  /**
	   * Get the stagger amount for an insertion/removal.
	   *
	   * @param {Vue} vm
	   * @param {Number} index
	   * @param {String} type
	   * @param {Number} total
	   */

	  getStagger: function (vm, index, total, type) {
	    type = type + 'Stagger'
	    var transition = vm.$el.__v_trans
	    var hooks = transition && transition.hooks
	    var hook = hooks && (hooks[type] || hooks.stagger)
	    return hook
	      ? hook.call(vm, index, total)
	      : index * this[type]
	  }

	}

	/**
	 * Helper to find the previous element that is an instance
	 * root node. This is necessary because a destroyed vm's
	 * element could still be lingering in the DOM before its
	 * leaving transition finishes, but its __vue__ reference
	 * should have been removed so we can skip them.
	 *
	 * If this is a block repeat, we want to make sure we only
	 * return vm that is bound to this v-repeat. (see #929)
	 *
	 * @param {Vue} vm
	 * @param {Comment|Text} anchor
	 * @return {Vue}
	 */

	function findPrevVm (vm, anchor, id) {
	  var el = vm.$el.previousSibling
	  while (
	    (!el.__vue__ || el.__vue__.$options._repeatId !== id) &&
	    el !== anchor
	  ) {
	    el = el.previousSibling
	  }
	  return el.__vue__
	}

	/**
	 * Create a range array from given number.
	 *
	 * @param {Number} n
	 * @return {Array}
	 */

	function range (n) {
	  var i = -1
	  var ret = new Array(n)
	  while (++i < n) {
	    ret[i] = i
	  }
	  return ret
	}

	/**
	 * Convert a vms array to an object ref for v-ref on an
	 * Object value.
	 *
	 * @param {Array} vms
	 * @return {Object}
	 */

	function toRefObject (vms) {
	  var ref = {}
	  for (var i = 0, l = vms.length; i < l; i++) {
	    ref[vms[i].$key] = vms[i]
	  }
	  return ref
	}


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var compiler = __webpack_require__(10)
	var templateParser = __webpack_require__(12)
	var transition = __webpack_require__(34)

	module.exports = {

	  bind: function () {
	    var el = this.el
	    if (!el.__vue__) {
	      this.start = _.createAnchor('v-if-start')
	      this.end = _.createAnchor('v-if-end')
	      _.replace(el, this.end)
	      _.before(this.start, this.end)
	      if (_.isTemplate(el)) {
	        this.template = templateParser.parse(el, true)
	      } else {
	        this.template = document.createDocumentFragment()
	        this.template.appendChild(templateParser.clone(el))
	      }
	      // compile the nested partial
	      this.linker = compiler.compile(
	        this.template,
	        this.vm.$options,
	        true
	      )
	    } else {
	      this.invalid = true
	      _.warn(
	        'v-if="' + this.expression + '" cannot be ' +
	        'used on an already mounted instance.'
	      )
	    }
	  },

	  update: function (value) {
	    if (this.invalid) return
	    if (value) {
	      // avoid duplicate compiles, since update() can be
	      // called with different truthy values
	      if (!this.unlink) {
	        this.compile()
	      }
	    } else {
	      this.teardown()
	    }
	  },

	  compile: function () {
	    var vm = this.vm
	    var frag = templateParser.clone(this.template)
	    // the linker is not guaranteed to be present because
	    // this function might get called by v-partial 
	    this.unlink = this.linker(vm, frag)
	    transition.blockAppend(frag, this.end, vm)
	    // call attached for all the child components created
	    // during the compilation
	    if (_.inDoc(vm.$el)) {
	      var children = this.getContainedComponents()
	      if (children) children.forEach(callAttach)
	    }
	  },

	  teardown: function () {
	    if (!this.unlink) return
	    // collect children beforehand
	    var children
	    if (_.inDoc(this.vm.$el)) {
	      children = this.getContainedComponents()
	    }
	    transition.blockRemove(this.start, this.end, this.vm)
	    if (children) children.forEach(callDetach)
	    this.unlink()
	    this.unlink = null
	  },

	  getContainedComponents: function () {
	    var vm = this.vm
	    var start = this.start.nextSibling
	    var end = this.end
	    var selfCompoents =
	      vm._children.length &&
	      vm._children.filter(contains)
	    var transComponents =
	      vm._transCpnts &&
	      vm._transCpnts.filter(contains)

	    function contains (c) {
	      var cur = start
	      var next
	      while (next !== end) {
	        next = cur.nextSibling
	        if (
	          cur === c.$el ||
	          cur.contains && cur.contains(c.$el)
	        ) {
	          return true
	        }
	        cur = next
	      }
	      return false
	    }

	    return selfCompoents
	      ? transComponents
	        ? selfCompoents.concat(transComponents)
	        : selfCompoents
	      : transComponents
	  },

	  unbind: function () {
	    if (this.unlink) this.unlink()
	  }

	}

	function callAttach (child) {
	  if (!child._isAttached) {
	    child._callHook('attached')
	  }
	}

	function callDetach (child) {
	  if (child._isAttached) {
	    child._callHook('detached')
	  }
	}

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Stringify value.
	 *
	 * @param {Number} indent
	 */

	exports.json = {
	  read: function (value, indent) {
	    return typeof value === 'string'
	      ? value
	      : JSON.stringify(value, null, Number(indent) || 2)
	  },
	  write: function (value) {
	    try {
	      return JSON.parse(value)
	    } catch (e) {
	      return value
	    }
	  }
	}

	/**
	 * 'abc' => 'Abc'
	 */

	exports.capitalize = function (value) {
	  if (!value && value !== 0) return ''
	  value = value.toString()
	  return value.charAt(0).toUpperCase() + value.slice(1)
	}

	/**
	 * 'abc' => 'ABC'
	 */

	exports.uppercase = function (value) {
	  return (value || value === 0)
	    ? value.toString().toUpperCase()
	    : ''
	}

	/**
	 * 'AbC' => 'abc'
	 */

	exports.lowercase = function (value) {
	  return (value || value === 0)
	    ? value.toString().toLowerCase()
	    : ''
	}

	/**
	 * 12345 => $12,345.00
	 *
	 * @param {String} sign
	 */

	var digitsRE = /(\d{3})(?=\d)/g

	exports.currency = function (value, sign) {
	  value = parseFloat(value)
	  if (!isFinite(value) || (!value && value !== 0)) return ''
	  sign = sign || '$'
	  var s = Math.floor(Math.abs(value)).toString(),
	    i = s.length % 3,
	    h = i > 0
	      ? (s.slice(0, i) + (s.length > 3 ? ',' : ''))
	      : '',
	    v = Math.abs(parseInt((value * 100) % 100, 10)),
	    f = '.' + (v < 10 ? ('0' + v) : v)
	  return (value < 0 ? '-' : '') +
	    sign + h + s.slice(i).replace(digitsRE, '$1,') + f
	}

	/**
	 * 'item' => 'items'
	 *
	 * @params
	 *  an array of strings corresponding to
	 *  the single, double, triple ... forms of the word to
	 *  be pluralized. When the number to be pluralized
	 *  exceeds the length of the args, it will use the last
	 *  entry in the array.
	 *
	 *  e.g. ['single', 'double', 'triple', 'multiple']
	 */

	exports.pluralize = function (value) {
	  var args = _.toArray(arguments, 1)
	  return args.length > 1
	    ? (args[value % 10 - 1] || args[args.length - 1])
	    : (args[0] + (value === 1 ? '' : 's'))
	}

	/**
	 * A special filter that takes a handler function,
	 * wraps it so it only gets triggered on specific
	 * keypresses. v-on only.
	 *
	 * @param {String} key
	 */

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

	exports.key = function (handler, key) {
	  if (!handler) return
	  var code = keyCodes[key]
	  if (!code) {
	    code = parseInt(key, 10)
	  }
	  return function (e) {
	    if (e.keyCode === code) {
	      return handler.call(this, e)
	    }
	  }
	}

	// expose keycode hash
	exports.key.keyCodes = keyCodes

	/**
	 * Install special array filters
	 */

	_.extend(exports, __webpack_require__(51))


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Path = __webpack_require__(23)

	/**
	 * Filter filter for v-repeat
	 *
	 * @param {String} searchKey
	 * @param {String} [delimiter]
	 * @param {String} dataKey
	 */

	exports.filterBy = function (arr, search, delimiter, dataKey) {
	  // allow optional `in` delimiter
	  // because why not
	  if (delimiter && delimiter !== 'in') {
	    dataKey = delimiter
	  }
	  /* jshint eqeqeq: false */
	  if (search == null) {
	    return arr
	  }
	  // cast to lowercase string
	  search = ('' + search).toLowerCase()
	  return arr.filter(function (item) {
	    return dataKey
	      ? contains(Path.get(item, dataKey), search)
	      : contains(item, search)
	  })
	}

	/**
	 * Filter filter for v-repeat
	 *
	 * @param {String} sortKey
	 * @param {String} reverse
	 */

	exports.orderBy = function (arr, sortKey, reverse) {
	  if (!sortKey) {
	    return arr
	  }
	  var order = 1
	  if (arguments.length > 2) {
	    if (reverse === '-1') {
	      order = -1
	    } else {
	      order = reverse ? -1 : 1
	    }
	  }
	  // sort on a copy to avoid mutating original array
	  return arr.slice().sort(function (a, b) {
	    if (sortKey !== '$key' && sortKey !== '$value') {
	      if (a && '$value' in a) a = a.$value
	      if (b && '$value' in b) b = b.$value
	    }
	    a = _.isObject(a) ? Path.get(a, sortKey) : a
	    b = _.isObject(b) ? Path.get(b, sortKey) : b
	    return a === b ? 0 : a > b ? order : -order
	  })
	}

	/**
	 * String contain helper
	 *
	 * @param {*} val
	 * @param {String} search
	 */

	function contains (val, search) {
	  if (_.isPlainObject(val)) {
	    for (var key in val) {
	      if (contains(val[key], search)) {
	        return true
	      }
	    }
	  } else if (_.isArray(val)) {
	    var i = val.length
	    while (i--) {
	      if (contains(val[i], search)) {
	        return true
	      }
	    }
	  } else if (val != null) {
	    return val.toString().toLowerCase().indexOf(search) > -1
	  }
	}


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	// This is the elementDirective that handles <content>
	// transclusions. It relies on the raw content of an
	// instance being stored as `$options._content` during
	// the transclude phase.

	module.exports = {

	  bind: function () {
	    var vm = this.vm
	    var contentOwner = vm
	    // we need find the content owner, which is the closest
	    // non-inline-repeater instance.
	    while (contentOwner.$options._repeat) {
	      contentOwner = contentOwner.$parent
	    }
	    var raw = contentOwner.$options._content
	    var content
	    if (!raw) {
	      this.fallback()
	      return
	    }
	    var parent = contentOwner.$parent
	    var selector = this.el.getAttribute('select')
	    if (!selector) {
	      // Default content
	      var self = this
	      var compileDefaultContent = function () {
	        self.compile(
	          extractFragment(raw.childNodes, raw, true),
	          contentOwner.$parent,
	          vm
	        )
	      }
	      if (!contentOwner._isCompiled) {
	        // defer until the end of instance compilation,
	        // because the default outlet must wait until all
	        // other possible outlets with selectors have picked
	        // out their contents.
	        contentOwner.$once('hook:compiled', compileDefaultContent)
	      } else {
	        compileDefaultContent()
	      }
	    } else {
	      // select content
	      selector = vm.$interpolate(selector)
	      var nodes = raw.querySelectorAll(selector)
	      if (nodes.length) {
	        content = extractFragment(nodes, raw)
	        if (content.hasChildNodes()) {
	          this.compile(content, parent, vm)
	        } else {
	          this.fallback()
	        }
	      } else {
	        this.fallback()
	      }
	    }
	  },

	  fallback: function () {
	    this.compile(_.extractContent(this.el, true), this.vm)
	  },

	  compile: function (content, owner, host) {
	    if (content && owner) {
	      this.unlink = owner.$compile(content, host)
	    }
	    if (content) {
	      _.replace(this.el, content)
	    } else {
	      _.remove(this.el)
	    }
	  },

	  unbind: function () {
	    if (this.unlink) {
	      this.unlink()
	    } 
	  }
	}

	/**
	 * Extract qualified content nodes from a node list.
	 *
	 * @param {NodeList} nodes
	 * @param {Element} parent
	 * @param {Boolean} main
	 * @return {DocumentFragment}
	 */

	function extractFragment (nodes, parent, main) {
	  var frag = document.createDocumentFragment()
	  for (var i = 0, l = nodes.length; i < l; i++) {
	    var node = nodes[i]
	    // if this is the main outlet, we want to skip all
	    // previously selected nodes;
	    // otherwise, we want to mark the node as selected.
	    // clone the node so the original raw content remains
	    // intact. this ensures proper re-compilation in cases
	    // where the outlet is inside a conditional block
	    if (main && !node.selected) {
	      frag.appendChild(node.cloneNode(true))
	    } else if (!main && node.parentNode === parent) {
	      node.selected = true
	      frag.appendChild(node.cloneNode(true))
	    }
	  }
	  return frag
	}


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var mergeOptions = __webpack_require__(1).mergeOptions

	/**
	 * The main init sequence. This is called for every
	 * instance, including ones that are created from extended
	 * constructors.
	 *
	 * @param {Object} options - this options object should be
	 *                           the result of merging class
	 *                           options and the options passed
	 *                           in to the constructor.
	 */

	exports._init = function (options) {

	  options = options || {}

	  this.$el           = null
	  this.$parent       = options._parent
	  this.$root         = options._root || this
	  this.$             = {} // child vm references
	  this.$$            = {} // element references
	  this._watchers     = [] // all watchers as an array
	  this._directives   = [] // all directives

	  // a flag to avoid this being observed
	  this._isVue = true

	  // events bookkeeping
	  this._events         = {}    // registered callbacks
	  this._eventsCount    = {}    // for $broadcast optimization
	  this._eventCancelled = false // for event cancellation

	  // block instance properties
	  this._isBlock     = false
	  this._blockStart  =          // @type {CommentNode}
	  this._blockEnd    = null     // @type {CommentNode}

	  // lifecycle state
	  this._isCompiled  =
	  this._isDestroyed =
	  this._isReady     =
	  this._isAttached  =
	  this._isBeingDestroyed = false
	  this._unlinkFn    = null

	  // children
	  this._children = []
	  this._childCtors = {}

	  // transcluded components that belong to the parent.
	  // need to keep track of them so that we can call
	  // attached/detached hooks on them.
	  this._transCpnts = []
	  this._host = options._host

	  // push self into parent / transclusion host
	  if (this.$parent) {
	    this.$parent._children.push(this)
	  }
	  if (this._host) {
	    this._host._transCpnts.push(this)
	  }

	  // props used in v-repeat diffing
	  this._reused = false
	  this._staggerOp = null

	  // merge options.
	  options = this.$options = mergeOptions(
	    this.constructor.options,
	    options,
	    this
	  )

	  // set data after merge.
	  this._data = options.data || {}

	  // initialize data observation and scope inheritance.
	  this._initScope()

	  // setup event system and option events.
	  this._initEvents()

	  // call created hook
	  this._callHook('created')

	  // if `el` option is passed, start compilation.
	  if (options.el) {
	    this.$mount(options.el)
	  }
	}


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var inDoc = _.inDoc

	/**
	 * Setup the instance's option events & watchers.
	 * If the value is a string, we pull it from the
	 * instance's methods by name.
	 */

	exports._initEvents = function () {
	  var options = this.$options
	  registerCallbacks(this, '$on', options.events)
	  registerCallbacks(this, '$watch', options.watch)
	}

	/**
	 * Register callbacks for option events and watchers.
	 *
	 * @param {Vue} vm
	 * @param {String} action
	 * @param {Object} hash
	 */

	function registerCallbacks (vm, action, hash) {
	  if (!hash) return
	  var handlers, key, i, j
	  for (key in hash) {
	    handlers = hash[key]
	    if (_.isArray(handlers)) {
	      for (i = 0, j = handlers.length; i < j; i++) {
	        register(vm, action, key, handlers[i])
	      }
	    } else {
	      register(vm, action, key, handlers)
	    }
	  }
	}

	/**
	 * Helper to register an event/watch callback.
	 *
	 * @param {Vue} vm
	 * @param {String} action
	 * @param {String} key
	 * @param {*} handler
	 */

	function register (vm, action, key, handler) {
	  var type = typeof handler
	  if (type === 'function') {
	    vm[action](key, handler)
	  } else if (type === 'string') {
	    var methods = vm.$options.methods
	    var method = methods && methods[handler]
	    if (method) {
	      vm[action](key, method)
	    } else {
	      _.warn(
	        'Unknown method: "' + handler + '" when ' +
	        'registering callback for ' + action +
	        ': "' + key + '".'
	      )
	    }
	  }
	}

	/**
	 * Setup recursive attached/detached calls
	 */

	exports._initDOMHooks = function () {
	  this.$on('hook:attached', onAttached)
	  this.$on('hook:detached', onDetached)
	}

	/**
	 * Callback to recursively call attached hook on children
	 */

	function onAttached () {
	  this._isAttached = true
	  this._children.forEach(callAttach)
	  if (this._transCpnts.length) {
	    this._transCpnts.forEach(callAttach)
	  }
	}

	/**
	 * Iterator to call attached hook
	 * 
	 * @param {Vue} child
	 */

	function callAttach (child) {
	  if (!child._isAttached && inDoc(child.$el)) {
	    child._callHook('attached')
	  }
	}

	/**
	 * Callback to recursively call detached hook on children
	 */

	function onDetached () {
	  this._isAttached = false
	  this._children.forEach(callDetach)
	  if (this._transCpnts.length) {
	    this._transCpnts.forEach(callDetach)
	  }
	}

	/**
	 * Iterator to call detached hook
	 * 
	 * @param {Vue} child
	 */

	function callDetach (child) {
	  if (child._isAttached && !inDoc(child.$el)) {
	    child._callHook('detached')
	  }
	}

	/**
	 * Trigger all handlers for a hook
	 *
	 * @param {String} hook
	 */

	exports._callHook = function (hook) {
	  var handlers = this.$options[hook]
	  if (handlers) {
	    for (var i = 0, j = handlers.length; i < j; i++) {
	      handlers[i].call(this)
	    }
	  }
	  this.$emit('hook:' + hook)
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Observer = __webpack_require__(18)
	var Dep = __webpack_require__(19)

	/**
	 * Setup the scope of an instance, which contains:
	 * - observed data
	 * - computed properties
	 * - user methods
	 * - meta properties
	 */

	exports._initScope = function () {
	  this._initProps()
	  this._initData()
	  this._initComputed()
	  this._initMethods()
	  this._initMeta()
	}

	/**
	 * Initialize props.
	 */

	exports._initProps = function () {
	  // make sure all props properties are observed
	  var data = this._data
	  var props = this.$options.props
	  var prop, key, i
	  if (props) {
	    i = props.length
	    while (i--) {
	      prop = props[i]
	      // props can be strings or object descriptors
	      key = _.camelize(
	        typeof prop === 'string'
	          ? prop
	          : prop.name
	      )
	      if (!(key in data) && key !== '$data') {
	        data[key] = undefined
	      }
	    }
	  }
	}

	/**
	 * Initialize the data. 
	 */

	exports._initData = function () {
	  // proxy data on instance
	  var data = this._data
	  var keys = Object.keys(data)
	  var i, key
	  i = keys.length
	  while (i--) {
	    key = keys[i]
	    if (!_.isReserved(key)) {
	      this._proxy(key)
	    }
	  }
	  // observe data
	  Observer.create(data).addVm(this)
	}

	/**
	 * Swap the isntance's $data. Called in $data's setter.
	 *
	 * @param {Object} newData
	 */

	exports._setData = function (newData) {
	  newData = newData || {}
	  var oldData = this._data
	  this._data = newData
	  var keys, key, i
	  // copy props.
	  // this should only happen during a v-repeat of component
	  // that also happens to have compiled props.
	  var props = this.$options.props
	  if (props) {
	    i = props.length
	    while (i--) {
	      key = props[i]
	      if (key !== '$data' && !newData.hasOwnProperty(key)) {
	        newData.$set(key, oldData[key])
	      }
	    }
	  }
	  // unproxy keys not present in new data
	  keys = Object.keys(oldData)
	  i = keys.length
	  while (i--) {
	    key = keys[i]
	    if (!_.isReserved(key) && !(key in newData)) {
	      this._unproxy(key)
	    }
	  }
	  // proxy keys not already proxied,
	  // and trigger change for changed values
	  keys = Object.keys(newData)
	  i = keys.length
	  while (i--) {
	    key = keys[i]
	    if (!this.hasOwnProperty(key) && !_.isReserved(key)) {
	      // new property
	      this._proxy(key)
	    }
	  }
	  oldData.__ob__.removeVm(this)
	  Observer.create(newData).addVm(this)
	  this._digest()
	}

	/**
	 * Proxy a property, so that
	 * vm.prop === vm._data.prop
	 *
	 * @param {String} key
	 */

	exports._proxy = function (key) {
	  // need to store ref to self here
	  // because these getter/setters might
	  // be called by child instances!
	  var self = this
	  Object.defineProperty(self, key, {
	    configurable: true,
	    enumerable: true,
	    get: function proxyGetter () {
	      return self._data[key]
	    },
	    set: function proxySetter (val) {
	      self._data[key] = val
	    }
	  })
	}

	/**
	 * Unproxy a property.
	 *
	 * @param {String} key
	 */

	exports._unproxy = function (key) {
	  delete this[key]
	}

	/**
	 * Force update on every watcher in scope.
	 */

	exports._digest = function () {
	  var i = this._watchers.length
	  while (i--) {
	    this._watchers[i].update()
	  }
	  var children = this._children
	  i = children.length
	  while (i--) {
	    var child = children[i]
	    if (child.$options.inherit) {
	      child._digest()
	    }
	  }
	}

	/**
	 * Setup computed properties. They are essentially
	 * special getter/setters
	 */

	function noop () {}
	exports._initComputed = function () {
	  var computed = this.$options.computed
	  if (computed) {
	    for (var key in computed) {
	      var userDef = computed[key]
	      var def = {
	        enumerable: true,
	        configurable: true
	      }
	      if (typeof userDef === 'function') {
	        def.get = _.bind(userDef, this)
	        def.set = noop
	      } else {
	        def.get = userDef.get
	          ? _.bind(userDef.get, this)
	          : noop
	        def.set = userDef.set
	          ? _.bind(userDef.set, this)
	          : noop
	      }
	      Object.defineProperty(this, key, def)
	    }
	  }
	}

	/**
	 * Setup instance methods. Methods must be bound to the
	 * instance since they might be called by children
	 * inheriting them.
	 */

	exports._initMethods = function () {
	  var methods = this.$options.methods
	  if (methods) {
	    for (var key in methods) {
	      this[key] = _.bind(methods[key], this)
	    }
	  }
	}

	/**
	 * Initialize meta information like $index, $key & $value.
	 */

	exports._initMeta = function () {
	  var metas = this.$options._meta
	  if (metas) {
	    for (var key in metas) {
	      this._defineMeta(key, metas[key])
	    }
	  }
	}

	/**
	 * Define a meta property, e.g $index, $key, $value
	 * which only exists on the vm instance but not in $data.
	 *
	 * @param {String} key
	 * @param {*} value
	 */

	exports._defineMeta = function (key, value) {
	  var dep = new Dep()
	  Object.defineProperty(this, key, {
	    enumerable: true,
	    configurable: true,
	    get: function metaGetter () {
	      dep.depend()
	      return value
	    },
	    set: function metaSetter (val) {
	      if (val !== value) {
	        value = val
	        dep.notify()
	      }
	    }
	  })
	}


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Directive = __webpack_require__(57)
	var compiler = __webpack_require__(10)

	/**
	 * Transclude, compile and link element.
	 *
	 * If a pre-compiled linker is available, that means the
	 * passed in element will be pre-transcluded and compiled
	 * as well - all we need to do is to call the linker.
	 *
	 * Otherwise we need to call transclude/compile/link here.
	 *
	 * @param {Element} el
	 * @return {Element}
	 */

	exports._compile = function (el) {
	  var options = this.$options
	  var host = this._host
	  if (options._linkFn) {
	    // pre-transcluded with linker, just use it
	    this._initElement(el)
	    this._unlinkFn = options._linkFn(this, el, host)
	  } else {
	    // transclude and init element
	    // transclude can potentially replace original
	    // so we need to keep reference; this step also injects
	    // the template and caches the original attributes
	    // on the container node and replacer node.
	    var original = el
	    el = compiler.transclude(el, options)
	    this._initElement(el)

	    // root is always compiled per-instance, because
	    // container attrs and props can be different every time.
	    var rootUnlinkFn =
	      compiler.compileAndLinkRoot(this, el, options)

	    // compile and link the rest
	    var linker
	    var ctor = this.constructor
	    // component compilation can be cached
	    // as long as it's not using inline-template
	    if (options._linkerCachable) {
	      linker = ctor.linker
	      if (!linker) {
	        linker = ctor.linker = compiler.compile(el, options)
	      }
	    }
	    var contentUnlinkFn = linker
	      ? linker(this, el)
	      : compiler.compile(el, options)(this, el, host)

	    this._unlinkFn = function () {
	      rootUnlinkFn()
	      // passing destroying: true to avoid searching and
	      // splicing the directives
	      contentUnlinkFn(true)
	    }

	    // finally replace original
	    if (options.replace) {
	      _.replace(original, el)
	    }
	  }
	  return el
	}

	/**
	 * Initialize instance element. Called in the public
	 * $mount() method.
	 *
	 * @param {Element} el
	 */

	exports._initElement = function (el) {
	  if (el instanceof DocumentFragment) {
	    this._isBlock = true
	    this.$el = this._blockStart = el.firstChild
	    this._blockEnd = el.lastChild
	    // set persisted text anchors to empty
	    if (this._blockStart.nodeType === 3) {
	      this._blockStart.data = this._blockEnd.data = ''
	    }
	    this._blockFragment = el
	  } else {
	    this.$el = el
	  }
	  this.$el.__vue__ = this
	  this._callHook('beforeCompile')
	}

	/**
	 * Create and bind a directive to an element.
	 *
	 * @param {String} name - directive name
	 * @param {Node} node   - target node
	 * @param {Object} desc - parsed directive descriptor
	 * @param {Object} def  - directive definition object
	 * @param {Vue|undefined} host - transclusion host component
	 */

	exports._bindDir = function (name, node, desc, def, host) {
	  this._directives.push(
	    new Directive(name, node, this, desc, def, host)
	  )
	}

	/**
	 * Teardown an instance, unobserves the data, unbind all the
	 * directives, turn off all the event listeners, etc.
	 *
	 * @param {Boolean} remove - whether to remove the DOM node.
	 * @param {Boolean} deferCleanup - if true, defer cleanup to
	 *                                 be called later
	 */

	exports._destroy = function (remove, deferCleanup) {
	  if (this._isBeingDestroyed) {
	    return
	  }
	  this._callHook('beforeDestroy')
	  this._isBeingDestroyed = true
	  var i
	  // remove self from parent. only necessary
	  // if parent is not being destroyed as well.
	  var parent = this.$parent
	  if (parent && !parent._isBeingDestroyed) {
	    parent._children.$remove(this)
	  }
	  // same for transclusion host.
	  var host = this._host
	  if (host && !host._isBeingDestroyed) {
	    host._transCpnts.$remove(this)
	  }
	  // destroy all children.
	  i = this._children.length
	  while (i--) {
	    this._children[i].$destroy()
	  }
	  // teardown all directives. this also tearsdown all
	  // directive-owned watchers.
	  if (this._unlinkFn) {
	    this._unlinkFn()
	  }
	  i = this._watchers.length
	  while (i--) {
	    this._watchers[i].teardown()
	  }
	  // remove reference to self on $el
	  if (this.$el) {
	    this.$el.__vue__ = null
	  }
	  // remove DOM element
	  var self = this
	  if (remove && this.$el) {
	    this.$remove(function () {
	      self._cleanup()
	    })
	  } else if (!deferCleanup) {
	    this._cleanup()
	  }
	}

	/**
	 * Clean up to ensure garbage collection.
	 * This is called after the leave transition if there
	 * is any.
	 */

	exports._cleanup = function () {
	  // remove reference from data ob
	  this._data.__ob__.removeVm(this)
	  this._data =
	  this._watchers =
	  this.$el =
	  this.$parent =
	  this.$root =
	  this._children =
	  this._transCpnts =
	  this._directives = null
	  // call the last hook...
	  this._isDestroyed = true
	  this._callHook('destroyed')
	  // turn off all instance listeners.
	  this.$off()
	}

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(3)
	var Watcher = __webpack_require__(17)
	var textParser = __webpack_require__(14)
	var expParser = __webpack_require__(22)

	/**
	 * A directive links a DOM element with a piece of data,
	 * which is the result of evaluating an expression.
	 * It registers a watcher with the expression and calls
	 * the DOM update function when a change is triggered.
	 *
	 * @param {String} name
	 * @param {Node} el
	 * @param {Vue} vm
	 * @param {Object} descriptor
	 *                 - {String} expression
	 *                 - {String} [arg]
	 *                 - {Array<Object>} [filters]
	 * @param {Object} def - directive definition object
	 * @param {Vue|undefined} host - transclusion host target
	 * @constructor
	 */

	function Directive (name, el, vm, descriptor, def, host) {
	  // public
	  this.name = name
	  this.el = el
	  this.vm = vm
	  // copy descriptor props
	  this.raw = descriptor.raw
	  this.expression = descriptor.expression
	  this.arg = descriptor.arg
	  this.filters = descriptor.filters
	  // private
	  this._descriptor = descriptor
	  this._host = host
	  this._locked = false
	  this._bound = false
	  // init
	  this._bind(def)
	}

	var p = Directive.prototype

	/**
	 * Initialize the directive, mixin definition properties,
	 * setup the watcher, call definition bind() and update()
	 * if present.
	 *
	 * @param {Object} def
	 */

	p._bind = function (def) {
	  if (this.name !== 'cloak' && this.el && this.el.removeAttribute) {
	    this.el.removeAttribute(config.prefix + this.name)
	  }
	  if (typeof def === 'function') {
	    this.update = def
	  } else {
	    _.extend(this, def)
	  }
	  this._watcherExp = this.expression
	  this._checkDynamicLiteral()
	  if (this.bind) {
	    this.bind()
	  }
	  if (this._watcherExp &&
	      (this.update || this.twoWay) &&
	      (!this.isLiteral || this._isDynamicLiteral) &&
	      !this._checkStatement()) {
	    // wrapped updater for context
	    var dir = this
	    var update = this._update = this.update
	      ? function (val, oldVal) {
	          if (!dir._locked) {
	            dir.update(val, oldVal)
	          }
	        }
	      : function () {} // noop if no update is provided
	    // pre-process hook called before the value is piped
	    // through the filters. used in v-repeat.
	    var preProcess = this._preProcess
	      ? _.bind(this._preProcess, this)
	      : null
	    var watcher = this._watcher = new Watcher(
	      this.vm,
	      this._watcherExp,
	      update, // callback
	      {
	        filters: this.filters,
	        twoWay: this.twoWay,
	        deep: this.deep,
	        preProcess: preProcess
	      }
	    )
	    if (this._initValue != null) {
	      watcher.set(this._initValue)
	    } else if (this.update) {
	      this.update(watcher.value)
	    }
	  }
	  this._bound = true
	}

	/**
	 * check if this is a dynamic literal binding.
	 *
	 * e.g. v-component="{{currentView}}"
	 */

	p._checkDynamicLiteral = function () {
	  var expression = this.expression
	  if (expression && this.isLiteral) {
	    var tokens = textParser.parse(expression)
	    if (tokens) {
	      var exp = textParser.tokensToExp(tokens)
	      this.expression = this.vm.$get(exp)
	      this._watcherExp = exp
	      this._isDynamicLiteral = true
	    }
	  }
	}

	/**
	 * Check if the directive is a function caller
	 * and if the expression is a callable one. If both true,
	 * we wrap up the expression and use it as the event
	 * handler.
	 *
	 * e.g. v-on="click: a++"
	 *
	 * @return {Boolean}
	 */

	p._checkStatement = function () {
	  var expression = this.expression
	  if (
	    expression && this.acceptStatement &&
	    !expParser.isSimplePath(expression)
	  ) {
	    var fn = expParser.parse(expression).get
	    var vm = this.vm
	    var handler = function () {
	      fn.call(vm, vm)
	    }
	    if (this.filters) {
	      handler = vm._applyFilters(handler, null, this.filters)
	    }
	    this.update(handler)
	    return true
	  }
	}

	/**
	 * Check for an attribute directive param, e.g. lazy
	 *
	 * @param {String} name
	 * @return {String}
	 */

	p._checkParam = function (name) {
	  var param = this.el.getAttribute(name)
	  if (param !== null) {
	    this.el.removeAttribute(name)
	  }
	  return param
	}

	/**
	 * Teardown the watcher and call unbind.
	 */

	p._teardown = function () {
	  if (this._bound) {
	    this._bound = false
	    if (this.unbind) {
	      this.unbind()
	    }
	    if (this._watcher) {
	      this._watcher.teardown()
	    }
	    this.vm = this.el = this._watcher = null
	  }
	}

	/**
	 * Set the corresponding value with the setter.
	 * This should only be used in two-way directives
	 * e.g. v-model.
	 *
	 * @param {*} value
	 * @public
	 */

	p.set = function (value) {
	  if (this.twoWay) {
	    this._withLock(function () {
	      this._watcher.set(value)
	    })
	  }
	}

	/**
	 * Execute a function while preventing that function from
	 * triggering updates on this directive instance.
	 *
	 * @param {Function} fn
	 */

	p._withLock = function (fn) {
	  var self = this
	  self._locked = true
	  fn.call(self)
	  _.nextTick(function () {
	    self._locked = false
	  })
	}

	module.exports = Directive

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Apply a list of filter (descriptors) to a value.
	 * Using plain for loops here because this will be called in
	 * the getter of any watcher with filters so it is very
	 * performance sensitive.
	 *
	 * @param {*} value
	 * @param {*} [oldValue]
	 * @param {Array} filters
	 * @param {Boolean} write
	 * @return {*}
	 */

	exports._applyFilters = function (value, oldValue, filters, write) {
	  var filter, fn, args, arg, offset, i, l, j, k
	  for (i = 0, l = filters.length; i < l; i++) {
	    filter = filters[i]
	    fn = _.resolveAsset(this.$options, 'filters', filter.name)
	    _.assertAsset(fn, 'filter', filter.name)
	    if (!fn) continue
	    fn = write ? fn.write : (fn.read || fn)
	    if (typeof fn !== 'function') continue
	    args = write ? [value, oldValue] : [value]
	    offset = write ? 2 : 1
	    if (filter.args) {
	      for (j = 0, k = filter.args.length; j < k; j++) {
	        arg = filter.args[j]
	        args[j + offset] = arg.dynamic
	          ? this.$get(arg.value)
	          : arg.value
	      }
	    }
	    value = fn.apply(this, args)
	  }
	  return value
	}

	/**
	 * Resolve a component, depending on whether the component
	 * is defined normally or using an async factory function.
	 * Resolves synchronously if already resolved, otherwise
	 * resolves asynchronously and caches the resolved
	 * constructor on the factory.
	 *
	 * @param {String} id
	 * @param {Function} cb
	 */

	exports._resolveComponent = function (id, cb) {
	  var factory = _.resolveAsset(this.$options, 'components', id)
	  _.assertAsset(factory, 'component', id)
	  // async component factory
	  if (!factory.options) {
	    if (factory.resolved) {
	      // cached
	      cb(factory.resolved)
	    } else if (factory.requested) {
	      // pool callbacks
	      factory.pendingCallbacks.push(cb)
	    } else {
	      factory.requested = true
	      var cbs = factory.pendingCallbacks = [cb]
	      factory(function resolve (res) {
	        if (_.isPlainObject(res)) {
	          res = _.Vue.extend(res)
	        }
	        // cache resolved
	        factory.resolved = res
	        // invoke callbacks
	        for (var i = 0, l = cbs.length; i < l; i++) {
	          cbs[i](res)
	        }
	      }, function reject (reason) {
	        _.warn(
	          'Failed to resolve async component: ' + id + '. ' +
	          (reason ? '\nReason: ' + reason : '')
	        )
	      })
	    }
	  } else {
	    // normal component
	    cb(factory)
	  }
	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var Watcher = __webpack_require__(17)
	var Path = __webpack_require__(23)
	var textParser = __webpack_require__(14)
	var dirParser = __webpack_require__(15)
	var expParser = __webpack_require__(22)
	var filterRE = /[^|]\|[^|]/

	/**
	 * Get the value from an expression on this vm.
	 *
	 * @param {String} exp
	 * @return {*}
	 */

	exports.$get = function (exp) {
	  var res = expParser.parse(exp)
	  if (res) {
	    try {
	      return res.get.call(this, this)
	    } catch (e) {}
	  }
	}

	/**
	 * Set the value from an expression on this vm.
	 * The expression must be a valid left-hand
	 * expression in an assignment.
	 *
	 * @param {String} exp
	 * @param {*} val
	 */

	exports.$set = function (exp, val) {
	  var res = expParser.parse(exp, true)
	  if (res && res.set) {
	    res.set.call(this, this, val)
	  }
	}

	/**
	 * Add a property on the VM
	 *
	 * @param {String} key
	 * @param {*} val
	 */

	exports.$add = function (key, val) {
	  this._data.$add(key, val)
	}

	/**
	 * Delete a property on the VM
	 *
	 * @param {String} key
	 */

	exports.$delete = function (key) {
	  this._data.$delete(key)
	}

	/**
	 * Watch an expression, trigger callback when its
	 * value changes.
	 *
	 * @param {String} exp
	 * @param {Function} cb
	 * @param {Object} [options]
	 *                 - {Boolean} deep
	 *                 - {Boolean} immediate
	 *                 - {Boolean} user
	 * @return {Function} - unwatchFn
	 */

	exports.$watch = function (exp, cb, options) {
	  var vm = this
	  var wrappedCb = function (val, oldVal) {
	    cb.call(vm, val, oldVal)
	  }
	  var watcher = new Watcher(vm, exp, wrappedCb, {
	    deep: options && options.deep,
	    user: !options || options.user !== false
	  })
	  if (options && options.immediate) {
	    wrappedCb(watcher.value)
	  }
	  return function unwatchFn () {
	    watcher.teardown()
	  }
	}

	/**
	 * Evaluate a text directive, including filters.
	 *
	 * @param {String} text
	 * @return {String}
	 */

	exports.$eval = function (text) {
	  // check for filters.
	  if (filterRE.test(text)) {
	    var dir = dirParser.parse(text)[0]
	    // the filter regex check might give false positive
	    // for pipes inside strings, so it's possible that
	    // we don't get any filters here
	    var val = this.$get(dir.expression)
	    return dir.filters
	      ? this._applyFilters(val, null, dir.filters)
	      : val
	  } else {
	    // no filter
	    return this.$get(text)
	  }
	}

	/**
	 * Interpolate a piece of template text.
	 *
	 * @param {String} text
	 * @return {String}
	 */

	exports.$interpolate = function (text) {
	  var tokens = textParser.parse(text)
	  var vm = this
	  if (tokens) {
	    return tokens.length === 1
	      ? vm.$eval(tokens[0].value)
	      : tokens.map(function (token) {
	          return token.tag
	            ? vm.$eval(token.value)
	            : token.value
	        }).join('')
	  } else {
	    return text
	  }
	}

	/**
	 * Log instance data as a plain JS object
	 * so that it is easier to inspect in console.
	 * This method assumes console is available.
	 *
	 * @param {String} [path]
	 */

	exports.$log = function (path) {
	  var data = path
	    ? Path.get(this._data, path)
	    : this._data
	  if (data) {
	    data = JSON.parse(JSON.stringify(data))
	  }
	  console.log(data)
	}


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var transition = __webpack_require__(34)

	/**
	 * Convenience on-instance nextTick. The callback is
	 * auto-bound to the instance, and this avoids component
	 * modules having to rely on the global Vue.
	 *
	 * @param {Function} fn
	 */

	exports.$nextTick = function (fn) {
	  _.nextTick(fn, this)
	}

	/**
	 * Append instance to target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$appendTo = function (target, cb, withTransition) {
	  return insert(
	    this, target, cb, withTransition,
	    append, transition.append
	  )
	}

	/**
	 * Prepend instance to target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$prependTo = function (target, cb, withTransition) {
	  target = query(target)
	  if (target.hasChildNodes()) {
	    this.$before(target.firstChild, cb, withTransition)
	  } else {
	    this.$appendTo(target, cb, withTransition)
	  }
	  return this
	}

	/**
	 * Insert instance before target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$before = function (target, cb, withTransition) {
	  return insert(
	    this, target, cb, withTransition,
	    before, transition.before
	  )
	}

	/**
	 * Insert instance after target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$after = function (target, cb, withTransition) {
	  target = query(target)
	  if (target.nextSibling) {
	    this.$before(target.nextSibling, cb, withTransition)
	  } else {
	    this.$appendTo(target.parentNode, cb, withTransition)
	  }
	  return this
	}

	/**
	 * Remove instance from DOM
	 *
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$remove = function (cb, withTransition) {
	  if (!this.$el.parentNode) {
	    return cb && cb()
	  }
	  var inDoc = this._isAttached && _.inDoc(this.$el)
	  // if we are not in document, no need to check
	  // for transitions
	  if (!inDoc) withTransition = false
	  var op
	  var self = this
	  var realCb = function () {
	    if (inDoc) self._callHook('detached')
	    if (cb) cb()
	  }
	  if (
	    this._isBlock &&
	    !this._blockFragment.hasChildNodes()
	  ) {
	    op = withTransition === false
	      ? append
	      : transition.removeThenAppend
	    blockOp(this, this._blockFragment, op, realCb)
	  } else {
	    op = withTransition === false
	      ? remove
	      : transition.remove
	    op(this.$el, this, realCb)
	  }
	  return this
	}

	/**
	 * Shared DOM insertion function.
	 *
	 * @param {Vue} vm
	 * @param {Element} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition]
	 * @param {Function} op1 - op for non-transition insert
	 * @param {Function} op2 - op for transition insert
	 * @return vm
	 */

	function insert (vm, target, cb, withTransition, op1, op2) {
	  target = query(target)
	  var targetIsDetached = !_.inDoc(target)
	  var op = withTransition === false || targetIsDetached
	    ? op1
	    : op2
	  var shouldCallHook =
	    !targetIsDetached &&
	    !vm._isAttached &&
	    !_.inDoc(vm.$el)
	  if (vm._isBlock) {
	    blockOp(vm, target, op, cb)
	  } else {
	    op(vm.$el, target, vm, cb)
	  }
	  if (shouldCallHook) {
	    vm._callHook('attached')
	  }
	  return vm
	}

	/**
	 * Execute a transition operation on a block instance,
	 * iterating through all its block nodes.
	 *
	 * @param {Vue} vm
	 * @param {Node} target
	 * @param {Function} op
	 * @param {Function} cb
	 */

	function blockOp (vm, target, op, cb) {
	  var current = vm._blockStart
	  var end = vm._blockEnd
	  var next
	  while (next !== end) {
	    next = current.nextSibling
	    op(current, target, vm)
	    current = next
	  }
	  op(end, target, vm, cb)
	}

	/**
	 * Check for selectors
	 *
	 * @param {String|Element} el
	 */

	function query (el) {
	  return typeof el === 'string'
	    ? document.querySelector(el)
	    : el
	}

	/**
	 * Append operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Node} target
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function append (el, target, vm, cb) {
	  target.appendChild(el)
	  if (cb) cb()
	}

	/**
	 * InsertBefore operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Node} target
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function before (el, target, vm, cb) {
	  _.before(el, target)
	  if (cb) cb()
	}

	/**
	 * Remove operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function remove (el, vm, cb) {
	  _.remove(el)
	  if (cb) cb()
	}


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$on = function (event, fn) {
	  (this._events[event] || (this._events[event] = []))
	    .push(fn)
	  modifyListenerCount(this, event, 1)
	  return this
	}

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$once = function (event, fn) {
	  var self = this
	  function on () {
	    self.$off(event, on)
	    fn.apply(this, arguments)
	  }
	  on.fn = fn
	  this.$on(event, on)
	  return this
	}

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$off = function (event, fn) {
	  var cbs
	  // all
	  if (!arguments.length) {
	    if (this.$parent) {
	      for (event in this._events) {
	        cbs = this._events[event]
	        if (cbs) {
	          modifyListenerCount(this, event, -cbs.length)
	        }
	      }
	    }
	    this._events = {}
	    return this
	  }
	  // specific event
	  cbs = this._events[event]
	  if (!cbs) {
	    return this
	  }
	  if (arguments.length === 1) {
	    modifyListenerCount(this, event, -cbs.length)
	    this._events[event] = null
	    return this
	  }
	  // specific handler
	  var cb
	  var i = cbs.length
	  while (i--) {
	    cb = cbs[i]
	    if (cb === fn || cb.fn === fn) {
	      modifyListenerCount(this, event, -1)
	      cbs.splice(i, 1)
	      break
	    }
	  }
	  return this
	}

	/**
	 * Trigger an event on self.
	 *
	 * @param {String} event
	 */

	exports.$emit = function (event) {
	  this._eventCancelled = false
	  var cbs = this._events[event]
	  if (cbs) {
	    // avoid leaking arguments:
	    // http://jsperf.com/closure-with-arguments
	    var i = arguments.length - 1
	    var args = new Array(i)
	    while (i--) {
	      args[i] = arguments[i + 1]
	    }
	    i = 0
	    cbs = cbs.length > 1
	      ? _.toArray(cbs)
	      : cbs
	    for (var l = cbs.length; i < l; i++) {
	      if (cbs[i].apply(this, args) === false) {
	        this._eventCancelled = true
	      }
	    }
	  }
	  return this
	}

	/**
	 * Recursively broadcast an event to all children instances.
	 *
	 * @param {String} event
	 * @param {...*} additional arguments
	 */

	exports.$broadcast = function (event) {
	  // if no child has registered for this event,
	  // then there's no need to broadcast.
	  if (!this._eventsCount[event]) return
	  var children = this._children
	  for (var i = 0, l = children.length; i < l; i++) {
	    var child = children[i]
	    child.$emit.apply(child, arguments)
	    if (!child._eventCancelled) {
	      child.$broadcast.apply(child, arguments)
	    }
	  }
	  return this
	}

	/**
	 * Recursively propagate an event up the parent chain.
	 *
	 * @param {String} event
	 * @param {...*} additional arguments
	 */

	exports.$dispatch = function () {
	  var parent = this.$parent
	  while (parent) {
	    parent.$emit.apply(parent, arguments)
	    parent = parent._eventCancelled
	      ? null
	      : parent.$parent
	  }
	  return this
	}

	/**
	 * Modify the listener counts on all parents.
	 * This bookkeeping allows $broadcast to return early when
	 * no child has listened to a certain event.
	 *
	 * @param {Vue} vm
	 * @param {String} event
	 * @param {Number} count
	 */

	var hookRE = /^hook:/
	function modifyListenerCount (vm, event, count) {
	  var parent = vm.$parent
	  // hooks do not get broadcasted so no need
	  // to do bookkeeping for them
	  if (!parent || !count || hookRE.test(event)) return
	  while (parent) {
	    parent._eventsCount[event] =
	      (parent._eventsCount[event] || 0) + count
	    parent = parent.$parent
	  }
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Create a child instance that prototypally inehrits
	 * data on parent. To achieve that we create an intermediate
	 * constructor with its prototype pointing to parent.
	 *
	 * @param {Object} opts
	 * @param {Function} [BaseCtor]
	 * @return {Vue}
	 * @public
	 */

	exports.$addChild = function (opts, BaseCtor) {
	  BaseCtor = BaseCtor || _.Vue
	  opts = opts || {}
	  var parent = this
	  var ChildVue
	  var inherit = opts.inherit !== undefined
	    ? opts.inherit
	    : BaseCtor.options.inherit
	  if (inherit) {
	    var ctors = parent._childCtors
	    ChildVue = ctors[BaseCtor.cid]
	    if (!ChildVue) {
	      ChildVue = function VueComponent (options) {
	        this.constructor = ChildVue
	        this._init(options)
	      }
	      ChildVue.options = BaseCtor.options
	      ChildVue.linker = BaseCtor.linker
	      ChildVue.prototype = this
	      ctors[BaseCtor.cid] = ChildVue
	    }
	  } else {
	    ChildVue = BaseCtor
	  }
	  opts._parent = parent
	  opts._root = parent.$root
	  var child = new ChildVue(opts)
	  return child
	}

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var compiler = __webpack_require__(10)

	/**
	 * Set instance target element and kick off the compilation
	 * process. The passed in `el` can be a selector string, an
	 * existing Element, or a DocumentFragment (for block
	 * instances).
	 *
	 * @param {Element|DocumentFragment|string} el
	 * @public
	 */

	exports.$mount = function (el) {
	  if (this._isCompiled) {
	    _.warn('$mount() should be called only once.')
	    return
	  }
	  if (!el) {
	    el = document.createElement('div')
	  } else if (typeof el === 'string') {
	    var selector = el
	    el = document.querySelector(el)
	    if (!el) {
	      _.warn('Cannot find element: ' + selector)
	      return
	    }
	  }
	  this._compile(el)
	  this._isCompiled = true
	  this._callHook('compiled')
	  if (_.inDoc(this.$el)) {
	    this._callHook('attached')
	    this._initDOMHooks()
	    ready.call(this)
	  } else {
	    this._initDOMHooks()
	    this.$once('hook:attached', ready)
	  }
	  return this
	}

	/**
	 * Mark an instance as ready.
	 */

	function ready () {
	  this._isAttached = true
	  this._isReady = true
	  this._callHook('ready')
	}

	/**
	 * Teardown the instance, simply delegate to the internal
	 * _destroy.
	 */

	exports.$destroy = function (remove, deferCleanup) {
	  this._destroy(remove, deferCleanup)
	}

	/**
	 * Partially compile a piece of DOM and return a
	 * decompile function.
	 *
	 * @param {Element|DocumentFragment} el
	 * @param {Vue} [host]
	 * @return {Function}
	 */

	exports.$compile = function (el, host) {
	  return compiler.compile(el, this.$options, true, host)(this, el)
	}

/***/ }
/******/ ])
});
;