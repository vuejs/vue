/* @flow */

import { addProp } from 'compiler/helpers'

export default function html (el: ASTElement, dir: ASTDirective) {
  if (dir.value) {
    addProp(el, 'innerHTML', `__toString__(${dir.value})`)
  }
}
