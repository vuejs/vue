/* @flow */

import {
  getAndRemoveAttr,
  getBindingAttr
} from 'compiler/helpers'

function transformNode (el: ASTElement) {
  const staticStyle = getAndRemoveAttr(el, 'style')
  if (staticStyle) {
    el.staticStyle = staticStyle
  }

  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

function genData (el: ASTElement): string {
  let data = ''
  if (el.staticStyle) {
    data += 'staticStyle:"' + (el.staticStyle) + '",'
  }
  if (el.styleBinding) {
    data += 'style:(' + (el.styleBinding) + '),'
  }
  return data
}

export default {
  staticKeys: ['staticStyle'],
  transformNode,
  genData
}
