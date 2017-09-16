/* @flow */

import { camelize } from 'shared/util'
import { getAndRemoveAttr, addAttr } from 'compiler/helpers'

function isBindingAttr (name: string): boolean {
  return /^(v\-bind)?\:/.test(name)
}

function parseAttrName (name: string): string {
  return camelize(name.replace(/^(v\-bind)?\:/, ''))
}

export function transformVBind (el: ASTElement) {
  if (!el.attrsList || !el.attrsList.length) {
    return
  }
  el.attrsList.forEach(attr => {
    if (isBindingAttr(attr.name)) {
      const name: string = parseAttrName(attr.name)
      const binding = getAndRemoveAttr(el, attr.name)
      addAttr(el, name, { '@binding': binding })
    }
  })
  el.hasBindings = false
}
