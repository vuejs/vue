/* @flow */

import { transformText } from './text'
import { transformVBind } from './v-bind'
import { transformVIf } from './v-if'

let currentRecycleList = null

function preTransformNode (el: ASTElement) {
  if (el.tag === 'recycle-list') {
    currentRecycleList = el
  }
}

function transformNode (el: ASTElement) {
  if (currentRecycleList) {
    // TODO
    transformVIf(el)
    transformVBind(el)
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
