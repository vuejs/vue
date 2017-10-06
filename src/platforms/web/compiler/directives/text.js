/* @flow */

import { addProp } from 'compiler/helpers'

export default function text (el: ASTElement, dir: ASTDirective, warn: Function) {
  if (el.children.length) {
    warn(
      `<${el.tag} v-text="${dir.value}">:\n` +
      'Element content should be empty with v-text, because it will be overwritten.'
    )
  }

  if (dir.value) {
    addProp(el, 'textContent', `_s(${dir.value})`)
  }
}
