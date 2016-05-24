/* @flow */

import {
  getBindingAttr
} from 'compiler/helpers'

function parse (el: ASTElement) {
  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

function genData (el: ASTElement): string {
  return el.styleBinding
    ? `style:(${el.styleBinding}),`
    : ''
}

export default {
  parse,
  genData
}
