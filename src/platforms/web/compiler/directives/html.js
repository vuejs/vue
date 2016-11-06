/* @flow */

import { addProp } from 'compiler/helpers'

export default function html (el: ASTElement, dir: ASTDirective) {
  if (dir.value) {
    // `v.` prefix is added in genHandlers
    addProp(el, 'innerHTML', `_s(v.${dir.value})`)
  }
}
