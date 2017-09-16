/* @flow */

import { getAndRemoveAttr, addAttr } from 'compiler/helpers'

function isBindingAttr (name) {
  return /^(v\-bind)?\:/.test(name)
}

function parseRealName (name: string): string {
  return name.replace(/^(v\-bind)?\:/, '')
}

export function transformVBind (el: ASTElement) {
  if (!el.attrsList.length) {
    return
  }
  el.attrsList.forEach(attr => {
    // console.log('is binding attr:', attr.name, isBindingAttr(attr.name))
    if (isBindingAttr(attr.name)) {
      const realName: string = parseRealName(attr.name)
      const binding = getAndRemoveAttr(el, attr.name)
      if (el.attrs) {
        el.attrs = el.attrs.filter(at => at.name !== realName) // omit duplicated
      }
      getAndRemoveAttr(el, realName)
      addAttr(el, realName, { '@binding': binding })
    }
  })
  el.hasBindings = false
  // el.plain = true
}
