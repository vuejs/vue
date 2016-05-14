/* @flow */

import type VNode from '../vdom/vnode'
import Watcher from '../observer/watcher'
import { warn, validateProp, remove } from '../util/index'
import { observerState } from '../observer/index'
import { updateListeners } from '../vdom/helpers'

export function initLifecycle (vm: Component) {
  const options = vm.$options

  vm.$parent = options.parent
  vm.$root = vm.$parent ? vm.$parent.$root : vm
  if (vm.$parent) {
    vm.$parent.$children.push(vm)
  }

  vm.$children = []
  vm.$refs = {}

  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._mount = function (): Component {
    const vm: Component = this
    if (!vm.$options.render) {
      vm.$options.render = () => vm.$createElement('div')
      if (process.env.NODE_ENV !== 'production') {
        if (vm.$options.template) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'option is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          )
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          )
        }
      }
    }
    callHook(vm, 'beforeMount')
    vm._watcher = new Watcher(vm, vm._render, vm._update)
    vm._update(vm._watcher.value)
    vm._isMounted = true
    // root instance, call mounted on self
    if (vm.$root === vm) {
      callHook(vm, 'mounted')
    }
    return vm
  }

  Vue.prototype._update = function (vnode: VNode) {
    const vm: Component = this
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
    if (!vm._vnode) {
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      vm.$el = vm.__patch__(vm.$el, vnode)
    } else {
      vm.$el = vm.__patch__(vm._vnode, vnode)
    }
    vm._vnode = vnode
    // update parent vnode element after patch
    const parentNode = vm.$options._parentVnode
    if (parentNode) {
      parentNode.elm = vm.$el
    }
    if (vm._isMounted) {
      callHook(vm, 'updated')
    }
  }

  Vue.prototype._updateFromParent = function (
    propsData: ?Object,
    listeners: ?Object,
    parentVnode: VNode,
    renderChildren: ?VNodeChildren
  ) {
    const vm: Component = this
    vm.$options._parentVnode = parentVnode
    vm.$options._renderChildren = renderChildren
    // update props
    if (propsData && vm.$options.props) {
      observerState.shouldConvert = false
      const propKeys = vm.$options.propKeys
      for (let i = 0; i < propKeys.length; i++) {
        const key = propKeys[i]
        vm[key] = validateProp(vm, key, propsData)
      }
      observerState.shouldConvert = true
    }
    // update listeners
    if (listeners) {
      const oldListeners = vm.$options._parentListeners
      vm.$options._parentListeners = listeners
      updateListeners(listeners, oldListeners || {}, (event, handler) => {
        vm.$on(event, handler)
      })
    }
  }

  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    vm._watcher.update()
  }

  Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed) {
      remove(parent.$children, vm)
    }
    // teardown watchers
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.removeVm(vm)
    }
    // call the last hook...
    vm._isDestroyed = true
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
  }
}

export function callHook (vm: Component, hook: string) {
  vm.$emit('pre-hook:' + hook)
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm)
    }
  }
  vm.$emit('hook:' + hook)
}
