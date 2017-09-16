/* @flow */

import { forAliasRE, forIteratorRE } from 'compiler/parser/index'
import { getAndRemoveAttr } from 'compiler/helpers'

export function transformVFor (el: ASTElement, options: CompilerOptions) {
  const exp = getAndRemoveAttr(el, 'v-for')
  if (!exp) {
    return
  }
  const inMatch = exp.match(forAliasRE)
  if (inMatch) {
    const alias = inMatch[1].trim()
    const desc: Object = {
      '@expression': inMatch[2].trim(),
      '@alias': alias
    }
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      desc['@alias'] = iteratorMatch[1].trim()
      desc['@index'] = iteratorMatch[2].trim()
      if (iteratorMatch[3]) {
        desc['@key'] = iteratorMatch[2].trim()
        desc['@index'] = iteratorMatch[3].trim()
      }
    }
    delete el.attrsMap['v-for']
    el.attrsMap['[[repeat]]'] = desc
    el.attrsList.push({ name: '[[repeat]]', value: desc })
  } else if (process.env.NODE_ENV !== 'production' && options.warn) {
    options.warn(`Invalid v-for expression: ${exp}`)
  }
}
