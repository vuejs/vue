/**
 * A directive links a DOM element with a piece of data, which can
 * be either simple paths or computed properties. It subscribes to
 * a list of dependencies (Bindings) and refreshes the list during
 * its getter evaluation.
 *
 * @param {String} type
 * @param {Node} el
 * @param {Vue} vm
 * @param {String} expression
 * @constructor
 */

function Directive (type, el, vm, expression) {
  
}

var p = Directive.prototype

p._update = function () {
  
}

module.exports = Directive