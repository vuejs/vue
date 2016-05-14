/* @flow */

import { addProp } from 'compiler/helpers'

export default function text (el: ASTElement, dir: ASTDirective) {
  if (!dir.value) return
  addProp(el, 'textContent', `__toString__(${dir.value})`)
}
