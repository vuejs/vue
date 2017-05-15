/* @flow */

import { no, isBuiltInTag } from 'shared/util'

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
  // first pass: mark all non-optimizable nodes.
  markNonOptimizable(root)
  // second pass: mark optimizable trees.
  markOptimizableTrees(root, false)
}

function markNonOptimizable (node: ASTNode) {
  node.ssrOptimizable = isOptimizable(node)
  if (node.type === 1) {
    // do not make component slot content optimizable so that render fns can
    // still manipulate the nodes.
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markNonOptimizable(child)
      if (!child.ssrOptimizable) {
        node.ssrOptimizable = false
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markNonOptimizable(block)
        if (!block.ssrOptimizable) {
          node.ssrOptimizable = false
        }
      }
    }
  }
}

function isOptimizable (node: ASTNode): boolean {
  if (node.type === 2 || node.type === 3) { // text or expression
    return true
  }
  return (
    !isBuiltInTag(node.tag) && // not a built-in (slot, component)
    !!isPlatformReservedTag(node.tag) // not a component
  )
}

function markOptimizableTrees (node: ASTNode) {
  if (node.type === 1) {
    if (node.ssrOptimizable) {
      node.ssrOptimizableRoot = true
      return
    } else {
      node.ssrOptimizableRoot = false
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markOptimizableTrees(node.children[i])
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markOptimizableTrees(node.ifConditions[i].block)
      }
    }
  }
}
