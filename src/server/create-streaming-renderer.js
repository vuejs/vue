import RenderStream from './render-stream'
import { renderStartingTag } from './render-starting-tag'

export function createStreamingRenderer (modules, directives, isUnaryTag) {
  function renderComponent (component, write, next, isRoot) {
    component.$mount()
    renderNode(component._vnode, write, next, isRoot)
  }

  function renderNode (node, write, next, isRoot) {
    if (node.componentOptions) {
      node.data.hook.init(node)
      renderComponent(node.child, write, next, isRoot)
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

  return function renderToStream (component) {
    return new RenderStream((write, done) => {
      renderComponent(component, write, done, true)
    })
  }
}
