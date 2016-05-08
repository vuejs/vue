export function createRenderFunction (modules, directives, isUnaryTag) {
  function renderNode (node, write, next, isRoot) {
    if (node.componentOptions) {
      const { Ctor, propsData, listeners, parent, children } = node.componentOptions
      const options = {
        parent,
        propsData,
        _parentVnode: node,
        _parentListeners: listeners,
        _renderChildren: children
      }
      // check inline-template render functions
      const inlineTemplate = node.data.inlineTemplate
      if (inlineTemplate) {
        options.render = inlineTemplate.render
        options.staticRenderFns = inlineTemplate.staticRenderFns
      }
      const child = new Ctor(options)
      child._renderStaticTrees()
      const childRoot = child._render()
      childRoot.parent = node
      renderNode(childRoot, write, next, isRoot)
    } else {
      if (node.tag) {
        renderElement(node, write, next, isRoot)
      } else {
        write(node.text, next)
      }
    }
  }

  function renderElement (el, write, next, isRoot) {
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
      write(startTag, () => {
        const total = el.children.length
        let rendered = 0

        function renderChild (child) {
          renderNode(child, write, () => {
            rendered++
            if (rendered < total) {
              renderChild(el.children[rendered])
            } else {
              write(endTag, next)
            }
          })
        }

        renderChild(el.children[0])
      })
    }
  }

  function renderStartingTag (node) {
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

  return function render (component, write, done) {
    component._renderStaticTrees()
    renderNode(component._render(), write, done, true)
  }
}
