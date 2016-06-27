/* @flow */

import VNode, { emptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { normalizeChildren } from './helpers'
import { renderState } from '../instance/render'
import { warn, resolveAsset } from '../util/index'

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  tag: any,
  data: any,
  children: any
): VNode | Array<VNode> | void {
  if (data && (Array.isArray(data) || typeof data !== 'object')) {
    children = data
    data = undefined
  }
  return _createElement.call(this, tag, data, children)
}

function _createElement (
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: VNodeChildren | void
): VNode | Array<VNode> | void {
  // make sure to expose real self instead of proxy
  const context: Component = this._self
  const parent: ?Component = renderState.activeInstance
  const host = context !== parent ? parent : undefined
  if (!parent) {
    process.env.NODE_ENV !== 'production' && warn(
      'createElement cannot be called outside of component ' +
      'render functions.'
    )
    return
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode()
  }
  if (typeof tag === 'string') {
    const namespace = config.getTagNamespace(tag)
    let Ctor
    if (config.isReservedTag(tag)) {
      return new VNode(
        tag, data, normalizeChildren(children, namespace),
        undefined, undefined,
        namespace, context, host
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      return createComponent(Ctor, data, parent, context, host, children, tag)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (
          !namespace &&
          !(config.ignoredElements && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.'
          )
        }
      }
      return new VNode(
        tag, data, normalizeChildren(children, namespace),
        undefined, undefined,
        namespace, context, host
      )
    }
  } else {
    return createComponent(tag, data, parent, context, host, children)
  }
}
