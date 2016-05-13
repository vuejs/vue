import VNode, { emptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { flatten } from './helpers'
import { renderState } from '../instance/render'
import { warn, resolveAsset } from '../util/index'

export function renderElement (vnode, children) {
  if (vnode.component) {
    return createComponent(
      vnode.Ctor, vnode.data, vnode.parent,
      children, vnode.context
    )
  }
  if (typeof children === 'function') {
    children = children()
  }
  vnode.setChildren(flatten(children))
  return vnode
}

export function renderSelf (tag, data, namespace) {
  const context = this
  const parent = renderState.activeInstance
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
    } else if ((Ctor = resolveAsset(this.$options, 'components', tag))) {
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
