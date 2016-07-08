/* @flow */

import {
  getBindingAttr
} from 'compiler/helpers'

function transformNode (el: ASTElement) {
  let transition = getBindingAttr(el, 'transition')
  if (transition === '""') {
    transition = true
  }
  if (transition) {
    el.transition = transition
  }
  const mode = getBindingAttr(el, 'transition-mode')
  if (mode) {
    el.transitionMode = mode
  }
}

let transitionKey = 0
function genData (el: ASTElement): string {
  return el.transition
    ? `transition:${el.transition},${
        // ensure a unique key for elements with transition,
        // if it doesn't already have one.
        el.key ? '' : `key:"__t${transitionKey++}__",`
      }`
    : ''
}

function transformCode (el: ASTElement, code: string): string {
  return el.transitionMode
    ? `_h('TransitionControl',{props:{mode:${
        el.transitionMode
      },child:${code}}})`
    : code
}

export default {
  transformNode,
  genData,
  transformCode
}
