import VNode from './vnode'
import Component from './component'
import { renderState } from '../instance/render'
import {
  warn,
  isPrimitive,
  isArray,
  isReservedTag,
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
      if (process.env.NODE_ENV !== 'production' && !data.svg) {
        warn(
          'Unknown custom element: <' + tag + '> - did you ' +
          'register the component correctly? For recursive components, ' +
          'make sure to provide the "name" option.'
        )
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
      let c = children[i]
      // flatten nested
      if (isArray(c)) {
        res.push.apply(res, flatten(c))
      } else if (isPrimitive(c)) {
        // convert primitive to vnode
        res.push(VNode(undefined, undefined, undefined, c))
      } else if (c) {
        res.push(c)
      }
    }
    return res
  } else {
    return children
  }
}
