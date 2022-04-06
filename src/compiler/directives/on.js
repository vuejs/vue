/* @flow */

import { warn } from 'core/util/index'
import { isNotProduction } from '../../core/util/node_env'

export default function on (el: ASTElement, dir: ASTDirective) {
  if (isNotProduction && dir.modifiers) {
    warn(`v-on without argument does not support modifiers.`)
  }
  el.wrapListeners = (code: string) => `_g(${code},${dir.value})`
}
