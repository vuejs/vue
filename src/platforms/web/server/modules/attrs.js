/* @flow */

import {
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue
} from 'web/util/attrs'

export default function renderAttrs (node: VNodeWithData): string {
  let res = ''
  if (node.data.attrs) {
    res += render(node.data.attrs)
  }
  return res
}

function render (attrs: { [key: string]: any }): string {
  let res = ''
  for (const key in attrs) {
    if (key === 'style') {
      // leave it to the style module
      continue
    }
    res += renderAttr(key, attrs[key])
  }
  return res
}

export function renderAttr (key: string, value: string): string {
  if (isBooleanAttr(key)) {
    if (!isFalsyAttrValue(value)) {
      return ` ${key}="${key}"`
    }
  } else if (isEnumeratedAttr(key)) {
    return ` ${key}="${isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true'}"`
  } else if (!isFalsyAttrValue(value)) {
    return ` ${key}="${value}"`
  }
  return ''
}
