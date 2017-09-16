/* @flow */

import { getAndRemoveAttr, addAttr } from 'compiler/helpers'

function isConditionAttr (name: string): boolean {
  return /^v\-if|v\-else|v\-else\-if/.test(name)
}

export function transformVIf (el: ASTElement) {
  for (const attr in el.attrsMap) {
    if (!isConditionAttr(attr)) {
      continue
    }
    const binding = getAndRemoveAttr(el, attr)
    switch (attr) {
      case 'v-if': {
        addAttr(el, '[[match]]', binding)
        el.attrsMap['[[match]]'] = binding
        el.attrsList.push({ name: '[[match]]', value: binding })
        delete el.attrsMap[attr]
        delete el.if
        delete el.ifConditions
        break
      }

      // TODO: support v-else and v-else-if
    }
  }
}
