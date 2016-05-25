/* @flow */

import { addHook } from '../helpers'

export default function bind (el: ASTElement, dir: ASTDirective) {
  addHook(el, 'construct', `_b(n1,${dir.value})`)
}
