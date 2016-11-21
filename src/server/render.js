/* @flow */

import { escape } from 'he'
import { compileToFunctions } from 'web/compiler/index'
import { createComponentInstanceForVnode } from 'core/vdom/create-component'
import { noop } from 'shared/util'

let warned = Object.create(null)
const warnOnce = msg => {
  if (!warned[msg]) {
    warned[msg] = true
    console.warn(`\n\u001b[31m${msg}\u001b[39m\n`)
  }
}

const normalizeAsync = (cache, method) => {
  const fn = cache[method]
  if (!fn) {
    return
  } else if (fn.length > 1) {
    return (key, cb) => fn.call(cache, key, cb)
  } else {
    return (key, cb) => cb(fn.call(cache, key))
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

const nextFactory = context => function next () {
  const lastState = context.renderStates.pop()
  if (!lastState) {
    context.done()
    // cleanup context, avoid leakage
    context = (null: any)
    return
  }
  switch (lastState.type) {
    case 'Component':
      context.activeInstance = lastState.prevActive
      next()
      break
    case 'Element':
      const { children, total } = lastState
      const rendered = lastState.rendered++
      if (rendered < total) {
        context.renderStates.push(lastState)
        renderNode(children[rendered], false, context)
      } else {
        context.write(lastState.endTag, next)
      }
      break
    case 'ComponentWithCache':
      const { buffer, bufferIndex, key } = lastState
      const result = buffer[bufferIndex]
      context.cache.set(key, result)
      if (bufferIndex === 0) {
        // this is a top-level cached component,
        // exit caching mode.
        context.write.caching = false
      } else {
        // parent component is also being cached,
        // merge self into parent's result
        buffer[bufferIndex - 1] += result
      }
      buffer.length = bufferIndex
      next()
      break
  }
}

export function createRenderFunction (
  modules: Array<Function>,
  directives: Object,
  isUnaryTag: Function,
  cache: any
) {
  if (cache && (!cache.get || !cache.set)) {
    throw new Error('renderer cache must implement at least get & set.')
  }

  const get = cache && normalizeAsync(cache, 'get')
  const has = cache && normalizeAsync(cache, 'has')

  return function render (
    component: Component,
    write: (text: string, next: Function) => void,
    done: Function
  ) {
    checkBuild(component)
    warned = Object.create(null)
    const context = {
      activeInstance: component,
      renderStates: [],
      next: noop, // for flow
      write, done,
      isUnaryTag, modules, directives,
      cache, get, has
    }
    context.next = nextFactory(context)
    normalizeRender(component)
    renderNode(component._render(), true, context)
  }
}

function checkBuild (component) {
  let Vue = component.constructor
  while (Vue.super) {
    Vue = Vue.super
  }
  if (Vue.compile) {
    console.error(
      red(`\n[vue-server-renderer] You are using the standalone build (vue/dist/vue.js) for ` +
      `server-side rendering. It is recommended to use the CommonJS build ` +
      `(vue/dist/vue.common.js) instead so that the code can run in ` +
      `production mode by setting NODE_ENV=production. The server renderer ` +
      `supports the template option regardless of what build you are using.\n`)
    )
  }
}

function red (str) {
  return '\u001B[1m\u001B[31m' + str + '\u001B[39m\u001B[22m'
}
