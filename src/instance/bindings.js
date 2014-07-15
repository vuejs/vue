var Binding = require('../binding')

/**
 * Setup the bindings graph.
 */

exports._initBindings = function () {
  var root = this._rootBinding = new Binding()
  // the $data binding points to the root itself!
  root.addChild('$data', root)
  // point $parent and $root bindings to their
  // repective owners.
  if (this.$parent) {
    root.addChild('$parent', this.$parent._rootBinding)
    root.addChild('$root', this.$root._rootBinding)
  }
}

/**
 * Create a binding
 */

exports._createBinding = function (key) {
  
}