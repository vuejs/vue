import Watcher from '../observer/watcher'
import { query, toArray } from '../util/index'

export function initLifecycle (vm) {
  vm.$children = []
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
  vm.$refs = {}
  vm.$els = {}

  const options = vm.$options

  // parent
  vm.$parent = options.parent
  vm.$root = vm.$parent ? vm.$parent.$root : vm
  if (vm.$parent) {
    vm.$parent.$children.push(vm)
  }

  // context & ref
  vm._context = options._context
  vm._ref = options._renderData && options._renderData.ref
  if (vm._ref) {
    vm._context.$refs[vm._ref] = vm
  }
}

export function lifecycleMixin (Vue) {
  Vue.prototype.$mount = function (el) {
    callHook(this, 'beforeMount')
    el = this.$el = el && query(el)
    if (el) {
      // clean element
      el.innerHTML = ''
      if (el.hasAttributes()) {
        const attrs = toArray(el.attributes)
        for (let i = 0; i < attrs.length; i++) {
          el.removeAttribute(attrs[i].name)
        }
      }
    }
    this._watcher = new Watcher(this, this._render, this._update)
    this._update(this._watcher.value)
    callHook(this, 'mounted')
    this._mounted = true
    // root instance, call ready on self
    if (this.$root === this) {
      callHook(this, 'ready')
    }
    return this
  }

  Vue.prototype.$destroy = function () {
    if (this._isDestroyed) {
      return
    }
    callHook(this, 'beforeDestroy')
    this._isBeingDestroyed = true
    // remove self from parent
    const parent = this.$parent
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this)
    }
    // unregister ref
    if (this._ref) {
      this._context.$refs[this._ref] = undefined
    }
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
    callHook(this, 'destroyed')
    // turn off all instance listeners.
    this.$off()
  }
}

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
