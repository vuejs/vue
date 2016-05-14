/* @flow */

import type VNode from '../vdom/vnode'
import createElement from '../vdom/create-element'
import { emptyVNode } from '../vdom/vnode'
import { normalizeChildren } from '../vdom/helpers'
import { bind, remove, isObject, renderString } from 'shared/util'
import { resolveAsset, nextTick } from '../util/index'

export const renderState: {
  activeInstance: Component | null
} = {
  activeInstance: null
}

export function initRender (vm: Component) {
  vm._vnode = null
  vm._staticTrees = null
  vm.$slots = {}
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind(createElement, vm)
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}

export function renderMixin (Vue: Class<Component>) {
  Vue.prototype.$nextTick = function (fn: Function) {
    nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const prev = renderState.activeInstance
    renderState.activeInstance = vm
    if (!vm._isMounted) {
      // render static sub-trees for once on initial render
      renderStaticTrees(vm)
    }
    const { render, _renderChildren, _parentVnode } = vm.$options
    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.
    if (_renderChildren) {
      resolveSlots(vm, _renderChildren)
    }
    // render self
    const vnode = render.call(vm._renderProxy) || emptyVNode
    // set parent
    vnode.parent = _parentVnode
    // restore render state
    renderState.activeInstance = prev
    return vnode
  }

  // shorthands used in render functions
  Vue.prototype.__h__ = createElement

  // toString for mustaches
  Vue.prototype.__toString__ = renderString

  // filter resolution helper
  const identity = _ => _
  Vue.prototype.__resolveFilter__ = function (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  // render v-for
  Vue.prototype.__renderList__ = function (
    val: any,
    render: () => VNode
  ): ?Array<VNode> {
    let ret: ?Array<VNode>, i, l, keys, key
    if (Array.isArray(val)) {
      ret = new Array(val.length)
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i, i)
      }
    } else if (typeof val === 'number') {
      ret = new Array(val)
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i, i)
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], i, key)
      }
    }
    return ret
  }

  // register ref
  Vue.prototype.__registerRef__ = function (
    key: string,
    ref: Vue | Element,
    vFor: boolean,
    isRemoval: boolean
  ) {
    const vm: Component = this
    const refs = vm.$refs
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref)
      } else {
        refs[key] = undefined
      }
    } else {
      if (vFor) {
        if (Array.isArray(refs[key])) {
          refs[key].push(ref)
        } else {
          refs[key] = [ref]
        }
      } else {
        refs[key] = ref
      }
    }
  }
}

function renderStaticTrees (vm: Component) {
  const staticRenderFns = vm.$options.staticRenderFns
  if (staticRenderFns) {
    const trees = vm._staticTrees = new Array(staticRenderFns.length)
    for (let i = 0; i < staticRenderFns.length; i++) {
      trees[i] = staticRenderFns[i].call(vm._renderProxy)
    }
  }
}

function resolveSlots (
  vm: Component,
  renderChildren: Array<any> | () => Array<any> | string
) {
  if (renderChildren) {
    const children = normalizeChildren(renderChildren)
    const slots = {}
    const defaultSlot = []
    let i = children.length
    let name, child
    while (i--) {
      child = children[i]
      if ((name = child.data && child.data.slot)) {
        const slot = (slots[name] || (slots[name] = []))
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children)
        } else {
          slot.push(child)
        }
      } else {
        defaultSlot.push(child)
      }
    }
    if (defaultSlot.length && !(
      defaultSlot.length === 1 &&
      defaultSlot[0].text === ' '
    )) {
      slots['default'] = defaultSlot
    }
    vm.$slots = slots
  }
}
