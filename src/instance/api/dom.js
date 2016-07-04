import {
  nextTick,
  inDoc,
  removeNodeRange,
  mapNodeRange,
  before,
  remove
} from '../../util/index'

import {
  beforeWithTransition,
  appendWithTransition,
  removeWithTransition
} from '../../transition/index'

export default function (Vue) {
  /**
   * Convenience on-instance nextTick. The callback is
   * auto-bound to the instance, and this avoids component
   * modules having to rely on the global Vue.
   *
   * @param {Function} fn
   */

  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this)
  }

  /**
   * Append instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$appendTo = function (target, cb, withTransition) {
    return insert(
      this, target, cb, withTransition,
      append, appendWithTransition
    )
  }

  /**
   * Prepend instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$prependTo = function (target, cb, withTransition) {
    target = query(target)
    if (target.hasChildNodes()) {
      this.$before(target.firstChild, cb, withTransition)
    } else {
      this.$appendTo(target, cb, withTransition)
    }
    return this
  }

  /**
   * Insert instance before target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$before = function (target, cb, withTransition) {
    return insert(
      this, target, cb, withTransition,
      beforeWithCb, beforeWithTransition
    )
  }

  /**
   * Insert instance after target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$after = function (target, cb, withTransition) {
    target = query(target)
    if (target.nextSibling) {
      this.$before(target.nextSibling, cb, withTransition)
    } else {
      this.$appendTo(target.parentNode, cb, withTransition)
    }
    return this
  }

  /**
   * Remove instance from DOM
   *
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$remove = function (cb, withTransition) {
    if (!this.$el.parentNode) {
      return cb && cb()
    }
    var inDocument = this._isAttached && inDoc(this.$el)
    // if we are not in document, no need to check
    // for transitions
    if (!inDocument) withTransition = false
    var self = this
    var realCb = function () {
      if (inDocument) self._callHook('detached')
      if (cb) cb()
    }
    if (this._isFragment) {
      removeNodeRange(
        this._fragmentStart,
        this._fragmentEnd,
        this, this._fragment, realCb
      )
    } else {
      var op = withTransition === false
        ? removeWithCb
        : removeWithTransition
      op(this.$el, this, realCb)
    }
    return this
  }

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

  function insert (vm, target, cb, withTransition, op1, op2) {
    target = query(target)
    var targetIsDetached = !inDoc(target)
    var op = withTransition === false || targetIsDetached
        ? op1
        : op2
    var shouldCallHook =
      !targetIsDetached &&
      !vm._isAttached &&
      !inDoc(vm.$el)
    if (vm._isFragment) {
      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
        op(node, target, vm)
      })
      cb && cb()
    } else {
      op(vm.$el, target, vm, cb)
    }
    if (shouldCallHook) {
      vm._callHook('attached')
    }
    return vm
  }

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

  function query (el) {
    return typeof el === 'string'
      ? document.querySelector(el)
      : el
  }

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function append (el, target, vm, cb) {
    target.appendChild(el)
    if (cb) cb()
  }

  /**
   * InsertBefore operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function beforeWithCb (el, target, vm, cb) {
    before(el, target)
    if (cb) cb()
  }

  /**
   * Remove operation that takes a callback.
   *
   * @param {Node} el
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function removeWithCb (el, vm, cb) {
    remove(el)
    if (cb) cb()
  }
}
