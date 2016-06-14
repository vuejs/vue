/* @flow */

import VNode from 'core/vdom/vnode'
import { renderAttr } from './attrs'
import { propsToAttrMap, isRenderableAttr } from 'web/util/attrs'

export default function (node: VNodeWithData): string {
  const props = node.data.props
  let res = ''
  if (props) {
    for (const key in props) {
      if (key === 'innerHTML') {
        setText(node, props[key], true)
      } else if (key === 'textContent') {
        setText(node, props[key])
      } else {
        const attr = propsToAttrMap[key] || key.toLowerCase()
        if (isRenderableAttr(attr)) {
          res += renderAttr(attr, props[key])
        }
      }
    }
  }
  return res
}

function setText (node, text, raw) {
  const child = new VNode(undefined, undefined, undefined, text)
  child.raw = raw
  node.children = [child]
}
