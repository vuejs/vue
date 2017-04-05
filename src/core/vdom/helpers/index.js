/* @flow */

export * from './merge-hook'
export * from './extract-props'
export * from './update-listeners'
export * from './normalize-children'
export * from './resolve-async-component'

export function getFirstComponentChild (children: ?Array<VNode>): ?VNode {
  return children && children.filter((c: VNode) => c && c.componentOptions)[0]
}
