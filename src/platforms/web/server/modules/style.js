/* @flow */

import { escape, noUnitNumericStyleProps } from '../util'
import { hyphenate } from 'shared/util'
import { getStyle } from 'web/util/style'

const cssVarRE = /^--/

export function genStyle (style: Object): string {
  let styleText = ''
  for (const key in style) {
    const value = style[key]
      const hyphenatedKey = cssVarRE.test(key) ? key :  hyphenate(key)
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
  if (
    typeof value === 'string' ||
    (typeof value === 'number' && noUnitNumericStyleProps[key]) || // accept numeric values for configured css attributes
    (typeof value === 'number' && cssVarRE.test(key)) || // accept numeric values for all CSS variables
    value === 0
  ) {
    return `${key}:${value};`
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
