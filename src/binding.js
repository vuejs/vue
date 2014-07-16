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
  this.uid = uid++
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
  
}

/**
 * Traverse along a path and trigger updates
 * along the way.
 *
 * @param {String} path
 */

p.updatePath = function (path) {
  
}

/**
 * Trigger updates for the subtree starting at
 * self as root.
 */

p.updateSubTree = function () {
  
}

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

p.addSubscriber = function (sub) {
  
}

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

p.removeSubscriber = function (sub) {
  
}

/**
 * Notify all subscribers of a new value.
 */

p.publish = function () {
  
}

module.exports = Binding