import { hyphenate } from 'shared/util'

export default function renderStyle (node) {
  const styles = node.data.style
  let res = ' style="'
  for (let key in styles) {
    res += `${hyphenate(key)}:${styles[key]};`
  }
  return res + '"'
}
