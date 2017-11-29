/* @flow */

import { addRawAttr } from 'compiler/helpers'

// mark component root nodes as
export function preTransformComponentRoot (
  el: ASTElement,
  options: WeexCompilerOptions
) {
  if (!el.parent) {
    // component root
    addRawAttr(el, '$isComponentRoot', true)
  }
}
