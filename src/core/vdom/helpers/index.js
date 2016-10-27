/* @flow */

export * from './merge-hook'
export * from './update-listeners'
export * from './normalize-children'

export function getFirstComponentChild (children: ?Array<any>): ?VNodeWithData {
  return children && children.filter(c => c && c.componentOptions)[0]
}
