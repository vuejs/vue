import { renderStartingTag } from './render-starting-tag'

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
      child._mount = () => {
        child._renderStaticTrees()
        renderNode(child._render(), write, next)
      }
      child.$mount(node.elm)
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
    const startTag = renderStartingTag(el, modules, directives)
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

  return function render (component, write, done) {
    component._renderStaticTrees()
    renderNode(component._render(), write, done, true)
  }
}
