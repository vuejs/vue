import VNode from './vnode'
import Component from './component'
import { renderState } from '../instance/render'
import {
  warn,
  isPrimitive,
  isArray,
  isReservedTag,
  isUnknownElement,
  resolveAsset
} from '../util/index'

export default function createElement (tag, data, children) {
  children = flatten(children)
  const parent = renderState.activeInstance
  if (typeof tag === 'string') {
    let Ctor
    if (isReservedTag(tag)) {
      return VNode(tag, data, children)
    } else if ((Ctor = resolveAsset(parent.$options, 'components', tag))) {
      return Component(Ctor, data, parent, children)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (isUnknownElement(tag)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.'
          )
        }
      }
      return VNode(tag, data, children)
    }
  } else {
    return Component(tag, data, parent, children)
  }
}

function flatten (children) {
  if (isArray(children)) {
    let res = []
    for (let i = 0, l = children.length; i < l; i++) {
      let e = children[i]
      // flatten nested
      if (isArray(e)) {
        for (let j = 0, k = e.length; j < k; j++) {
          if (e[j]) {
            res.push(e[j])
          }
        }
      } else if (isPrimitive(e)) {
        // convert primitive to vnode
        res.push(VNode(undefined, undefined, undefined, e))
      } else if (e) {
        res.push(e)
      }
    }
    return res
  } else {
    return children
  }
}
