/**
 * A binding is an observable that can have multiple
 * directives subscribing to it. It can also have multiple
 * other bindings as children to form a trie-like structure.
 *
 * All binding properties are prefixed with `_` so that they
 * don't conflict with children keys.
 *
 * @constructor
 */

function Binding () {
  this._subs = []
}

var p = Binding.prototype

/**
 * Add a child binding to the tree.
 *
 * @param {String} key
 * @param {Binding} child
 */

p._addChild = function (key, child) {
  child = child || new Binding()
  this[key] = child
  return child
}

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

p._addSub = function (sub) {
  this._subs.push(sub)
}

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

p._removeSub = function (sub) {
  this._subs.splice(this._subs.indexOf(sub), 1)
}

/**
 * Notify all subscribers of a new value.
 */

p._notify = function () {
  var i = this._subs.length
  while (i--) {
    this._subs[i].update()
  }
}

module.exports = Binding