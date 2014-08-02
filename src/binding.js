/**
 * Assign unique id to each binding created so that directives
 * can have an easier time avoiding duplicates and refreshing
 * dependencies.
 */

var uid = 0

/**
 * A binding is an observable that can have multiple directives
 * subscribing to it. It can also have multiple other bindings
 * as children to form a trie-like structure.
 *
 * @constructor
 */

function Binding () {
  this.id = uid++
  this.children = Object.create(null)
  this.subs = []
}

var p = Binding.prototype

/**
 * Add a child binding to the tree.
 *
 * @param {String} key
 * @param {Binding} child
 */

p.addChild = function (key, child) {
  child = child || new Binding()
  this.children[key] = child
  return child
}

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
  this.subs.splice(this.subs.indexOf(sub), 1)
}

/**
 * Notify all subscribers of a new value.
 */

p.notify = function () {
  for (var i = 0, l = this.subs.length; i < l; i++) {
    this.subs[i]._update(this)
  }
}

module.exports = Binding