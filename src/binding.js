function Binding () {
    this.children = Object.create(null)
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
 * Notify all subscribers of it self
 */

p.notify = function () {
  
}

module.exports = Binding