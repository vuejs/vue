import VNode from './vnode'
import Component from './component'
import { renderState } from '../instance/render'
import { isPrimitive, isArray, isReservedTag, resolveAsset } from '../util/index'

export default function createElement (tag, data, children) {
  if (isArray(children)) {
    let _children = children
    children = []
    for (let i = 0, l = _children.length; i < l; i++) {
      let e = _children[i]
      // flatten nested
      if (isArray(e)) {
        for (let j = 0, k = e.length; j < k; j++) {
          if (e[j]) {
            children.push(e[j])
          }
        }
      } else if (isPrimitive(e)) {
        // convert primitive to vnode
        children.push(VNode(undefined, undefined, undefined, e))
      } else if (e) {
        children.push(e)
      }
    }
  }
  const parent = renderState.activeInstance
  // TODO component sniffing
  if (typeof tag === 'string') {
    let Ctor
    if (isReservedTag(tag) ||
      !(Ctor = resolveAsset(parent.$options, 'components', tag))) {
      return VNode(tag, data, children)
    } else {
      return Component(Ctor, data, parent, children)
    }
  } else {
    return Component(tag, data, parent, children)
  }
}
