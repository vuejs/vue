import VNode, { emptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { flatten } from './helpers'
import { renderState } from '../instance/render'
import { warn, resolveAsset } from '../util/index'

export function createElement (tag, data, children, namespace) {
  const context = this
  const parent = renderState.activeInstance
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode
  }
  if (typeof tag === 'string') {
    let Ctor
    if (config.isReservedTag(tag)) {
      const vnode = VNode(
        tag, data, null,
        undefined, undefined, namespace, context
      )
      vnode.setChildren(flatten(children))
      return vnode
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      return createComponent(Ctor, data, parent, children, context)
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
      const vnode = VNode(
        tag, data, null,
        undefined, undefined, namespace, context
      )
      vnode.setChildren(flatten(children && children()))
      return vnode
    }
  } else {
    return createComponent(tag, data, parent, children, context)
  }
}

export function renderElement (vnode, children) {
  if (vnode.component) {
    const component = createComponent(vnode.Ctor, vnode.data, vnode.parent, vnode.children, vnode.context)
    if (this._firstRendering) {
      this.__first_patch__(component)
    }
    return component
  }
  vnode.setChildren(flatten(children))
  if (this._firstRendering) {
    this._currentVNode = this._lastVNode
    this._lastVNode = undefined
  }
  return vnode
}

export function renderSelf (tag, data, namespace) {
  const context = this
  const parent = renderState.activeInstance
  if (typeof tag === 'string') {
    let Ctor
    if (config.isReservedTag(tag)) {
      const vnode = VNode(
        tag, data, null,
        undefined, undefined, namespace, context
      )
      if (this._firstRendering) {
        this.__first_patch__(vnode)
        this._lastVNode = this._currentVNode
        this._currentVNode = vnode
      }
      return vnode
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
      const vnode = VNode(
        tag, data, null,
        undefined, undefined, namespace, context
      )
      if (this._firstRendering) {
        this.__first_patch__(vnode)
        this._currentVNode = vnode
      }
      return vnode
    }
  } else {
    return { tag, data, parent, context, component: true }
  }
}

export function renderText (str) {
  const context = this
  const vnode = VNode(
    undefined, undefined, undefined,
    str, undefined, undefined, context
  )
  if (context._firstRendering) {
    context.__first_patch__(vnode)
    this._lastVNode = this._currentVNode
    this._currentVNode = vnode
  }
  return str
}

export function renderStatic (index) {
  const vnode = this._staticTrees[index]
  if (this._firstRendering) {
    this.__first_patch__(vnode)
    this._lastVNode = this._currentVNode
    this._currentVNode = vnode
  }
  return vnode
}
