import { isDef, isArray } from 'shared/util'
import VNode from '../vnode'
import { isAsyncPlaceholder } from './is-async-placeholder'

export function getFirstComponentChild(
  children?: Array<VNode>
): VNode | undefined {
  if (isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}
