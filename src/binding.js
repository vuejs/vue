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
 * Return the child at the given key
 *
 * @param {String} key
 * @return {Binding}
 */

p.getChild = function (key) {
  return this.children[key]
}

/**
 * Traverse along a path and trigger updates
 * along the way.
 *
 * @param {Array} path
 */

p.updatePath = function (path) {
  var b = this
  for (var i = 0, l = path.length; i < l; i++) {
    if (!b) return
    b.notify()
    b = b.children[path[i]]
  }
  // for the destination of path, we need to trigger
  // change for every children. i.e. when an object is
  // swapped, all its content need to be updated.
  if (b) {
    b.updateTree()
  }
}

/**
 * Trigger updates for the subtree starting at
 * self as root. Recursive.
 */

p.updateTree = function () {
  this.notify()
  for (var key in this.children) {
    this.children[key].updateTree()
  }
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