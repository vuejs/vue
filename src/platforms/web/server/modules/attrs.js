/* @flow */

import {
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue
} from 'web/util/attrs'

export default function renderAttrs (node: VNodeWithData): string {
  let res = ''
  if (node.data.attrs || node.parent) {
    res += render(node)
  }
  return res
}

function render (node): string {
  let attrs = node.data.attrs
  let res = ''

  let parent = node.parent
  while (parent) {
    if (parent.data && parent.data.attrs) {
      attrs = Object.assign({}, attrs, parent.data.attrs)
    }
    parent = parent.parent
  }

  if (!attrs) {
    return res
  }

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
