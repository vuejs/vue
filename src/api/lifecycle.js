var _ = require('../util')
var compile = require('../compile/compile')
var transclude = require('../compile/transclude')

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
  this._callHook('beforeCompile')
  var options = this.$options
  if (options._linker) {
    // pre-compiled linker. this means the element has
    // been trancluded and compiled. just link it.
    this._initElement(el)
    options._linker(this, el)
  } else {
    el = transclude(el, options)
    this._initElement(el)
    var linker = compile(el, options)
    linker(this, el)
  }
  this._callHook('compiled')
  if (_.inDoc(this.$el)) {
    this._callHook('attached')
    ready.call(this)
  } else {
    this._emitter.once('hook:attached', ready)
  }
}

/**
 * Mark an instance as ready.
 */

function ready () {
  this._isAttached = true
  this._isReady = true
  this._callHook('ready')
  this._initDOMHooks()
}

/**
 * Teardown an instance, unobserves the data, unbind all the
 * directives, turn off all the event listeners, etc.
 *
 * @param {Boolean} remove - whether to remove the DOM node.
 * @public
 */

exports.$destroy = function (remove) {
  if (this._isDestroyed) {
    return
  }
  this._callHook('beforeDestroy')
  // remove DOM element
  if (remove) {
    if (this.$el === document.body) {
      this.$el.innerHTML = ''
    } else {
      this.$remove()
    }
  }
  var i
  // remove self from parent. only necessary
  // if this is called by the user.
  var parent = this.$parent
  if (parent && !parent._isDestroyed) {
    i = parent._children.indexOf(this)
    parent._children.splice(i)
  }
  // destroy all children.
  if (this._children) {
    i = this._children.length
    while (i--) {
      this._children[i].$destroy()
    }
  }
  // teardown data/scope
  this._teardownScope()
  // teardown all user watchers
  for (var id in this._watchers) {
    this.$unwatch(id)
  }
  // teardown all directives
  i = this._directives.length
  while (i--) {
    this._directives[i]._teardown()
  }
  // clean up
  this._children =
  this._watchers =
  this._activeWatcher =
  this.$el =
  this.$el.__vue__ =
  this._directives = null
  // call the last hook...
  this._isDestroyed = true
  this._callHook('afterDestroy')
  // turn off all instance listeners.
  this._emitter.off()
}