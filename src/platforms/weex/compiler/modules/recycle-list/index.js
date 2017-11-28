/* @flow */

import { postTransformComponent } from './component'
import { postTransformText } from './text'
import { preTransformVBind } from './v-bind'
import { preTransformVIf } from './v-if'
import { preTransformVFor } from './v-for'
import { postTransformVOn } from './v-on'

let currentRecycleList = null

function shouldCompile (el: ASTElement, options: CompilerOptions) {
  return options.recyclable ||
    (currentRecycleList && el !== currentRecycleList)
}

function preTransformNode (el: ASTElement, options: CompilerOptions) {
  if (el.tag === 'recycle-list') {
    currentRecycleList = el
  }
  if (shouldCompile(el, options)) {
    preTransformVBind(el, options)
    preTransformVIf(el, options) // also v-else-if and v-else
    preTransformVFor(el, options)
  }
}

function transformNode (el: ASTElement, options: CompilerOptions) {
  if (shouldCompile(el, options)) {
    // do nothing yet
  }
}

function postTransformNode (el: ASTElement, options: CompilerOptions) {
  if (shouldCompile(el, options)) {
    postTransformComponent(el, options)
    // <text>: transform children text into value attr
    if (el.tag === 'text') {
      postTransformText(el, options)
    }
    postTransformVOn(el, options)
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
