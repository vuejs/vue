var inDoc = require('../util').inDoc

/**
 * Setup the instance's option events.
 * If the value is a string, we pull it from the
 * instance's methods by name.
 */

exports._initEvents = function () {
  var options = this.$options
  var emitter = this._emitter
  var events = options.events
  var methods = options.methods
  if (events) {
    var handlers, e, i, j
    for (e in events) {
      handlers = events[e]
      for (i = 0, j = handlers.length; i < j; i++) {
        var handler = typeof handlers[i] === 'string'
          ? methods && methods[handlers[i]]
          : handlers[i]
        emitter.on(e, handler)
      }
    }
  }
}

/**
 * Setup recursive attached/detached calls
 */

exports._initDOMHooks = function () {
  var emitter = this._emitter
  emitter.on('hook:attached', function () {
    this._isAttached = true
    var children = this._children
    if (!children) return
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i]
      if (!child._isAttached && inDoc(child.$el)) {
        child._callHook('attached')
      }
    }
  })
  emitter.on('hook:detached', function () {
    this._isAttached = false
    var children = this._children
    if (!children) return
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i]
      if (child._isAttached && !inDoc(child.$el)) {
        child._callHook('detached')
      }
    }
  })
}

/**
 * Trigger all handlers for a hook
 *
 * @param {String} hook
 */

exports._callHook = function (hook) {
  var handlers = this.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(this)
    }
  }
  this._emitter.emit('hook:' + hook)
}