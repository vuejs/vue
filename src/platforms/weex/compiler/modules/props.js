/* @flow */

import { cached, camelize } from 'shared/util'

const normalize = cached(camelize)

function normalizeKeyName (str: string): string {
  if (str.match(/^v\-/)) {
    return str.replace(/(v-[a-z\-]+\:)([a-z\-]+)$/i, ($, directive, prop) => {
      return directive + normalize(prop)
    })
  }
  return normalize(str)
}

function transformNode (el: ASTElement, options: CompilerOptions) {
  if (Array.isArray(el.attrsList)) {
    el.attrsList.forEach(attr => {
      if (attr.name && attr.name.match(/\-/)) {
        const realName = normalizeKeyName(attr.name)
        if (el.attrsMap) {
          el.attrsMap[realName] = el.attrsMap[attr.name]
          delete el.attrsMap[attr.name]
        }
        const rawAttrsList = el.rawAttrsList || []
        for (let i = rawAttrsList.length - 1; i >= 0; i--) {
          if (rawAttrsList[i].name === attr.name) {
            rawAttrsList[i].name = realName
            break
          }
        }
        attr.name = realName
      }
    })
  }
}
export default {
  transformNode
}
