/* @flow */

import { hyphenate, toObject } from 'shared/util'

export default function renderStyle (node: VNodeWithData): ?string {
  const staticStyle = node.data.attrs && node.data.attrs.style
  if (node.data.style || staticStyle) {
    let styles = node.data.style
    let res = ''
    if (styles) {
      if (typeof styles === 'string') {
        res += styles
      } else {
        if (Array.isArray(styles)) {
          styles = toObject(styles)
        }
        for (const key in styles) {
          res += `${hyphenate(key)}:${styles[key]};`
        }
        res += staticStyle || ''
      }
    }
    return ` style=${JSON.stringify(res)}`
  }
}
