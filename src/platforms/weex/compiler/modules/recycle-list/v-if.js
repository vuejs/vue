/* @flow */

import { getAndRemoveAttr } from 'compiler/helpers'

export function transformVIf (el: ASTElement) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.attrsMap['[[match]]'] = exp
    el.attrsList.push({ name: '[[match]]', value: exp })
    delete el.attrsMap['v-if']
  }
  // TODO: support v-else and v-else-if
}
