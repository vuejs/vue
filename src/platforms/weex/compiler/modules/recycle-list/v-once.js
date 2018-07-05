/* @flow */

import { getAndRemoveAttr, addRawAttr } from 'compiler/helpers'

function containVOnce (el: ASTElement): boolean {
  for (const attr in el.attrsMap) {
    if (/^v\-once$/i.test(attr)) {
      return true
    }
  }
  return false
}

export function preTransformVOnce (el: ASTElement, options: WeexCompilerOptions) {
  if (containVOnce(el)) {
    getAndRemoveAttr(el, 'v-once', true)
    addRawAttr(el, '[[once]]', true)
  }
}
