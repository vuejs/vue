/* @flow */

import {
  getBindingAttr
} from 'compiler/helpers'

function parse (el: ASTElement) {
  let transition = getBindingAttr(el, 'transition')
  if (transition === '""') {
    transition = true
  }
  if (transition) {
    el.transition = transition
  }
}

function genData (el: ASTElement): string {
  return el.transition
    ? `transition:${el.transition},`
    : ''
}

export default {
  parse,
  genData
}
