import VNode from './vnode'
import { isPrimitive, isArray } from '../util/index'

function addNS(data, children) {
  data.ns = 'http://www.w3.org/2000/svg'
  if (children !== undefined) {
    for (var i = 0; i < children.length; ++i) {
      addNS(children[i].data, children[i].children)
    }
  }
}

export default function h (tag, data, children) {
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
  if (tag === 'svg') {
    addNS(data, children)
  }
  return VNode(tag, data, children, undefined, undefined)
}
