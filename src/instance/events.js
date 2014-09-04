var _ = require('../util')
var inDoc = _.inDoc

/**
 * Setup the instance's option events.
 * If the value is a string, we pull it from the
 * instance's methods by name.
 */

exports._initEvents = function () {
  var options = this.$options
  var events = options.events
  var methods = options.methods
  if (events) {
    var handlers, e, i, j
    for (e in events) {
      handlers = events[e]
      if (_.isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(this, e, handlers[i], methods)
        }
      } else {
        register(this, e, handlers, methods)
      }
    }
  }
}

/**
 * Helper to register an event.
 *
 * @param {Vue} vm
 * @param {String} event
 * @param {*} handler
 * @param {Object|undefined} methods
 */

function register (vm, event, handler, methods) {
  var type = typeof handler
  if (type === 'function') {
    vm.$on(event, handler)
  } else if (type === 'string') {
    var method = methods && methods[handler]
    if (method) {
      vm.$on(event, method)
    } else {
      _.warn(
        'Unknown method: "' + handler + '" when ' +
        'registering callback for event: "' + event + '".'
      )
    }
  }
}

/**
 * Setup recursive attached/detached calls
 */

exports._initDOMHooks = function () {
  this.$on('hook:attached', onAttached)
  this.$on('hook:detached', onDetached)
}

/**
 * Callback to recursively call attached hook on children
 */

function onAttached () {
  this._isAttached = true
  var children = this._children
  if (!children) return
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i]
    if (!child._isAttached && inDoc(child.$el)) {
      child._callHook('attached')
    }
  }
}

/**
 * Callback to recursively call detached hook on children
 */

function onDetached () {
  this._isAttached = false
  var children = this._children
  if (!children) return
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i]
    if (child._isAttached && !inDoc(child.$el)) {
      child._callHook('detached')
    }
  }
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
  this.$emit('hook:' + hook)
}