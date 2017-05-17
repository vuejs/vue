/* @flow */

import { escape } from '../util'

import {
  isDef,
  isUndef
} from 'shared/util'

import {
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue
} from 'web/util/attrs'

export default function renderAttrs (node: VNodeWithData): string {
  let attrs = node.data.attrs
  let res = ''

  let parent = node.parent
  while (isDef(parent)) {
    if (isDef(parent.data) && isDef(parent.data.attrs)) {
      attrs = Object.assign({}, attrs, parent.data.attrs)
    }
    parent = parent.parent
  }

  if (isUndef(attrs)) {
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
    return ` ${key}="${typeof value === 'string' ? escape(value) : value}"`
  }
  return ''
}
