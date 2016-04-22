import { makeMap } from '../../shared/util'

/**
 * Goal of the optimizier: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */

export function optimize (root) {
  // first pass: mark all dynamic nodes
  mark(root)
  debugger
  // second pass: collect static roots
  const staticRoots = []
  sweep(root, staticRoots)
  return staticRoots
}

function mark (node) {
  node.dynamic = !isStatic(node)
  if (node.children) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      let child = node.children[i]
      mark(child)
      if (child.dynamic) {
        node.dynamic = true
      }
    }
  }
}

function sweep (node, staticRoots) {
  if (node.tag && !node.dynamic) {
    node.staticRoot = true
    return
  }
  if (node.children) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      sweep(node.children[i], staticRoots)
    }
  }
}

const isStaticKey = makeMap(
  'tag,attrsList,attrsMap,plain,parent,children,' +
  'staticAttrs,staticClass'
)

function isStatic (node) {
  return node.pre || node.text || (
    !node.render &&
    !node.slotName &&
    !node.component &&
    !node.expression && (
      node.plain || Object.keys(node).every(isStaticKey)
    )
  )
}
