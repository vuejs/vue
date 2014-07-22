var _ = require('../util')

/**
 * Set instance target element and kick off the compilation process.
 * The passed in `el` can be a selector string, an existing Element,
 * or a DocumentFragment (for block instances).
 *
 * @param {Element|DocumentFragment|string} el
 * @public
 */

exports.$mount = function (el) {
  if (typeof el === 'string') {
    el = document.querySelector(el)
  }
  // If the passed in `el` is a DocumentFragment, the instance is
  // considered a "block instance" which manages not a single element,
  // but multiple elements. A block instance's `$el` is an Array of
  // the elements it manages.
  this._isBlock = el instanceof DocumentFragment
  this.$el = this._isBlock
    ? _.toArray(el.childNodes)
    : el
  this._compile()
  this._isMounted = true
}

/**
 * Teardown an instance, unobserves the data, unbind all the
 * directives, turn off all the event listeners, etc.
 *
 * @param {Boolean} remove - whether to remove the DOM node.
 * @public
 */

exports.$destroy = function (remove) {
  
}