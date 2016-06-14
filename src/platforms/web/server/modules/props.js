/* @flow */

import { renderAttr } from './attrs'
import { propsToAttrMap, isRenderableAttr } from 'web/util/attrs'

export default function (node: VNodeWithData): ?string {
  const props = node.data.props
  if (props) {
    let res = ''
    for (const key in props) {
      const attr = propsToAttrMap[key] || key.toLowerCase()
      if (isRenderableAttr(attr)) {
        res += renderAttr(attr, props[key])
      }
    }
    return res
  }
}
