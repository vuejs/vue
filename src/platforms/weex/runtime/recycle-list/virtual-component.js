/* @flow */

// https://github.com/Hanks10100/weex-native-directive/tree/master/component

import { mergeOptions } from 'core/util/index'
import { initProxy } from 'core/instance/proxy'
import { initState } from 'core/instance/state'
import { initRender } from 'core/instance/render'
import { initEvents } from 'core/instance/events'
import { initProvide, initInjections } from 'core/instance/inject'
import { initLifecycle, mountComponent, callHook } from 'core/instance/lifecycle'
import { initInternalComponent, resolveConstructorOptions } from 'core/instance/init'
import { registerComponentHook, updateComponentData } from '../../util/index'

let uid = 0

// override Vue.prototype._init
function initVirtualComponent (options: Object = {}) {
  const vm: Component = this
  const componentId = options.componentId

  // virtual component uid
  vm._uid = `virtual-component-${uid++}`

  // a flag to avoid this being observed
  vm._isVue = true
  // merge options
  if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options)
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    initProxy(vm)
  } else {
    vm._renderProxy = vm
  }

  vm._self = vm
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')

  registerComponentHook(componentId, 'lifecycle', 'attach', () => {
    mountComponent(vm)
  })

  registerComponentHook(componentId, 'lifecycle', 'detach', () => {
    vm.$destroy()
  })
}

// override Vue.prototype._update
function updateVirtualComponent (vnode: VNode, hydrating?: boolean) {
  // TODO
  updateComponentData(this.$options.componentId, {})
}

// listening on native callback
export function resolveVirtualComponent (vnode: MountedComponentVNode): VNode {
  const BaseCtor = vnode.componentOptions.Ctor
  const VirtualComponent = BaseCtor.extend({})
  VirtualComponent.prototype._init = initVirtualComponent
  VirtualComponent.prototype._update = updateVirtualComponent

  vnode.componentOptions.Ctor = BaseCtor.extend({
    beforeCreate () {
      registerComponentHook(VirtualComponent.cid, 'lifecycle', 'create', componentId => {
        // create virtual component
        const options = { componentId }
        return new VirtualComponent(options)
      })
    }
  })
}

