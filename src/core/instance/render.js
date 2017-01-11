/* @flow */

import config from '../config'
import VNode, {
  cloneVNode,
  cloneVNodes,
  createTextVNode,
  createEmptyVNode
} from '../vdom/vnode'
import {
  warn,
  extend,
  identity,
  isObject,
  toObject,
  nextTick,
  toNumber,
  _toString,
  looseEqual,
  looseIndexOf,
  resolveAsset,
  formatComponentName
} from '../util/index'

import { createElement } from '../vdom/create-element'

export function initRender (vm: Component) {
  vm.$vnode = null // the placeholder node in parent tree
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null
  const parentVnode = vm.$options._parentVnode
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext)
  vm.$scopedSlots = {}
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}

export function renderMixin (Vue: Class<Component>) {
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const {
      render,
      staticRenderFns,
      _parentVnode
    } = vm.$options

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (const key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key])
      }
    }

    if (_parentVnode && _parentVnode.data.scopedSlots) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots
    }

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = []
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      /* istanbul ignore else */
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm)
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn(`Error when rendering ${formatComponentName(vm)}:`)
        }
        throw e
      }
      // return previous vnode to prevent render error causing blank component
      vnode = vm._vnode
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
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

  // toString for mustaches
  Vue.prototype._s = _toString
  // convert text to vnode
  Vue.prototype._v = createTextVNode
  // number conversion
  Vue.prototype._n = toNumber
  // empty vnode
  Vue.prototype._e = createEmptyVNode
  // loose equal
  Vue.prototype._q = looseEqual
  // loose indexOf
  Vue.prototype._i = looseIndexOf

  // render static tree by index
  Vue.prototype._m = function renderStatic (
    index: number,
    isInFor?: boolean
  ): VNode | Array<VNode> {
    let tree = this._staticTrees[index]
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree by doing a shallow clone.
    if (tree && !isInFor) {
      return Array.isArray(tree)
        ? cloneVNodes(tree)
        : cloneVNode(tree)
    }
    // otherwise, render a fresh tree.
    tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy)
    markStatic(tree, `__static__${index}`, false)
    return tree
  }

  // mark node as static (v-once)
  Vue.prototype._o = function markOnce (
    tree: VNode | Array<VNode>,
    index: number,
    key: string
  ) {
    markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true)
    return tree
  }

  function markStatic (tree, key, isOnce) {
    if (Array.isArray(tree)) {
      for (let i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], `${key}_${i}`, isOnce)
        }
      }
    } else {
      markStaticNode(tree, key, isOnce)
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true
    node.key = key
    node.isOnce = isOnce
  }

  // filter resolution helper
  Vue.prototype._f = function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  // render v-for
  Vue.prototype._l = function renderList (
    val: any,
    render: () => VNode
  ): ?Array<VNode> {
    let ret: ?Array<VNode>, i, l, keys, key
    if (Array.isArray(val) || typeof val === 'string') {
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

  // renderSlot
  Vue.prototype._t = function (
    name: string,
    fallback: ?Array<VNode>,
    props: ?Object,
    bindObject: ?Object
  ): ?Array<VNode> {
    const scopedSlotFn = this.$scopedSlots[name]
    if (scopedSlotFn) { // scoped slot
      props = props || {}
      if (bindObject) {
        extend(props, bindObject)
      }
      return scopedSlotFn(props) || fallback
    } else {
      const slotNodes = this.$slots[name]
      // warn duplicate slot usage
      if (slotNodes && process.env.NODE_ENV !== 'production') {
        slotNodes._rendered && warn(
          `Duplicate presence of slot "${name}" found in the same render tree ` +
          `- this will likely cause render errors.`,
          this
        )
        slotNodes._rendered = true
      }
      return slotNodes || fallback
    }
  }

  // apply v-bind object
  Vue.prototype._b = function bindProps (
    data: any,
    tag: string,
    value: any,
    asProp?: boolean
  ): VNodeData {
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
        for (const key in value) {
          if (key === 'class' || key === 'style') {
            data[key] = value[key]
          } else {
            const hash = asProp || config.mustUseProp(tag, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {})
            hash[key] = value[key]
          }
        }
      }
    }
    return data
  }

  // check v-on keyCodes
  Vue.prototype._k = function checkKeyCodes (
    eventKeyCode: number,
    key: string,
    builtInAlias: number | Array<number> | void
  ): boolean {
    const keyCodes = config.keyCodes[key] || builtInAlias
    if (Array.isArray(keyCodes)) {
      return keyCodes.indexOf(eventKeyCode) === -1
    } else {
      return keyCodes !== eventKeyCode
    }
  }
}

export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component
): { [key: string]: Array<VNode> } {
  const slots = {}
  if (!children) {
    return slots
  }
  const defaultSlot = []
  let name, child
  for (let i = 0, l = children.length; i < l; i++) {
    child = children[i]
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
        child.data && (name = child.data.slot)) {
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
  // ignore single whitespace
  if (defaultSlot.length && !(
    defaultSlot.length === 1 &&
    (defaultSlot[0].text === ' ' || defaultSlot[0].isComment)
  )) {
    slots.default = defaultSlot
  }
  return slots
}
