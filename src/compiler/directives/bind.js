/* @flow */

export default function bind (el: ASTElement, dir: ASTDirective) {
  el.wrapData = (code: string) => {
    return `_b(${
      code
    },${
      dir.value
    }${
      dir.modifiers && dir.modifiers.prop ? ',true' : ''
    })`
  }
}
