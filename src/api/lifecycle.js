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
  this._initElement(el)
  this._compile()
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