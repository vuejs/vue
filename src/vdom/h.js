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

export default function h (tag, b, c) {
  var data = {}, children, text, i
  if (arguments.length === 3) {
    data = b
    if (isArray(c)) { children = c }
    else if (isPrimitive(c)) { text = c }
  } else if (arguments.length === 2) {
    if (isArray(b)) { children = b }
    else if (isPrimitive(b)) { text = b }
    else { data = b }
  }
  if (isArray(children)) {
    for (i = 0; i < children.length; ++i) {
      if (isPrimitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i])
    }
  }
  if (tag === 'svg') {
    addNS(data, children)
  }
  return VNode(tag, data, children, text, undefined)
}
