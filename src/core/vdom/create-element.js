/* @flow */

import VNode, { emptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { normalizeChildren } from './helpers'
import { renderState } from '../instance/render'
import { warn, resolveAsset } from '../util/index'

export function renderElementWithChildren (
  vnode: VNode | void,
  children: VNodeChildren | void
): VNode | void {
  if (vnode) {
    if (vnode.componentOptions) {
      if (process.env.NODE_ENV !== 'production' &&
        children && typeof children !== 'function') {
        warn(
          'A component\'s children should be a function that returns the ' +
          'children array. This allows the component to track the children ' +
          'dependencies and optimizes re-rendering.'
        )
      }
      vnode.componentOptions.children = children
    } else {
      vnode.setChildren(normalizeChildren(children))
    }
  }
  return vnode
}

export function renderElement (
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  namespace?: string
): VNode | void {
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
      return createComponent(Ctor, data, parent, context, tag)
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
    return createComponent(tag, data, parent, context)
  }
}

export function renderText (str?: string): string {
  return str || ''
}

export function renderStatic (index?: number): Object | void {
  return this._staticTrees[index]
}
