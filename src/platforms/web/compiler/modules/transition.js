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
    el.transitionOnAppear = getBindingAttr(el, 'transition-on-appear') != null
  }
}

function genData (el: ASTElement): string {
  return el.transition
    ? `transition:{definition:(${el.transition}),appear:${el.transitionOnAppear}},`
    : ''
}

export default {
  parse,
  genData
}
