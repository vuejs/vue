/* @flow */

import { no, makeMap, isBuiltInTag } from 'shared/util'

// optimizability constants
export const FALSE = 0 // whole sub tree un-optimizable
export const FULL = 1 // whole sub tree optimizable
export const PARTIAL = 2 // self optimizable but has un-optimizable children
export const CHILDREN = 3 // self un-optimizable but may have optimizable children

let isPlatformReservedTag

/**
 * In SSR, the vdom tree is generated only once and never patched, so
 * we can optimize most element / trees into plain string render functions.
 * The SSR optimizer walks the AST tree to detect optimizable elements and trees.
 *
 * The criteria for SSR optimizability is quite a bit looser than static tree
 * detection (which is designed for client re-render). In SSR we bail only for
 * components/slots/custom directives.
 */
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  isPlatformReservedTag = options.isReservedTag || no
  walk(root, true)
}

function walk (node: ASTNode, isRoot?: boolean) {
  if (isUnOptimizableTree(node)) {
    node.ssrOptimizability = FALSE
    return
  }
  // root node or nodes with custom directives should always be a VNode
  if (isRoot || hasCustomDirective(node)) {
    node.ssrOptimizability = CHILDREN
  }
  if (node.type === 1) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      walk(child)
      if (child.ssrOptimizability !== FULL && node.ssrOptimizability == null) {
        node.ssrOptimizability = PARTIAL
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        walk(block)
        if (block.ssrOptimizability !== FULL && node.ssrOptimizability == null) {
          node.ssrOptimizability = PARTIAL
        }
      }
    }
    if (node.ssrOptimizability == null) {
      node.ssrOptimizability = FULL
    }
  } else {
    node.ssrOptimizability = FULL
  }
}

function isUnOptimizableTree (node: ASTNode): boolean {
  if (node.type === 2 || node.type === 3) { // text or expression
    return false
  }
  return (
    isBuiltInTag(node.tag) || // built-in (slot, component)
    !isPlatformReservedTag(node.tag) // custom component
  )
}

// only need to check built-in dirs with runtime
const isBuiltInDir = makeMap('model,show')

function hasCustomDirective (node: ASTNode): ?boolean {
  return (
    node.type === 1 &&
    node.directives &&
    node.directives.some(d => !isBuiltInDir(d.name))
  )
}
