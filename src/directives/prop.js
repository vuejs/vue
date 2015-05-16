var _ = require('../util')
var Watcher = require('../watcher')

module.exports = {

  bind: function () {

    var child = this.vm
    var parent = child.$parent
    var childKey = this.arg
    var parentKey = this.expression

    // simple lock to avoid circular updates.
    // without this it would stabilize too, but this makes
    // sure it doesn't cause other watchers to re-evaluate.
    var locked = false
    var lock = function () {
      locked = true
      _.nextTick(unlock)
    }
    var unlock = function () {
      locked = false
    }

    this.parentWatcher = new Watcher(
      parent,
      parentKey,
      function (val) {
        if (!locked) {
          lock()
          child.$set(childKey, val)
        }
      }
    )
    
    // set the child initial value first, before setting
    // up the child watcher to avoid triggering it
    // immediately.
    child.$set(childKey, this.parentWatcher.value)

    // only setup two-way binding if this is not a one-way
    // binding.
    if (!this._descriptor.oneWay) {
      this.childWatcher = new Watcher(
        child,
        childKey,
        function (val) {
          if (!locked) {
            lock()
            parent.$set(parentKey, val)
          }
        }
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