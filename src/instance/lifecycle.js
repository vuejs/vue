var _ = require('../util')
var Directive = require('../directive')
var compiler = require('../compiler')

/**
 * Update v-ref for component.
 *
 * @param {Boolean} remove
 */

exports._updateRef = function (remove) {
  var ref = this.$options._ref
  if (ref) {
    var refs = (this._scope || this._context).$refs
    if (remove) {
      if (refs[ref] === this) {
        refs[ref] = null
      }
    } else {
      refs[ref] = this
    }
  }
}

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
  var contextOptions = this._context && this._context.$options
  var rootLinker = compiler.compileRoot(el, options, contextOptions)

  // compile and link the rest
  var contentLinkFn
  var ctor = this.constructor
  // component compilation can be cached
  // as long as it's not using inline-template
  if (options._linkerCachable) {
    contentLinkFn = ctor.linker
    if (!contentLinkFn) {
      contentLinkFn = ctor.linker = compiler.compile(el, options)
    }
  }

  // link phase
  // make sure to link root with prop scope!
  var rootUnlinkFn = rootLinker(this, el, this._scope)
  var contentUnlinkFn = contentLinkFn
    ? contentLinkFn(this, el)
    : compiler.compile(el, options)(this, el)

  // register composite unlink function
  // to be called during instance destruction
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

  this._isCompiled = true
  this._callHook('compiled')
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
    this._isFragment = true
    this.$el = this._fragmentStart = el.firstChild
    this._fragmentEnd = el.lastChild
    // set persisted text anchors to empty
    if (this._fragmentStart.nodeType === 3) {
      this._fragmentStart.data = this._fragmentEnd.data = ''
    }
    this._fragment = el
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
 * @param {Vue} [host] - transclusion host component
 * @param {Object} [scope] - v-for scope
 * @param {Fragment} [frag] - owner fragment
 */

exports._bindDir = function (descriptor, node, host, scope, frag) {
  this._directives.push(
    new Directive(descriptor, this, node, host, scope, frag)
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
    if (!deferCleanup) {
      this._cleanup()
    }
    return
  }
  this._callHook('beforeDestroy')
  this._isBeingDestroyed = true
  var i
  // remove self from parent. only necessary
  // if parent is not being destroyed as well.
  var parent = this.$parent
  if (parent && !parent._isBeingDestroyed) {
    parent.$children.$remove(this)
    // unregister ref (remove: true)
    this._updateRef(true)
  }
  // destroy all children.
  i = this.$children.length
  while (i--) {
    this.$children[i].$destroy()
  }
  // teardown props
  if (this._propsUnlinkFn) {
    this._propsUnlinkFn()
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
  if (this._isDestroyed) {
    return
  }
  // remove self from owner fragment
  // do it in cleanup so that we can call $destroy with
  // defer right when a fragment is about to be removed.
  if (this._frag) {
    this._frag.children.$remove(this)
  }
  // remove reference from data ob
  // frozen object may not have observer.
  if (this._data.__ob__) {
    this._data.__ob__.removeVm(this)
  }
  // Clean up references to private properties and other
  // instances. preserve reference to _data so that proxy
  // accessors still work. The only potential side effect
  // here is that mutating the instance after it's destroyed
  // may affect the state of other components that are still
  // observing the same object, but that seems to be a
  // reasonable responsibility for the user rather than
  // always throwing an error on them.
  this.$el =
  this.$parent =
  this.$root =
  this.$children =
  this._watchers =
  this._context =
  this._scope =
  this._directives = null
  // call the last hook...
  this._isDestroyed = true
  this._callHook('destroyed')
  // turn off all instance listeners.
  this.$off()
}
