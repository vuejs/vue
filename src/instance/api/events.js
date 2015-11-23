import { toArray } from '../../util/index'

export default function (Vue) {

  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = []))
      .push(fn)
    modifyListenerCount(this, event, 1)
    return this
  }

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this
    function on () {
      self.$off(event, on)
      fn.apply(this, arguments)
    }
    on.fn = fn
    this.$on(event, on)
    return this
  }

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs
    // all
    if (!arguments.length) {
      if (this.$parent) {
        for (event in this._events) {
          cbs = this._events[event]
          if (cbs) {
            modifyListenerCount(this, event, -cbs.length)
          }
        }
      }
      this._events = {}
      return this
    }
    // specific event
    cbs = this._events[event]
    if (!cbs) {
      return this
    }
    if (arguments.length === 1) {
      modifyListenerCount(this, event, -cbs.length)
      this._events[event] = null
      return this
    }
    // specific handler
    var cb
    var i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        modifyListenerCount(this, event, -1)
        cbs.splice(i, 1)
        break
      }
    }
    return this
  }

  /**
   * Trigger an event on self.
   *
   * @param {String} event
   * @return {Boolean} shouldPropagate
   */

  Vue.prototype.$emit = function (event) {
    var cbs = this._events[event]
    var shouldPropagate = !cbs
    if (cbs) {
      cbs = cbs.length > 1
        ? toArray(cbs)
        : cbs
      var args = toArray(arguments, 1)
      for (var i = 0, l = cbs.length; i < l; i++) {
        var res = cbs[i].apply(this, args)
        if (res === true) {
          shouldPropagate = true
        }
      }
    }
    return shouldPropagate
  }

  /**
   * Recursively broadcast an event to all children instances.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$broadcast = function (event) {
    // if no child has registered for this event,
    // then there's no need to broadcast.
    if (!this._eventsCount[event]) return
    var children = this.$children
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i]
      var shouldPropagate = child.$emit.apply(child, arguments)
      if (shouldPropagate) {
        child.$broadcast.apply(child, arguments)
      }
    }
    return this
  }

  /**
   * Recursively propagate an event up the parent chain.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$dispatch = function () {
    this.$emit.apply(this, arguments)
    var parent = this.$parent
    while (parent) {
      var shouldPropagate = parent.$emit.apply(parent, arguments)
      parent = shouldPropagate
        ? parent.$parent
        : null
    }
    return this
  }

  /**
   * Modify the listener counts on all parents.
   * This bookkeeping allows $broadcast to return early when
   * no child has listened to a certain event.
   *
   * @param {Vue} vm
   * @param {String} event
   * @param {Number} count
   */

  var hookRE = /^hook:/
  function modifyListenerCount (vm, event, count) {
    var parent = vm.$parent
    // hooks do not get broadcasted so no need
    // to do bookkeeping for them
    if (!parent || !count || hookRE.test(event)) return
    while (parent) {
      parent._eventsCount[event] =
        (parent._eventsCount[event] || 0) + count
      parent = parent.$parent
    }
  }
}
