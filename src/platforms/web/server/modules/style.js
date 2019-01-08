/* @flow */

import { escape } from '../util'
import { hyphenate } from 'shared/util'
import { getStyle } from 'web/util/style'
import { isFalsyAttrValue } from 'web/util/attrs'

export function genStyle (style: Object): string {
  let styleText = ''
  for (const key in style) {
    const value = style[key]
    const hyphenatedKey = hyphenate(key)
    if (Array.isArray(value)) {
      for (let i = 0, len = value.length; i < len; i++) {
        if(!isFalsyAttrValue(value[i])){
          styleText += `${hyphenatedKey}:${value[i]};`
        }
      }
    } else {
      if(!isFalsyAttrValue(value)){
        styleText += `${hyphenatedKey}:${value};`
      }
    }
  }
  return styleText
}

export default function renderStyle (vnode: VNodeWithData): ?string {
  const styleText = genStyle(getStyle(vnode, false))
  if (styleText !== '') {
    return ` style=${JSON.stringify(escape(styleText))}`
  }
}
