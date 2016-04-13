export function callHook (vm, hook) {
  vm.$emit('pre-hook:' + hook)
  var handlers = vm.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm)
    }
  }
  vm.$emit('hook:' + hook)
}

export function initLifecycle (vm) {
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function lifecycleMixin (Vue) {
  Vue.prototype.$destroy = function () {
    if (this._isDestroyed) {
      return
    }
    this._callHook('beforeDestroy')
    this._isBeingDestroyed = true
    // teardown watchers
    let i = this._watchers.length
    while (i--) {
      this._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data.__ob__) {
      this._data.__ob__.removeVm(this)
    }
    // call the last hook...
    this._isDestroyed = true
    this._callHook('destroyed')
    // turn off all instance listeners.
    this.$off()
  }
}
