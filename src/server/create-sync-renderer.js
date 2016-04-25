import { renderStartingTag } from './render-starting-tag'

export function createSyncRenderer (modules, directives, isUnaryTag) {
  function renderComponent (component) {
    component.$mount()
    return renderNode(component._vnode)
  }

  function renderNode (node) {
    if (node.componentOptions) {
      node.data.hook.init(node)
      return renderComponent(node.child)
    } else {
      return node.tag
        ? renderElement(node)
        : node.text
    }
  }

  function renderElement (el) {
    const startTag = renderStartingTag(el, modules, directives)
    if (isUnaryTag(el.tag)) {
      return startTag
    } else {
      const children = el.children
        ? el.children.map(renderNode).join('')
        : ''
      return startTag + children + `</${el.tag}>`
    }
  }

  return renderComponent
}
