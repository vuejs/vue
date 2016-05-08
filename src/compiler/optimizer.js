import { makeMap, isBuiltInTag } from 'shared/util'

let isPlatformReservedTag

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
export function optimize (root, options) {
  isPlatformReservedTag = options.isReservedTag || (() => false)
  // first pass: mark all non-static nodes.
  markStatic(root)
  // second pass: mark static roots.
  markStaticRoots(root)
}

function markStatic (node) {
  node.static = isStatic(node)
  if (node.children) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      if (!child.static) {
        node.static = false
      }
    }
  }
}

function markStaticRoots (node) {
  if (node.tag && (node.once || node.static)) {
    node.staticRoot = true
    return
  }
  if (node.children) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      markStaticRoots(node.children[i])
    }
  }
}

const isStaticKey = makeMap(
  'tag,attrsList,attrsMap,plain,parent,children,' +
  'staticAttrs,staticClass'
)

function isStatic (node) {
  return !!(node.text || node.pre || (
    !node.expression && // not text with interpolation
    !node.if && !node.for && // not v-if or v-for or v-else
    (!node.tag || isPlatformReservedTag(node.tag)) && // not a component
    !isBuiltInTag(node.tag) && // not a built-in
    (node.plain || Object.keys(node).every(isStaticKey)) // no dynamic bindings
  ))
}
