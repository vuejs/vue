/**
 * Proxy basic event methods on the internal emitter.
 */

;['emit', 'on', 'off', 'once'].forEach(function (method) {
  var realMethod = method === 'emit'
    ? 'applyEmit'
    : method
  exports['$' + method] = function () {
    this._emitter[realMethod].apply(
      this._emitter,
      arguments
    )
  }
})

/**
 * Recursively broadcast an event to all children instances.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$broadcast = function () {
  var children = this._children
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i]
    var emitter = child._emitter
    emitter.applyEmit.apply(emitter, arguments)
    if (!emitter._cancelled) {
      child.$broadcast.apply(child, arguments)
    }
  }
}

/**
 * Recursively propagate an event up the parent chain.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$dispatch = function () {
  var emitter = this._emitter
  emitter.applyEmit.apply(emitter, arguments)
  if (!emitter._cancelled) {
    var parent = this.$parent
    if (parent) {
      parent.$dispatch.apply(parent, arguments)
    }
  }
}