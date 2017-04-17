/* @flow */

import { escape } from 'he'
import { hyphenate } from 'shared/util'
import { getStyle } from 'web/util/style'

function genStyleText (vnode: VNode): string {
  let styleText = ''
  const style = getStyle(vnode, false)
  for (const key in style) {
    const value = style[key]
    const hyphenatedKey = hyphenate(key)
    if (Array.isArray(value)) {
      for (let i = 0, len = value.length; i < len; i++) {
        styleText += `${hyphenatedKey}:${value[i]};`
      }
    } else {
      styleText += `${hyphenatedKey}:${value};`
    }
  }
  return styleText
}

export default function renderStyle (vnode: VNodeWithData): ?string {
  const styleText = genStyleText(vnode)
  if (styleText !== '') {
    return ` style=${JSON.stringify(escape(styleText))}`
  }
}
