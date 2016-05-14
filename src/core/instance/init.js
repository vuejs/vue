/* @flow */

import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { initLifecycle, callHook } from './lifecycle'
import { mergeOptions } from '../util/index'

let uid = 0

export function init (vm: Component, options?: ComponentOptions) {
  // a uid
  vm._uid = uid++
  // a flag to avoid this being observed
  vm._isVue = true
  // merge options
  vm.$options = mergeOptions(
    vm.constructor.options,
    options || {},
    vm
  )
  if (process.env.NODE_ENV !== 'production') {
    initProxy(vm)
  } else {
    vm._renderProxy = vm
  }
  initLifecycle(vm)
  initEvents(vm)
  callHook(vm, 'init')
  initState(vm)
  callHook(vm, 'created')
  initRender(vm)
}
