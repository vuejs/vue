/* @flow */

import { cloneVNode, cloneVNodes } from 'core/vdom/vnode'

/**
 * Runtime helper for rendering static trees.
 */
export function renderStatic (
  index: number,
  isInFor?: boolean
): VNode | Array<VNode> {
  // static trees can be rendered once and cached on the contructor options
  // so every instance shares the same trees
  let options = this.constructor.options
  if (this.$options.staticRenderFns !== options.staticRenderFns) {
    options = this.$options
  }
  const trees = options._staticTrees || (options._staticTrees = [])
  let tree = trees[index]
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree by doing a shallow clone.
  if (tree && !isInFor) {
    return Array.isArray(tree)
      ? cloneVNodes(tree)
      : cloneVNode(tree)
  }
  // otherwise, render a fresh tree.
  tree = trees[index] =
    options.staticRenderFns[index].call(this._renderProxy, null, this)
  markStatic(tree, `__static__${index}`, false)
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
export function markOnce (
  tree: VNode | Array<VNode>,
  index: number,
  key: string
) {
  markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true)
  return tree
}

function markStatic (
  tree: VNode | Array<VNode>,
  key: string,
  isOnce: boolean
) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], `${key}_${i}`, isOnce)
      }
    }
  } else {
    markStaticNode(tree, key, isOnce)
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true
  node.key = key
  node.isOnce = isOnce
}
