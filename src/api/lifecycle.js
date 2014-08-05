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
  this._callHook('beforeDestroy')
  if (remove) {
    // TODO
  }
  this._callHook('afterDestroy')
}