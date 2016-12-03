/* @flow */

import VNode, { createEmptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { normalizeChildren } from './helpers/index'
import { warn, resolveAsset, isPrimitive } from '../util/index'

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  needNormalization: any,
  flipNormalization: boolean
): VNode {
  if (Array.isArray(data) || isPrimitive(data)) {
    needNormalization = children
    children = data
    data = undefined
  }
  if (flipNormalization) needNormalization = !needNormalization
  return _createElement(context, tag, data, children, needNormalization)
}

export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  needNormalization?: boolean
): VNode {
  if (data && data.__ob__) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
      typeof children[0] === 'function') {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        tag, data, needNormalization ? normalizeChildren(children) : children,
        undefined, undefined, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      ns = tag === 'foreignObject' ? 'xhtml' : ns
      vnode = new VNode(
        tag, data, needNormalization ? normalizeChildren(children) : children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (vnode) {
    if (ns) applyNS(vnode, ns)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns) {
  vnode.ns = ns
  if (vnode.children) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (child.tag && !child.ns) {
        applyNS(child, ns)
      }
    }
  }
}
