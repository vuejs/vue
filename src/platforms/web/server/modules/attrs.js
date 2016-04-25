import { isBooleanAttr, isEnumeratedAttr } from 'web/util/index'

export default function renderAttrs (node) {
  if (node.data.attrs || node.data.staticAttrs) {
    return serialize(node.data.staticAttrs) + serialize(node.data.attrs)
  }
}

function serialize (attrs) {
  let res = ''
  if (!attrs) {
    return res
  }
  for (let key in attrs) {
    if (key === 'style') {
      // leave it to the style module
      continue
    }
    if (attrs[key] != null) {
      if (isBooleanAttr(key)) {
        res += ` ${key}="${key}"`
      } else if (isEnumeratedAttr(key)) {
        res += ` ${key}="true"`
      } else {
        res += ` ${key}="${attrs[key]}"`
      }
    }
  }
  return res
}
