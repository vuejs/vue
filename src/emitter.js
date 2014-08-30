var _ = require('./util')

/**
 * Simple event emitter based on component/emitter.
 *
 * @constructor
 * @param {Object} ctx - the context to call listners with.
 */

function Emitter (ctx) {
  this._cancelled = false
  this._ctx = ctx || null
}

var p = Emitter.prototype

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */

p.on = function (event, fn) {
  this._cbs = this._cbs || {}
  ;(this._cbs[event] || (this._cbs[event] = []))
    .push(fn)
  return this
}

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */

p.once = function (event, fn) {
  var self = this
  this._cbs = this._cbs || {}
  function on () {
    self.off(event, on)
    fn.apply(this, arguments)
  }
  on.fn = fn
  this.on(event, on)
  return this
}

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */
 
p.off = function (event, fn) {
  this._cbs = this._cbs || {}
  // all
  if (!arguments.length) {
    this._cbs = {}
    return this
  }
  // specific event
  var callbacks = this._cbs[event]
  if (!callbacks) return this
  // remove all handlers
  if (arguments.length === 1) {
    this._cbs[event] = null
    return this
  }
  // remove specific handler
  var cb
  var i = callbacks.length
  while (i--) {
    cb = callbacks[i]
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1)
      break
    }
  }
  return this
}

/**
 * The internal, faster emit with fixed amount of arguments
 * using Function.call. This emit assumes that callbacks
 * triggered will not modify the callback list being
 * iterated through.
 *
 * @param {Object} event
 * @return {Emitter}
 */

p.emit = function (event, a, b, c, d) {
  this._cbs = this._cbs || {}
  var callbacks = this._cbs[event]
  if (callbacks) {
    var ctx = this._ctx
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callbacks[i].call(ctx, a, b, c, d)
    }
  }
  return this
}

/**
 * The external emit using Function.apply, used
 * by Vue instance event methods.
 *
 * @param {Object} event
 * @return {Emitter}
 */

p.applyEmit = function (event) {
  this._cancelled = false
  this._cbs = this._cbs || {}
  var callbacks = this._cbs[event]
  if (callbacks) {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length - 1
    var args = new Array(i)
    while (i--) {
      args[i] = arguments[i + 1]
    }
    callbacks = _.toArray(callbacks)
    i = 0
    for (var l = callbacks.length; i < l; i++) {
      if (callbacks[i].apply(this._ctx, args) === false) {
        this._cancelled = true
      }
    }
  }
  return this
}

module.exports = Emitter