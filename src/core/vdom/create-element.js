/* @flow */

import VNode, { emptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { normalizeChildren } from './helpers'
import { renderState } from '../instance/render'
import { warn, resolveAsset } from '../util/index'

export function renderElement (
  vnode: VNode | Object | void,
  children?: VNodeChildren
): VNode | void {
  if (vnode.component) {
    return createComponent(
      vnode.Ctor, vnode.data, vnode.parent,
      vnode.context, children
    )
  }
  if (typeof children === 'function') {
    children = children()
  }
  vnode.setChildren(normalizeChildren(children))
  return vnode
}

export function renderSelf (
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  namespace?: string
): VNode | Object | void {
  const context: Component = this
  const parent: Component | null = renderState.activeInstance
  if (!parent) {
    process.env.NODE_ENV !== 'production' && warn(
      'createElement cannot be called outside of component ' +
      'render functions.'
    )
    return
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode
  }
  if (typeof tag === 'string') {
    let Ctor
    if (config.isReservedTag(tag)) {
      return new VNode(
        tag, data, undefined,
        undefined, undefined, namespace, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      return { Ctor, data, parent, context, component: true }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (!namespace && config.isUnknownElement(tag)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.'
          )
        }
      }
      return new VNode(
        tag, data, undefined,
        undefined, undefined, namespace, context
      )
    }
  } else {
    return { Ctor: tag, data, parent, context, component: true }
  }
}

export function renderText (str) {
  return str
}

export function renderStatic (index) {
  return this._staticTrees[index]
}
