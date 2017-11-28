/* @flow */

import { RECYCLE_LIST_MARKER } from 'weex/util/index'
import { createComponentInstanceForVnode } from 'core/vdom/create-component'

export function isRecyclableComponent (vnode: VNodeWithData): boolean {
  return vnode.data.attrs && (RECYCLE_LIST_MARKER in vnode.data.attrs)
}

export function renderRecyclableComponentTemplate (vnode: VNodeWithData): VNode {
  // TODO:
  // 1. adding @isComponentRoot / @componentProps to the root node
  // 2. proper error handling
  delete vnode.data.attrs[RECYCLE_LIST_MARKER]
  const instance = createComponentInstanceForVnode(vnode)
  return instance.$options['@render'].call(instance)
}
