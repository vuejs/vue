/* @flow */

import Watcher from '../observer/watcher'
import { emptyVNode } from '../vdom/vnode'
import { observerState } from '../observer/index'
import { warn, validateProp, remove, noop } from '../util/index'

export function initLifecycle (vm: Component) {
  const options = vm.$options

  vm.$parent = options.parent
  vm.$root = vm.$parent ? vm.$parent.$root : vm
  if (vm.$parent) {
    vm.$parent.$children.push(vm)
  }

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._mount = function (
    el?: Element | void,
    hydrating?: boolean
  ): Component {
    const vm: Component = this
    vm.$el = el
    if (!vm.$options.render) {
      vm.$options.render = () => emptyVNode
      if (process.env.NODE_ENV !== 'production') {
        /* istanbul ignore if */
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
    vm._watcher = new Watcher(vm, () => {
      vm._update(vm._render(), hydrating)
    }, noop)
    hydrating = false
    vm._isMounted = true
    // root instance, call mounted on self
    if (vm.$root === vm) {
      callHook(vm, 'mounted')
    }
    return vm
  }

  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
    if (!vm._vnode) {
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating)
    } else {
      vm.$el = vm.__patch__(vm._vnode, vnode)
    }
    vm._vnode = vnode
    // update parent vnode element after patch
    const parentNode = vm.$options._parentVnode
    if (parentNode) {
      parentNode.elm = vm.$el
      // update parent $el if the parent is HOC
      // this is necessary because child is updated after parent
      if (vm.$parent && parentNode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el
      }
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
      const propKeys = vm.$options._propKeys || []
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
      vm._updateListeners(listeners, oldListeners)
    }
  }

  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
    if (vm._watchers.length) {
      for (let i = 0; i < vm._watchers.length; i++) {
        vm._watchers[i].update(true /* shallow */)
      }
    }
  }

  Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
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
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
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
