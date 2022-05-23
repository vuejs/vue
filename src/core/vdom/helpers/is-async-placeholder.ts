import VNode from '../vnode'

export function isAsyncPlaceholder(node: VNode): boolean {
  // @ts-expect-error not really boolean type
  return node.isComment && node.asyncFactory
}
