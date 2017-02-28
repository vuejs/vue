/* @flow */
import { hyphenate } from 'shared/util'
import { getStyle } from 'web/util/style'

function genStyleText (vnode: VNode): string {
  let styleText = ''
  const style = getStyle(vnode, false)
  for (const key in style) {
    styleText += `${hyphenate(key)}:${style[key]};`
  }
  return styleText
}

export default function renderStyle (vnode: VNodeWithData): ?string {
  const styleText = genStyleText(vnode)
  if (styleText) {
    return ` style=${JSON.stringify(styleText)}`
  }
}
