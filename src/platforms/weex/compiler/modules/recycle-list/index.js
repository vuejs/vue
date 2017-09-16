/* @flow */

import { transformText } from './text'
import { transformVBind } from './v-bind'
import { transformVIf } from './v-if'
import { transformVFor } from './v-for'

let currentRecycleList = null

function preTransformNode (el: ASTElement) {
  if (el.tag === 'recycle-list') {
    currentRecycleList = el
  }
  if (currentRecycleList) {
    // TODO
    transformVBind(el)
    transformVIf(el)
    transformVFor(el)
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
      transformText(el)
    }
  }
  if (el === currentRecycleList) {
    currentRecycleList = null
  }
}

export default {
  preTransformNode,
  transformNode,
  postTransformNode
}
