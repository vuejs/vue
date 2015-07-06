// NOTE: the prop internal directive is compiled and linked
// during _initScope(), before the created hook is called.
// The purpose is to make the initial prop values available
// inside `created` hooks and `data` functions.

var _ = require('../util')
var Watcher = require('../watcher')
var bindingModes = require('../config')._propBindingModes

module.exports = {

  bind: function () {

    var child = this.vm
    var parent = child._context
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

    // set the child initial value.
    // !!! We need to set it also on raw data here, because
    // props are initialized before data is fully observed
    var value = this.parentWatcher.value
    if (childKey === '$data') {
      child._data = value
    } else {
      _.initProp(child, prop, value)
    }

    // only setup two-way binding if this is not a one-way
    // binding.
    if (prop.mode === bindingModes.TWO_WAY) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this
      child.$once('hook:created', function () {
        self.childWatcher = new Watcher(
          child,
          childKey,
          withLock(function (val) {
            parent.$set(parentKey, val)
          })
        )
      })
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
