/* @flow */

import { hyphenate, toObject } from 'shared/util'

function concatStyleString (former: string, latter: string) {
  if (former === '' || latter === '' || former.charAt(former.length - 1) === ';') {
    return former + latter
  }
  return former + ';' + latter
}

function generateStyleText (node) {
  const staticStyle = node.data.attrs && node.data.attrs.style
  let styles = node.data.style
  const parentStyle = node.parent ? generateStyleText(node.parent) : ''

  if (!styles && !staticStyle) {
    return parentStyle
  }

  let dynamicStyle = ''
  if (styles) {
    if (typeof styles === 'string') {
      dynamicStyle += styles
    } else {
      if (Array.isArray(styles)) {
        styles = toObject(styles)
      }
      for (const key in styles) {
        dynamicStyle += `${hyphenate(key)}:${styles[key]};`
      }
    }
  }

  dynamicStyle = concatStyleString(parentStyle, dynamicStyle)
  return concatStyleString(dynamicStyle, staticStyle || '')
}

export default function renderStyle (node: VNodeWithData): ?string {
  const res = generateStyleText(node)
  if (res) {
    return ` style=${JSON.stringify(res)}`
  }
}
