import {
  warn,
  nextTick,
  emptyObject,
  handleError,
  defineReactive,
  isArray
} from '../util/index'

import { createElement } from '../vdom/create-element'
import { installRenderHelpers } from './render-helpers/index'
import { resolveSlots } from './render-helpers/resolve-slots'
import { normalizeScopedSlots } from '../vdom/helpers/normalize-scoped-slots'
import VNode, { createEmptyVNode } from '../vdom/vnode'

import { isUpdatingChildComponent } from './lifecycle'
import type { Component } from 'types/component'
import { setCurrentInstance } from 'v3/currentInstance'
import { syncSetupSlots } from 'v3/apiSetup'

export function initRender(vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = (vm.$vnode = options._parentVnode!) // the placeholder node in parent tree
  const renderContext = parentVnode && (parentVnode.context as Component)
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = parentVnode
    ? normalizeScopedSlots(
        vm.$parent!,
        parentVnode.data!.scopedSlots,
        vm.$slots
      )
    : emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  // @ts-expect-error
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // @ts-expect-error
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (__DEV__) {
    defineReactive(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      () => {
        !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
      },
      true
    )
    defineReactive(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      () => {
        !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
      },
      true
    )
  } else {
    defineReactive(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      null,
      true
    )
    defineReactive(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      null,
      true
    )
  }
}

export let currentRenderingInstance: Component | null = null

// for testing only
export function setCurrentRenderingInstance(vm: Component) {
  currentRenderingInstance = vm
}

export function renderMixin(Vue: typeof Component) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: (...args: any[]) => any) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    if (_parentVnode && vm._isMounted) {
      vm.$scopedSlots = normalizeScopedSlots(
        vm.$parent!,
        _parentVnode.data!.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
      if (vm._slotsProxy) {
        syncSetupSlots(vm._slotsProxy, vm.$scopedSlots)
      }
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode!
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      setCurrentInstance(vm)
      currentRenderingInstance = vm
      vnode = render.call(vm._renderProxy, vm.$createElement)
      // merge vnode hook listeners, example： vnode.data.on.click.fns = [fn1, fn2, fn3], vm.$vnode.data.on.click.fns = [fn4, fn5, fn6], then vnode.data.on.click.fns = [fn1, fn2, fn3, fn4, fn5, fn6]
      if (vnode?.data?.on && vm?.$vnode?.data?.on) {
        Object.keys(vm.$vnode.data.on).forEach((key) => {
          if (vnode.data.on[key]) {
            let fnsOnVnode = vnode.data.on[key];
            if (typeof fnsOnVnode === 'function') {
              fnsOnVnode = [fnsOnVnode];
            }
            let fnsOnVm = vm.$vnode?.data?.on?.[key];
            if (typeof fnsOnVm === 'function') {
              fnsOnVm = [fnsOnVm];
            }
            vnode.data.on[key] = [
              ...fnsOnVnode,
              ...(fnsOnVm || []),
            ]
            if (vm.$vnode?.data?.on?.[key]) {
              delete vm.$vnode.data.on[key];
            }
          }
        })
      }
    } catch (e: any) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (__DEV__ && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(
            vm._renderProxy,
            vm.$createElement,
            e
          )
        } catch (e: any) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
      setCurrentInstance()
    }
    // if the returned array contains only a single node, allow it
    if (isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (__DEV__ && isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
}
