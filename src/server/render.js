/* @flow */

import { escape } from 'he'
import { SSR_ATTR } from 'shared/constants'
import { RenderContext } from './render-context'
import { compileToFunctions } from 'web/compiler/index'
import { createComponentInstanceForVnode } from 'core/vdom/create-component'

import { isDef, isUndef, isTrue } from 'shared/util'

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
  if (isUndef(render)) {
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
  const { write, next, userContext } = context
  if (isDef(node.componentOptions)) {
    // check cache hit
    const Ctor = node.componentOptions.Ctor
    const getKey = Ctor.options.serverCacheKey
    const name = Ctor.options.name

    // exposed by vue-loader, need to call this if cache hit because
    // component lifecycle hooks will not be called.
    const registerComponent = Ctor.options._ssrRegister
    if (write.caching && isDef(registerComponent)) {
      write.componentBuffer[write.componentBuffer.length - 1].add(registerComponent)
    }

    const cache = context.cache
    if (isDef(getKey) && isDef(cache) && isDef(name)) {
      const key = name + '::' + getKey(node.componentOptions.propsData)
      const { has, get } = context
      if (isDef(has)) {
        (has: any)(key, hit => {
          if (hit === true && isDef(get)) {
            (get: any)(key, res => {
              registerComponent && registerComponent(userContext)
              res.components.forEach(register => register(userContext))
              write(res.html, next)
            })
          } else {
            renderComponentWithCache(node, isRoot, key, context)
          }
        })
      } else if (isDef(get)) {
        (get: any)(key, res => {
          if (isDef(res)) {
            registerComponent && registerComponent(userContext)
            res.components.forEach(register => register(userContext))
            write(res.html, next)
          } else {
            renderComponentWithCache(node, isRoot, key, context)
          }
        })
      }
    } else {
      if (isDef(getKey) && isUndef(cache)) {
        warnOnce(
          `[vue-server-renderer] Component ${
            Ctor.options.name || '(anonymous)'
          } implemented serverCacheKey, ` +
          'but no cache was provided to the renderer.'
        )
      }
      if (isDef(getKey) && isUndef(name)) {
        warnOnce(
          `[vue-server-renderer] Components that implement "serverCacheKey" ` +
          `must also define a unique "name" option.`
        )
      }
      renderComponent(node, isRoot, context)
    }
  } else {
    if (isDef(node.tag)) {
      renderElement(node, isRoot, context)
    } else if (isTrue(node.isComment)) {
      write(`<!--${node.text}-->`, next)
    } else {
      write(node.raw ? node.text : escape(String(node.text)), next)
    }
  }
}

function renderComponent (node, isRoot, context) {
  const prevActive = context.activeInstance
  const child = context.activeInstance = createComponentInstanceForVnode(
    node,
    context.activeInstance
  )
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
  const componentBuffer = write.componentBuffer
  componentBuffer.push(new Set())
  context.renderStates.push({
    type: 'ComponentWithCache',
    key,
    buffer,
    bufferIndex,
    componentBuffer
  })
  renderComponent(node, isRoot, context)
}

function renderElement (el, isRoot, context) {
  if (isTrue(isRoot)) {
    if (!el.data) el.data = {}
    if (!el.data.attrs) el.data.attrs = {}
    el.data.attrs[SSR_ATTR] = 'true'
  }
  const startTag = renderStartingTag(el, context)
  const endTag = `</${el.tag}>`
  const { write, next } = context
  if (context.isUnaryTag(el.tag)) {
    write(startTag, next)
  } else if (isUndef(el.children) || el.children.length === 0) {
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

function getVShowDirectiveInfo (node: VNode): ?VNodeDirective {
  let dir: VNodeDirective
  let tmp

  while (isDef(node)) {
    if (node.data && node.data.directives) {
      tmp = node.data.directives.find(dir => dir.name === 'show')
      if (tmp) {
        dir = tmp
      }
    }
    node = node.parent
  }
  return dir
}

function renderStartingTag (node: VNode, context) {
  let markup = `<${node.tag}`
  const { directives, modules } = context

  // construct synthetic data for module processing
  // because modules like style also produce code by parent VNode data
  if (isUndef(node.data) && hasAncestorData(node)) {
    node.data = {}
  }
  if (isDef(node.data)) {
    // check directives
    const dirs = node.data.directives
    if (dirs) {
      for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i].name
        const dirRenderer = directives[name]
        if (dirRenderer && name !== 'show') {
          // directives mutate the node's data
          // which then gets rendered by modules
          dirRenderer(node, dirs[i])
        }
      }
    }

    // v-show directive needs to be merged from parent to child
    const vshowDirectiveInfo = getVShowDirectiveInfo(node)
    if (vshowDirectiveInfo) {
      directives.show(node, vshowDirectiveInfo)
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
  if (isDef(activeInstance) &&
      activeInstance !== node.context &&
      isDef(scopeId = activeInstance.$options._scopeId)) {
    markup += ` ${(scopeId: any)}`
  }
  while (isDef(node)) {
    if (isDef(scopeId = node.context.$options._scopeId)) {
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
    userContext: ?Object,
    done: Function
  ) {
    warned = Object.create(null)
    const context = new RenderContext({
      activeInstance: component,
      userContext,
      write, done, renderNode,
      isUnaryTag, modules, directives,
      cache
    })
    normalizeRender(component)
    renderNode(component._render(), true, context)
  }
}
