import { renderStartingTag } from './render-starting-tag'

export function createSyncRenderer (modules, directives, isUnaryTag) {
  function renderComponent (component, isRoot) {
    component.$mount()
    return renderNode(component._vnode, isRoot)
  }

  function renderNode (node, isRoot) {
    if (node.componentOptions) {
      node.data.hook.init(node)
      return renderComponent(node.child, isRoot)
    } else {
      return node.tag
        ? renderElement(node, isRoot)
        : node.text
    }
  }

  function renderElement (el, isRoot) {
    if (isRoot) {
      if (!el.data) el.data = {}
      if (!el.data.attrs) el.data.attrs = {}
      el.data.attrs['server-rendered'] = 'true'
    }
    const startTag = renderStartingTag(el, modules, directives)
    const endTag = `</${el.tag}>`
    if (isUnaryTag(el.tag)) {
      return startTag
    } else if (!el.children || !el.children.length) {
      return startTag + endTag
    } else {
      let children = ''
      for (let i = 0; i < el.children.length; i++) {
        children += renderNode(el.children[i])
      }
      return startTag + children + endTag
    }
  }

  return function renderToString (component) {
    return renderComponent(component, true)
  }
}
