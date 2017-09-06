/* @flow */

import { addAttr } from 'compiler/helpers'

function genText (node: ASTNode) {
  const value = node.type === 3
    ? node.text
    : node.type === 2
      ? node.tokens.length === 1
        ? node.tokens[0]
        : node.tokens
      : ''
  return JSON.stringify(value)
}

export function transformText (el: ASTElement) {
  // weex <text> can only contain text, so the parser
  // always generates a single child.
  addAttr(el, 'value', genText(el.children[0]))
  el.children = []
  el.plain = false
}
