/* @flow */

import { camelize } from 'shared/util'
import { bindRE } from 'compiler/parser/index'
import { getAndRemoveAttr } from 'compiler/helpers'

function parseAttrName (name: string): string {
  return camelize(name.replace(bindRE, ''))
}

export function preTransformVBind (el: ASTElement, options: CompilerOptions) {
  for (const attr in el.attrsMap) {
    if (bindRE.test(attr)) {
      const name: string = parseAttrName(attr)
      const value = {
        '@binding': getAndRemoveAttr(el, attr)
      }
      delete el.attrsMap[attr]
      el.attrsMap[name] = value
      el.attrsList.push({ name, value })
      // addAttr(el, name, value)
      // el.hasBindings = false
    }
  }
}
