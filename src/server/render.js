/* @flow */

import { escape } from 'he'
import { RenderContext } from './render-context'
import { compileToFunctions } from 'web/compiler/index'
import { createComponentInstanceForVnode } from 'core/vdom/create-component'

let warned = Object.create(null)
const warnOnce = msg => {
  if (!warned[msg]) {
    warned[msg] = true
    console.warn(`\n\u001b[31m${msg}\u001b[39m\n`)
  }
}

const compilationCache = Object.create(null)
const normalizeRender = vm => {
  const { render, template } = vm.$options
  if (!render) {
    if (template) {
      const renderFns = (
        compilationCache[template] ||
        (compilationCache[template] = compileToFunctions(template))
      )
      Object.assign(vm.$options, renderFns)
    } else {
      throw new Error(
        `render function or template not defined in component: ${
          vm.$options.name || vm.$options._componentTag || 'anonymous'
        }`
      )
    }
  }
}

function renderNode (node, isRoot, context) {
  const { write, next } = context
  if (node.componentOptions) {
    // check cache hit
    const Ctor = node.componentOptions.Ctor
    const getKey = Ctor.options.serverCacheKey
    const name = Ctor.options.name
    const cache = context.cache
    if (getKey && cache && name) {
      const key = name + '::' + getKey(node.componentOptions.propsData)
      const { has, get } = context
      if (has) {
        has(key, hit => {
          if (hit && get) {
            get(key, res => write(res, next))
          } else {
            renderComponentWithCache(node, isRoot, key, context)
          }
        })
      } else if (get) {
        get(key, res => {
          if (res) {
            write(res, next)
          } else {
            renderComponentWithCache(node, isRoot, key, context)
          }
        })
      }
    } else {
      if (getKey && !cache) {
        warnOnce(
          `[vue-server-renderer] Component ${
            Ctor.options.name || '(anonymous)'
          } implemented serverCacheKey, ` +
          'but no cache was provided to the renderer.'
        )
      }
      if (getKey && !name) {
        warnOnce(
          `[vue-server-renderer] Components that implement "serverCacheKey" ` +
          `must also define a unique "name" option.`
        )
      }
      renderComponent(node, isRoot, context)
    }
  } else {
    if (node.tag) {
      renderElement(node, isRoot, context)
    } else if (node.isComment) {
      write(`<!--${node.text}-->`, next)
    } else {
      write(node.raw ? node.text : escape(String(node.text)), next)
    }
  }
}

function renderComponent (node, isRoot, context) {
  const prevActive = context.activeInstance
  const child = context.activeInstance = createComponentInstanceForVnode(node, context.activeInstance)
  normalizeRender(child)
  const childNode = child._render()
  childNode.parent = node
  context.renderStates.push({
    type: 'Component',
    prevActive
  })
  renderNode(childNode, isRoot, context)
}

function renderComponentWithCache (node, isRoot, key, context) {
  const write = context.write
  write.caching = true
  const buffer = write.cacheBuffer
  const bufferIndex = buffer.push('') - 1
  context.renderStates.push({
    type: 'ComponentWithCache',
    buffer, bufferIndex, key
  })
  renderComponent(node, isRoot, context)
}

function renderElement (el, isRoot, context) {
  if (isRoot) {
    if (!el.data) el.data = {}
    if (!el.data.attrs) el.data.attrs = {}
    el.data.attrs['server-rendered'] = 'true'
  }
  const startTag = renderStartingTag(el, context)
  const endTag = `</${el.tag}>`
  const { write, next } = context
  if (context.isUnaryTag(el.tag)) {
    write(startTag, next)
  } else if (!el.children || !el.children.length) {
    write(startTag + endTag, next)
  } else {
    const children: Array<VNode> = el.children
    context.renderStates.push({
      type: 'Element',
      rendered: 0,
      total: children.length,
      endTag, children
    })
    write(startTag, next)
  }
}

function hasAncestorData (node: VNode) {
  const parentNode = node.parent
  return parentNode && (parentNode.data || hasAncestorData(parentNode))
}

function renderStartingTag (node: VNode, context) {
  let markup = `<${node.tag}`
  const { directives, modules } = context

  // construct synthetic data for module processing
  // because modules like style also produce code by parent VNode data
  if (!node.data && hasAncestorData(node)) {
    node.data = {}
  }
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
  // attach scoped CSS ID
  let scopeId
  const activeInstance = context.activeInstance
  if (activeInstance &&
      activeInstance !== node.context &&
      (scopeId = activeInstance.$options._scopeId)) {
    markup += ` ${scopeId}`
  }
  while (node) {
    if ((scopeId = node.context.$options._scopeId)) {
      markup += ` ${scopeId}`
    }
    node = node.parent
  }
  return markup + '>'
}

export function createRenderFunction (
  modules: Array<Function>,
  directives: Object,
  isUnaryTag: Function,
  cache: any
) {
  return function render (
    component: Component,
    write: (text: string, next: Function) => void,
    done: Function
  ) {
    warned = Object.create(null)
    const context = new RenderContext({
      activeInstance: component,
      write, done, renderNode,
      isUnaryTag, modules, directives,
      cache
    })
    normalizeRender(component)
    renderNode(component._render(), true, context)
  }
}
