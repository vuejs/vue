var _ = require('../util')
var Watcher = require('../watcher')
var bindingModes = require('../config')._propBindingModes

module.exports = {

  bind: function () {

    var child = this.vm
    var parent = child.$parent
    // passed in from compiler directly
    var prop = this._descriptor
    var childKey = prop.path
    var parentKey = prop.parentPath

    // simple lock to avoid circular updates.
    // without this it would stabilize too, but this makes
    // sure it doesn't cause other watchers to re-evaluate.
    var locked = false
    function withLock (fn) {
      return function (val) {
        if (!locked) {
          locked = true
          fn(val)
          _.nextTick(function () {
            locked = false
          })
        }
      }
    }

    this.parentWatcher = new Watcher(
      parent,
      parentKey,
      withLock(function (val) {
        if (_.assertProp(prop, val)) {
          child[childKey] = val
        }
      })
    )
    
    // set the child initial value first, before setting
    // up the child watcher to avoid triggering it
    // immediately.
    var value = this.parentWatcher.value
    if (_.assertProp(prop, value)) {
      child.$set(childKey, value)
    }

    // only setup two-way binding if this is not a one-way
    // binding.
    if (prop.mode === bindingModes.TWO_WAY) {
      this.childWatcher = new Watcher(
        child,
        childKey,
        withLock(function (val) {
          parent.$set(parentKey, val)
        })
      )
    }
  },

  unbind: function () {
    if (this.parentWatcher) {
      this.parentWatcher.teardown()
    }
    if (this.childWatcher) {
      this.childWatcher.teardown()
    }
  }
}
