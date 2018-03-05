/* @flow */

import { addIfCondition } from 'compiler/parser/index'
import { getAndRemoveAttr, addRawAttr } from 'compiler/helpers'

function hasConditionDirective (el: ASTElement): boolean {
  for (const attr in el.attrsMap) {
    if (/^v\-if|v\-else|v\-else\-if$/.test(attr)) {
      return true
    }
  }
  return false
}

function getPreviousConditions (el: ASTElement): Array<string> {
  const conditions = []
  if (el.parent && el.parent.children) {
    for (let c = 0, n = el.parent.children.length; c < n; ++c) {
      // $flow-disable-line
      const ifConditions = el.parent.children[c].ifConditions
      if (ifConditions) {
        for (let i = 0, l = ifConditions.length; i < l; ++i) {
          const condition = ifConditions[i]
          if (condition && condition.exp) {
            conditions.push(condition.exp)
          }
        }
      }
    }
  }
  return conditions
}

export function preTransformVIf (el: ASTElement, options: WeexCompilerOptions) {
  if (hasConditionDirective(el)) {
    let exp
    const ifExp = getAndRemoveAttr(el, 'v-if', true /* remove from attrsMap */)
    const elseifExp = getAndRemoveAttr(el, 'v-else-if', true)
    // don't need the value, but remove it to avoid being generated as a
    // custom directive
    getAndRemoveAttr(el, 'v-else', true)
    if (ifExp) {
      exp = ifExp
      addIfCondition(el, { exp: ifExp, block: el })
    } else {
      elseifExp && addIfCondition(el, { exp: elseifExp, block: el })
      const prevConditions = getPreviousConditions(el)
      if (prevConditions.length) {
        const prevMatch = prevConditions.join(' || ')
        exp = elseifExp
          ? `!(${prevMatch}) && (${elseifExp})` // v-else-if
          : `!(${prevMatch})` // v-else
      } else if (process.env.NODE_ENV !== 'production' && options.warn) {
        options.warn(
          `v-${elseifExp ? ('else-if="' + elseifExp + '"') : 'else'} ` +
          `used on element <${el.tag}> without corresponding v-if.`
        )
        return
      }
    }
    addRawAttr(el, '[[match]]', exp)
  }
}
