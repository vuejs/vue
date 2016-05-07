import {
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue,
  propsToAttrMap
} from 'web/util/index'

export default function renderAttrs (node) {
  if (node.data.attrs || node.data.props || node.data.staticAttrs) {
    return (
      serialize(node.data.staticAttrs) +
      serialize(node.data.attrs) +
      serialize(node.data.props, true)
    )
  }
}

function serialize (attrs, asProps) {
  let res = ''
  if (!attrs) {
    return res
  }
  for (let key in attrs) {
    if (key === 'style') {
      // leave it to the style module
      continue
    }
    if (asProps) {
      key = propsToAttrMap[key] || key.toLowerCase()
    }
    const value = attrs[key]
    if (isBooleanAttr(key)) {
      if (!isFalsyAttrValue(value)) {
        res += ` ${key}="${key}"`
      }
    } else if (isEnumeratedAttr(key)) {
      res += ` ${key}="${isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true'}"`
    } else if (!isFalsyAttrValue(value)) {
      res += ` ${key}="${value}"`
    }
  }
  return res
}
