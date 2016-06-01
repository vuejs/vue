/* @flow */

import { bind, toArray } from '../util/index'
import { updateListeners } from '../vdom/helpers'

export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  // init parent attached events
  const listeners = vm.$options._parentListeners
  const on = bind(vm.$on, vm)
  const off = bind(vm.$off, vm)
  vm._updateListeners = (listeners, oldListeners) => {
    updateListeners(listeners, oldListeners || {}, on, off)
  }
  if (listeners) {
    vm._updateListeners(listeners)
  }
}

export function eventsMixin (Vue: Class<Component>) {
  Vue.prototype.$on = function (event: string, fn: Function): Component {
    const vm: Component = this
    ;(vm._events[event] || (vm._events[event] = [])).push(fn)
    return vm
  }

  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  Vue.prototype.$off = function (event?: string, fn?: Function): Component {
    const vm: Component = this
    // all
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // specific event
    const cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null
      return vm
    }
    // specific handler
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      for (let i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args)
      }
    }
    return vm
  }
}
