var _ = require('../util')

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
  this._initElement(el)
  this._compile()
  this._isCompiled = true
  this._callHook('compiled')
  this.$once('hook:attached', function () {
    this._isAttached = true
    this._isReady = true
    this._callHook('ready')
    this._initDOMHooks()
  })
  if (_.inDoc(this.$el)) {
    this._callHook('attached')
  }
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