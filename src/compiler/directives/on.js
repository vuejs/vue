/* @flow */

import { warn, isProduction } from 'core/util/index'

export default function on (el: ASTElement, dir: ASTDirective) {
  if (!isProduction && dir.modifiers) {
    warn(`v-on without argument does not support modifiers.`)
  }
  el.wrapListeners = (code: string) => `_g(${code},${dir.value})`
}
