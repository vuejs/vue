/* @flow */

export * from './merge-hook'
export * from './update-listeners'
export * from './normalize-children'

export function getFirstComponentChild (children: ?Array<VNode>): ?VNode {
  return children && children.filter((c: VNode) => c && c.componentOptions)[0]
}
