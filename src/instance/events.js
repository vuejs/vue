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
      for (i = 0, j = handlers.length; i < j; i++) {
        var handler = (methods && typeof handlers[i] === 'string')
          ? methods[handlers[i]]
          : handlers[i]
        this.$on(e, handler)
      }
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
}