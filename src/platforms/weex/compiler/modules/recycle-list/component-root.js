/* @flow */

import { addAttr } from 'compiler/helpers'

// mark component root nodes as
export function postTransformComponentRoot (el: ASTElement) {
  if (!el.parent) {
    // component root
    addAttr(el, '@isComponentRoot', 'true')
    addAttr(el, '@templateId', '_uid')
    addAttr(el, '@componentProps', '$props || {}')
  }
}
