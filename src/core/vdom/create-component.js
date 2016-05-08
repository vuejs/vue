import Vue from '../instance/index'
import VNode from './vnode'
import { callHook } from '../instance/lifecycle'
import { warn, isObject, hasOwn, hyphenate } from '../util/index'

const hooks = { init, prepatch, insert, destroy }
const hooksToMerge = Object.keys(hooks)

export function createComponent (Ctor, data, parent, children, context) {
  if (process.env.NODE_ENV !== 'production' &&
    children && typeof children !== 'function') {
    warn(
      'A component\'s children should be a function that returns the ' +
      'children array. This allows the component to track the children ' +
      'dependencies and optimizes re-rendering.'
    )
  }
  if (!Ctor) {
    return
  }
  if (isObject(Ctor)) {
    Ctor = Vue.extend(Ctor)
  }
  if (process.env.NODE_ENV !== 'production' && typeof Ctor !== 'function') {
    warn(`Invalid Component definition: ${Ctor}`, parent)
    return
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved
    } else {
      const resolved = resolveAsyncComponent(Ctor, () => {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered.
        parent.$forceUpdate()
      })
      if (!resolved || !resolved.cid) {
        return
      }
      Ctor = resolved
    }
  }

  data = data || {}

  // merge component management hooks onto the placeholder node
  mergeHooks(data)

  // extract props
  const propsData = extractProps(data, Ctor)

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  if (listeners) {
    data.on = null
  }

  // return a placeholder vnode
  const name = Ctor.options.name ? ('-' + Ctor.options.name) : ''
  const vnode = VNode(
    `vue-component-${Ctor.cid}${name}`, data,
    undefined, undefined, undefined, undefined, context
  )
  vnode.componentOptions = { Ctor, propsData, listeners, parent, children }
  return vnode
}

function init (vnode) {
  const { Ctor, propsData, listeners, parent, children } = vnode.componentOptions
  const options = {
    parent,
    propsData,
    _parentVnode: vnode,
    _parentListeners: listeners,
    _renderChildren: children
  }
  // check inline-template render functions
  const inlineTemplate = vnode.data.inlineTemplate
  if (inlineTemplate) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  const child = new Ctor(options)
  // if this is a server-rendered mount,
  // the vnode would already have an element.
  // otherwise the child sets the parent vnode's elm when mounted
  // and when updated.
  child.$mount(vnode.elm)
  vnode.child = child
}

function prepatch (oldVnode, vnode) {
  const { listeners, propsData, children } = vnode.componentOptions
  vnode.child = oldVnode.child
  vnode.child._updateFromParent(
    propsData, // updated props
    listeners, // updated listeners
    vnode, // new parent vnode
    children // new children
  )
}

function insert (vnode) {
  callHook(vnode.child, 'ready')
}

function destroy (vnode) {
  vnode.child.$destroy()
}

function resolveAsyncComponent (factory, cb) {
  if (factory.resolved) {
    return factory.resolved
  } else if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb)
  } else {
    factory.requested = true
    const cbs = factory.pendingCallbacks = [cb]
    factory.resolved = factory(function resolve (res) {
      if (isObject(res)) {
        res = Vue.extend(res)
      }
      // cache resolved
      factory.resolved = res

      // invoke callbacks
      for (let i = 0, l = cbs.length; i < l; i++) {
        cbs[i](res)
        // Reset pending callbacks
        factory.pendingCallbacks = []
      }

      return res
    }, function reject (reason) {
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${factory}` +
        (reason ? `\nReason: ${reason}` : '')
      )
    })
    return factory.resolved
  }
}

function extractProps (data, Ctor) {
  // we are only extrating raw values here.
  // validation and default values are handled in the child
  // component itself.
  const propOptions = Ctor.options.props
  if (!propOptions) {
    return
  }
  const res = {}
  const attrs = data.attrs
  const props = data.props
  const staticAttrs = data.staticAttrs
  if (!attrs && !props) {
    return res
  }
  for (const key in propOptions) {
    const altKey = hyphenate(key)
    checkProp(res, attrs, key, altKey) ||
    checkProp(res, props, key, altKey) ||
    checkProp(res, staticAttrs, key, altKey)
  }
  return res
}

function checkProp (res, hash, key, altKey) {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      delete hash[key]
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey]
      delete hash[altKey]
      return true
    }
  }
}

function mergeHooks (data) {
  if (data.hook) {
    for (let i = 0; i < hooksToMerge.length; i++) {
      const key = hooksToMerge[i]
      const fromParent = data.hook[key]
      const ours = hooks[key]
      data.hook[key] = fromParent ? mergeHook(ours, fromParent) : ours
    }
  } else {
    data.hook = hooks
  }
}

function mergeHook (a, b) {
  // since all hooks have at most two args, use fixed args
  // to avoid having to use fn.apply().
  return (_, __) => {
    a(_, __)
    b(_, __)
  }
}
