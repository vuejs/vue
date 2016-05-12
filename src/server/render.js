/* @flow */

import type Vue from 'core/instance/index'
import type VNode from 'core/vdom/vnode'
import { createComponentInstanceForVnode } from 'core/vdom/create-component'

export function createRenderFunction (
  modules: Array<Function>,
  directives: Object,
  isUnaryTag: Function
) {
  function renderNode (node: VNode, write: Function, next: Function, isRoot: boolean) {
    if (node.componentOptions) {
      const child = createComponentInstanceForVnode(node)
      renderNode(child._render(), write, next, isRoot)
    } else {
      if (node.tag) {
        renderElement(node, write, next, isRoot)
      } else {
        write(node.text, next)
      }
    }
  }

  function renderElement (el: VNode, write: Function, next: Function, isRoot: boolean) {
    if (isRoot) {
      if (!el.data) el.data = {}
      if (!el.data.attrs) el.data.attrs = {}
      el.data.attrs['server-rendered'] = 'true'
    }
    const startTag = renderStartingTag(el)
    const endTag = `</${el.tag}>`
    if (isUnaryTag(el.tag)) {
      write(startTag, next)
    } else if (!el.children || !el.children.length) {
      write(startTag + endTag, next)
    } else {
      const children: Array<VNode> = el.children || []
      write(startTag, () => {
        const total = children.length
        let rendered = 0

        function renderChild (child: VNode) {
          renderNode(child, write, () => {
            rendered++
            if (rendered < total) {
              renderChild(children[rendered])
            } else {
              write(endTag, next)
            }
          }, false)
        }

        renderChild(children[0])
      })
    }
  }

  function renderStartingTag (node: VNode) {
    let markup = `<${node.tag}`
    if (node.data) {
      // check directives
      const dirs = node.data.directives
      if (dirs) {
        for (let i = 0; i < dirs.length; i++) {
          const dirRenderer = directives[dirs[i].name]
          if (dirRenderer) {
            // directives mutate the node's data
            // which then gets rendered by modules
            dirRenderer(node, dirs[i])
          }
        }
      }
      // apply other modules
      for (let i = 0; i < modules.length; i++) {
        const res = modules[i](node)
        if (res) {
          markup += res
        }
      }
    }
    return markup + '>'
  }

  return function render (component: Vue, write: Function, done: Function) {
    renderNode(component._render(), write, done, true)
  }
}
