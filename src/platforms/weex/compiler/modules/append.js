/* @flow */

import {
  getAndRemoveAttr
} from 'compiler/helpers'

function parse (el: ASTElement, options: CompilerOptions) {
  const staticStyle = getAndRemoveAttr(el, 'append')
  if (staticStyle === 'tree') {
    el.atom = true
  }
}

function genData (el: ASTElement): string {
  return el.atom ? `atom:true,` : ''
}

export default {
  staticKeys: ['atom'],
  parse,
  genData
}
