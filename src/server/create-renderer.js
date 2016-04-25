export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false)
} = {}) {
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
    const startTag = renderStartingTag(el)
    if (isUnaryTag(el.tag)) {
      return startTag
    } else {
      const children = el.children
        ? el.children.map(renderNode).join('')
        : ''
      return startTag + children + `</${el.tag}>`
    }
  }

  function renderStartingTag (node) {
    let markup = `<${node.tag}`
    if (node.data) {
      // check directives
      const dirs = node.data.directives
      if (dirs) {
        for (let i = 0; i < dirs.length; i++) {
          let dirRenderer = directives[dirs[i].name]
          if (dirRenderer) {
            // directives mutate the node's data
            // which then gets rendered by modules
            dirRenderer(node, dirs[i])
          }
        }
      }
      // apply other modules
      for (let i = 0; i < modules.length; i++) {
        let res = modules[i](node)
        if (res) {
          markup += res
        }
      }
    }
    return markup + '>'
  }

  return {
    renderToString (component) {
      return renderComponent(component)
    }
  }
}
