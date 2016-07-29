/* @flow */

import { hyphenate, toObject } from 'shared/util'

export default function renderStyle (node: VNodeWithData): ?string {
  const staticStyle = node.data.attrs && node.data.attrs.style
  if (node.data.style || staticStyle) {
    let styles = node.data.style
    let res = ' style="'
    if (styles) {
      if (Array.isArray(styles)) {
        styles = toObject(styles)
      }
      for (const key in styles) {
        res += `${hyphenate(key)}:${styles[key]};`
      }
    }
    return res + (staticStyle || '') + '"'
  }
}
