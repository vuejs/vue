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
    const component = createComponent(vnode.Ctor, vnode.data, vnode.parent, children, vnode.context)
    if (this._isStream) {
      this.__stream_patch__(component)
    }
    return component
  }
  if (typeof children === 'function') {
    children = children() // why children is a function for unknown element?
  }
  vnode.setChildren(flatten(children))
  revertCurrentVNode(this)
  if (this._isStream) {
    if (vnode.data && vnode.data.atom) {
      this.__tree_patch__(vnode)
    }
  }
  return vnode
}

export function renderSelf (tag, data, namespace) {
  const parent = renderState.activeInstance
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode
  }
  if (typeof tag === 'string') {
    let Ctor
    if (config.isReservedTag(tag)) {
      return createSelfVNode(tag, data, undefined, namespace, this)
    } else if ((Ctor = resolveAsset(this.$options, 'components', tag))) {
      return { Ctor, data, parent, context: this, component: true }
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
      return createSelfVNode(tag, data, undefined, namespace, this)
    }
  } else {
    return { Ctor: tag, data, parent, context: this, component: true }
  }
}

export function renderText (str) {
  createSelfVNode(undefined, undefined, str, undefined, this)
  revertCurrentVNode(this)
  return str
}

export function renderStatic (index) {
  const vnode = this._staticTrees[index]
  setCurrentVNode(vnode, this)
  return vnode
}

function createSelfVNode (tag, data, text, namespace, context) {
  const vnode = VNode(tag, data, null, text, undefined, namespace, context)
  setCurrentVNode(vnode, context)
  return vnode
}

function setCurrentVNode (vnode, context) {
  if (context._isStream) {
    context.__stream_patch__(vnode)
    context._currentVNodeHistory.push(context._currentVNode)
    context._currentVNode = vnode
  }
}

function revertCurrentVNode (context) {
  if (context._isStream) {
    context._currentVNode = context._currentVNodeHistory.pop()
  }
}
