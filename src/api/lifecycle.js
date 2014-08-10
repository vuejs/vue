/**
 * Set instance target element and kick off the compilation process.
 * The passed in `el` can be a selector string, an existing Element,
 * or a DocumentFragment (for block instances).
 *
 * @param {Element|DocumentFragment|string} el
 * @public
 */

exports.$mount = function (el) {
  this._callHook('beforeMount')
  this._initElement(el)
  this._compile()
  this._callHook('ready')
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
  this._isDestroyed = true
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
  i = this._children.length
  while (i--) {
    this._children[i].$destroy()
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
  this._callHook('afterDestroy')
}