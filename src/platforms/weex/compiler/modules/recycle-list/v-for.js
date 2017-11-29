/* @flow */

import { forAliasRE, forIteratorRE, stripParensRE } from 'compiler/parser/index'
import { getAndRemoveAttr, addRawAttr } from 'compiler/helpers'

export function preTransformVFor (el: ASTElement, options: WeexCompilerOptions) {
  const exp = getAndRemoveAttr(el, 'v-for')
  if (!exp) {
    return
  }
  const inMatch = exp.match(forAliasRE)
  if (inMatch) {
    const alias = inMatch[1].trim().replace(stripParensRE, '')
    const desc: Object = {
      '@expression': inMatch[2].trim(),
      '@alias': alias
    }
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      desc['@alias'] = alias.replace(forIteratorRE, '')
      if (iteratorMatch[2]) {
        desc['@key'] = iteratorMatch[1].trim()
        desc['@index'] = iteratorMatch[2].trim()
      } else {
        desc['@index'] = iteratorMatch[1].trim()
      }
    }
    delete el.attrsMap['v-for']
    addRawAttr(el, '[[repeat]]', desc)
  } else if (process.env.NODE_ENV !== 'production' && options.warn) {
    options.warn(`Invalid v-for expression: ${exp}`)
  }
}
