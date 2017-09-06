/* @flow */

import { addAttr } from 'compiler/helpers'

let currentRecycleList = null

function preTransformNode (el: ASTElement) {
  if (el.tag === 'recycle-list') {
    currentRecycleList = el
  }
}

function transformNode (el: ASTElement) {
  if (currentRecycleList) {
    // TODO
  }
}

function postTransformNode (el: ASTElement) {
  if (currentRecycleList) {
    // <text>: transform children text into value attr
    if (el.tag === 'text') {
      addAttr(el, 'value', genText(el.children[0]))
      el.children = []
      el.plain = false
    }
  }
  if (el === currentRecycleList) {
    currentRecycleList = null
  }
}

function genText (node) {
  const value = node.type === 3
    ? node.text
    : node.type === 2
      ? node.tokens.length === 1
        ? node.tokens[0]
        : node.tokens
      : ''
  return JSON.stringify(value)
}

export default {
  preTransformNode,
  transformNode,
  postTransformNode
}
