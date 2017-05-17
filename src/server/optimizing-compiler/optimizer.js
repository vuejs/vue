/* @flow */

/**
 * In SSR, the vdom tree is generated only once and never patched, so
 * we can optimize most element / trees into plain string render functions.
 * The SSR optimizer walks the AST tree to detect optimizable elements and trees.
 *
 * The criteria for SSR optimizability is quite a bit looser than static tree
 * detection (which is designed for client re-render). In SSR we bail only for
 * components/slots/custom directives.
 */

import { no, makeMap, isBuiltInTag } from 'shared/util'

// optimizability constants
export const optimizability = {
  FALSE: 0,    // whole sub tree un-optimizable
  FULL: 1,     // whole sub tree optimizable
  SELF: 2,     // self optimizable but has some un-optimizable children
  CHILDREN: 3, // self un-optimizable but have fully optimizable children
  PARTIAL: 4   // self un-optimizable with some un-optimizable children
}

let isPlatformReservedTag

export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  isPlatformReservedTag = options.isReservedTag || no
  walk(root, true)
}

function walk (node: ASTNode, isRoot?: boolean) {
  if (isUnOptimizableTree(node)) {
    node.ssrOptimizability = optimizability.FALSE
    return
  }
  // root node or nodes with custom directives should always be a VNode
  const selfUnoptimizable = isRoot || hasCustomDirective(node)
  const check = child => {
    if (child.ssrOptimizability !== optimizability.FULL) {
      node.ssrOptimizability = selfUnoptimizable
        ? optimizability.PARTIAL
        : optimizability.SELF
    }
  }
  if (selfUnoptimizable) {
    node.ssrOptimizability = optimizability.CHILDREN
  }
  if (node.type === 1) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      walk(child)
      check(child)
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        walk(block)
        check(block)
      }
    }
    if (node.ssrOptimizability == null) {
      node.ssrOptimizability = optimizability.FULL
    }
  } else {
    node.ssrOptimizability = optimizability.FULL
  }
}

function isUnOptimizableTree (node: ASTNode): boolean {
  if (node.type === 2 || node.type === 3) { // text or expression
    return false
  }
  return (
    isBuiltInTag(node.tag) || // built-in (slot, component)
    !isPlatformReservedTag(node.tag) || // custom component
    !!node.component // "is" component
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
