/**
 * Setup the instance's option events
 */

exports._initEvents = function () {
  var events = this.$options.events
  if (events) {
    var handlers, e, i, j
    for (e in events) {
      handlers = events[e]
      for (i = 0, j = handlers.length; i < j; i++) {
        this.$on(e, handlers[i])
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