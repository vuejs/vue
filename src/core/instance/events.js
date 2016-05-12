/* @flow */

import type Vue from './index'
import { toArray } from '../util/index'
import { updateListeners } from '../vdom/helpers'

export function initEvents (vm: Vue) {
  vm._events = Object.create(null)
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateListeners(listeners, {}, (event, handler) => {
      vm.$on(event, handler)
    })
  }
}

export function eventsMixin (Vue: Class<Vue>) {
  Vue.prototype.$on = function (event: string, fn: Function): Vue {
    (this._events[event] || (this._events[event] = [])).push(fn)
    return this
  }

  Vue.prototype.$once = function (event: string, fn: Function): Vue {
    const self = this
    function on () {
      self.$off(event, on)
      fn.apply(this, arguments)
    }
    on.fn = fn
    this.$on(event, on)
    return this
  }

  Vue.prototype.$off = function (event?: string, fn?: Function): Vue {
    // all
    if (!arguments.length) {
      this._events = Object.create(null)
      return this
    }
    // specific event
    const cbs = this._events[event]
    if (!cbs) {
      return this
    }
    if (arguments.length === 1) {
      this._events[event] = null
      return this
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
    return this
  }

  Vue.prototype.$emit = function (event: string): Vue {
    let cbs = this._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      for (let i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(this, args)
      }
    }
    return this
  }
}
