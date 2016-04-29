import { hyphenate } from 'shared/util'

export default function renderStyle (node) {
  const staticStyle = node.data.staticAttrs && node.data.staticAttrs.style
  if (node.data.style || staticStyle) {
    const styles = node.data.style
    let res = ' style="' + (staticStyle ? staticStyle + ';' : '')
    for (let key in styles) {
      res += `${hyphenate(key)}:${styles[key]};`
    }
    return res + '"'
  }
}
