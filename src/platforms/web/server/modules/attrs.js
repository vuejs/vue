import { isBooleanAttr, isEnumeratedAttr } from 'web/util/index'

export default function renderAttrs (node) {
  const attrs = node.data.attrs
  let res = ''
  for (let key in attrs) {
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
