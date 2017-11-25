/* @flow */

import { warn } from 'core/util/index'
import { getRawAttr } from '../helpers'

export default function on (el: ASTElement, dir: ASTDirective) {
  if (process.env.NODE_ENV !== 'production' && dir.modifiers) {
    warn(`v-on without argument does not support modifiers.`, getRawAttr(el, 'v-on'))
  }
  el.wrapListeners = (code: string) => `_g(${code},${dir.value})`
}
