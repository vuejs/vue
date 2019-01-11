/* @flow */

import { escape, noUnitNumericStyleProps } from '../util'
import { hyphenate } from 'shared/util'
import { getStyle } from 'web/util/style'

export function genStyle (style: Object): string {
  let styleText = ''
  for (const key in style) {
    const value = style[key]
    const hyphenatedKey = hyphenate(key)
    if (Array.isArray(value)) {
      for (let i = 0, len = value.length; i < len; i++) {
        styleText += normalizeValue(hyphenatedKey, value[i])
      }
    } else {
      styleText += normalizeValue(hyphenatedKey, value)
    }
  }
  return styleText
}

function normalizeValue(key: string, value: any): string {
  if (typeof value === 'string') {
    return `${key}:${value};`
  } else if (typeof value === 'number') {
    // Handle numeric values.
    // Turns out all evergreen browsers plus IE11 already support setting plain
    // numbers on the style object and will automatically convert it to px if
    // applicable, so we should support that on the server too.
    if (noUnitNumericStyleProps[key]) {
      return `${key}:${value};`
    } else {
      return `${key}:${value}px;`
    }
  } else {
    // invalid values
    return ``
  }
}

export default function renderStyle (vnode: VNodeWithData): ?string {
  const styleText = genStyle(getStyle(vnode, false))
  if (styleText !== '') {
    return ` style=${JSON.stringify(escape(styleText))}`
  }
}
