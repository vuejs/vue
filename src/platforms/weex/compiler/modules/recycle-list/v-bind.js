/* @flow */

import { camelize } from 'shared/util'
import { bindRE } from 'compiler/parser/index'
import { getAndRemoveAttr, addRawAttr } from 'compiler/helpers'

function parseAttrName (name: string): string {
  return camelize(name.replace(bindRE, ''))
}

export function preTransformVBind (el: ASTElement, options: WeexCompilerOptions) {
  for (const attr in el.attrsMap) {
    if (bindRE.test(attr)) {
      const name: string = parseAttrName(attr)
      const value = {
        '@binding': getAndRemoveAttr(el, attr)
      }
      delete el.attrsMap[attr]
      addRawAttr(el, name, value)
    }
  }
}
