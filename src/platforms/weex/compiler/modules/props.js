/* @flow */

import { cached, camelize } from 'shared/util'

const normalize = cached(camelize)

function shouldCamelize (str: string) : boolean {
  if (!str || !str.match(/\-/)) {
    return false
  }
  return !str.match(/v\-bind|v\-for|v\-if|v\-model|@/)
}

function preTransformNode (el: ASTElement, options: CompilerOptions) {
  if (Array.isArray(el.attrsList)) {
    el.attrsList.forEach(attr => {
      if (shouldCamelize(attr.name)) {
        attr.name = normalize(attr.name)
      }
    })
  }
}
export default {
  preTransformNode
}
