/* @flow */

import { addProp } from 'compiler/helpers'

export default function text (el: ASTElement, dir: ASTDirective) {
  if (dir.value) {
    // `v.` prefix is added in genHandlers
    addProp(el, 'textContent', `_s(v.${dir.value})`)
  }
}
