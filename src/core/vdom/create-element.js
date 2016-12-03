/* @flow */

import VNode, { createEmptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { normalizeChildren } from './helpers/index'
import { warn, resolveAsset } from '../util/index'

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  tag: any,
  data: any,
  children: any
): VNode | void {
  if (data && (Array.isArray(data) || typeof data !== 'object')) {
    children = data
    data = undefined
  }
  // make sure to use real instance instead of proxy as context
  return _createElement(this._self, tag, data, children)
}

export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: VNodeChildren | void
): VNode | void {
  if (data && data.__ob__) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return
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
  if (typeof tag === 'string') {
    let Ctor
    const ns = config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      return createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      const childNs = tag === 'foreignObject' ? 'xhtml' : ns
      return new VNode(
        tag, data, normalizeChildren(children, childNs),
        undefined, undefined, ns, context
      )
    }
  } else {
    // direct component options / constructor
    return createComponent(tag, data, context, children)
  }
}
