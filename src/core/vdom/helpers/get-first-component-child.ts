import { isDef, isArray } from 'shared/util'
import VNode from '../vnode'
import { isAsyncPlaceholder } from './is-async-placeholder'

export function getFirstComponentChild(
  children?: Array<VNode>
): VNode | undefined {
  return isArray(children)
    ? children.find(c => isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c)))
    : undefined
}
