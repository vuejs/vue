/* @flow */

export default function ref (el: ASTElement, dir: ASTDirective) {
  if (dir.arg) {
    el.ref = dir.arg
    // go up and check if this node is inside a v-for
    let parent = el
    while (parent) {
      if (parent.for !== undefined) {
        el.refInFor = true
        break
      }
      parent = parent.parent
    }
  }
}
