/* @flow */

import config from '../config'
import VNode, { emptyVNode } from '../vdom/vnode'
import { normalizeChildren } from '../vdom/helpers'
import {
  warn, bind, isObject, toObject,
  nextTick, resolveAsset, renderString
} from '../util/index'

import {
  renderElement,
  renderElementWithChildren,
  renderText,
  renderStatic
} from '../vdom/create-element'

export const renderState: {
  activeInstance: ?Component
} = {
  activeInstance: null
}

export function initRender (vm: Component) {
  vm._vnode = null
  vm._staticTrees = null
  vm.$slots = {}
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind(function (
    tag?: string | Class<Component> | Function | Object,
    data?: VNodeData,
    children?: VNodeChildren,
    namespace?: string
  ) {
    return this._h(this._e(tag, data, namespace), children)
  }, vm)
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
    let vnode = render.call(vm._renderProxy)
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = emptyVNode
    }
    // set parent
    vnode.parent = _parentVnode
    // restore render state
    renderState.activeInstance = prev
    return vnode
  }

  // shorthands used in render functions
  Vue.prototype._h = renderElementWithChildren
  Vue.prototype._e = renderElement
  Vue.prototype._t = renderText
  Vue.prototype._m = renderStatic

  // toString for mustaches
  Vue.prototype._s = renderString

  // filter resolution helper
  const identity = _ => _
  Vue.prototype._f = function (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  // render v-for
  Vue.prototype._l = function (
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

  // apply v-bind object
  Vue.prototype._b = function (vnode: VNodeWithData, value: any) {
    if (value) {
      if (!isObject(value)) {
        process.env.NODE_ENV !== 'production' && warn(
          'v-bind without argument expects an Object or Array value',
          this
        )
      } else {
        if (Array.isArray(value)) {
          value = toObject(value)
        }
        const data = vnode.data
        for (const key in value) {
          const hash = config.mustUseProp(key)
            ? data.props || (data.props = {})
            : data.attrs || (data.attrs = {})
          hash[key] = value[key]
        }
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
    let name, child
    for (let i = 0, l = children.length; i < l; i++) {
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
