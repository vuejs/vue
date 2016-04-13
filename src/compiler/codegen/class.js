import { getAndRemoveAttr } from './helpers'

export function genClass (el) {
  let ret = ''
  const classBinding =
    getAndRemoveAttr(el, ':class') ||
    getAndRemoveAttr(el, 'v-bind:class')
  if (classBinding) {
    ret += `class: ${classBinding},`
  }
  const staticClass = getAndRemoveAttr(el, 'class')
  if (staticClass) {
    ret += `staticClass: "${staticClass}",`
  }
  return ret
}
