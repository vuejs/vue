/* @flow */

import config from '../config'
import VNode, { emptyVNode } from '../vdom/vnode'
import { normalizeChildren } from '../vdom/helpers'
import {
  warn, bind, isObject, toObject,
  nextTick, resolveAsset, _toString, toNumber
} from '../util/index'

import {
  renderElement,
  renderElementWithChildren,
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

    // set current active instance
    const prev = renderState.activeInstance
    renderState.activeInstance = vm

    const {
      render,
      staticRenderFns,
      _renderChildren,
      _parentVnode
    } = vm.$options

    if (staticRenderFns && !this._staticTrees) {
      this._staticTrees = []
    }

    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.
    if (_renderChildren) {
      resolveSlots(vm, _renderChildren)
    }
    // render self
    let vnode = render.call(vm._renderProxy, vm.$createElement)
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = emptyVNode()
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
  Vue.prototype._m = renderStatic
  // toString for mustaches
  Vue.prototype._s = _toString
  // number conversion
  Vue.prototype._n = toNumber

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
        ret[i] = render(val[i], i)
      }
    } else if (typeof val === 'number') {
      ret = new Array(val)
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i)
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], key, i)
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

  // expose v-on keyCodes
  Vue.prototype._k = key => config.keyCodes[key]
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
