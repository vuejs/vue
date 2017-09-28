/* @flow */

import { addProp } from 'compiler/helpers'

export default function html (el: ASTElement, dir: ASTDirective, warn: Function) {
  if (el.children.length) {
    warn(
      `<${el.tag} v-html="${dir.value}">:\n` +
      'Element content should be empty with v-html, because it will be overwritten.'
    )
  }

  if (dir.value) {
    addProp(el, 'innerHTML', `_s(${dir.value})`)
  }
}
