import { addProp } from 'compiler/helpers'
import { ASTDirective, ASTElement } from 'typescript/compiler'

export default function text(el: ASTElement, dir: ASTDirective) {
  if (dir.value) {
    addProp(el, 'textContent', `_s(${dir.value})`, dir)
  }
}
