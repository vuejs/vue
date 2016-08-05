/* @flow */

import Vue from '../instance/index'
import VNode from './vnode'
import { normalizeChildren } from './helpers'
import { activeInstance, callHook } from '../instance/lifecycle'
import { resolveSlots } from '../instance/render'
import { warn, isObject, hasOwn, hyphenate, validateProp } from '../util/index'

const hooks = { init, prepatch, insert, destroy }
const hooksToMerge = Object.keys(hooks)

export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data?: VNodeData,
  context: Component,
  children?: VNodeChildren,
  tag?: string
): VNode | void {
  if (!Ctor) {
    return
  }

  if (isObject(Ctor)) {
    Ctor = Vue.extend(Ctor)
  }

  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${Ctor}`, context)
    }
    return
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved
    } else {
      Ctor = resolveAsyncComponent(Ctor, () => {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
        context.$forceUpdate()
      })
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return
      }
    }
  }

  data = data || {}

  // extract props
  const propsData = extractProps(data, Ctor)

  // functional component
  if (Ctor.options.functional) {
    const props = {}
    const propOptions = Ctor.options.props
    if (propOptions) {
      Object.keys(propOptions).forEach(key => {
        props[key] = validateProp(key, propOptions, propsData)
      })
    }
    return Ctor.options.render.call(
      null,
      context.$createElement,
      {
        props,
        parent: context,
        data,
        children: normalizeChildren(children),
        slots: () => resolveSlots(children)
      }
    )
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  data.on = data.nativeOn

  if (Ctor.options.abstract) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {}
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children }
  )
  return vnode
}

export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any // activeInstance in lifecycle state
): Component {
  const vnodeComponentOptions = vnode.componentOptions
  const options: InternalComponentOptions = {
    _isComponent: true,
    parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children
  }
  // check inline-template render functions
  const inlineTemplate = vnode.data.inlineTemplate
  if (inlineTemplate) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnodeComponentOptions.Ctor(options)
}

function init (vnode: VNodeWithData, hydrating: boolean) {
  if (!vnode.child) {
    const child = vnode.child = createComponentInstanceForVnode(vnode, activeInstance)
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
}

function prepatch (
  oldVnode: MountedComponentVNode,
  vnode: MountedComponentVNode
) {
  const options = vnode.componentOptions
  const child = vnode.child = oldVnode.child
  child._updateFromParent(
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  )
}

function insert (vnode: MountedComponentVNode) {
  if (!vnode.child._isMounted) {
    vnode.child._isMounted = true
    callHook(vnode.child, 'mounted')
  }
  if (vnode.data.keepAlive) {
    vnode.child._inactive = false
    callHook(vnode.child, 'activated')
  }
}

function destroy (vnode: MountedComponentVNode) {
  if (!vnode.child._isDestroyed) {
    if (!vnode.data.keepAlive) {
      vnode.child.$destroy()
    } else {
      vnode.child._inactive = true
      callHook(vnode.child, 'deactivated')
    }
  }
}

function resolveAsyncComponent (
  factory: Function,
  cb: Function
): Class<Component> | void {
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb)
  } else {
    factory.requested = true
    const cbs = factory.pendingCallbacks = [cb]
    let sync = true
    factory(
      // resolve
      (res: Object | Class<Component>) => {
        if (isObject(res)) {
          res = Vue.extend(res)
        }
        // cache resolved
        factory.resolved = res
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          for (let i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res)
          }
        }
      },
      // reject
      reason => {
        process.env.NODE_ENV !== 'production' && warn(
          `Failed to resolve async component: ${factory}` +
          (reason ? `\nReason: ${reason}` : '')
        )
      }
    )
    sync = false
    // return in case resolved synchronously
    return factory.resolved
  }
}

function extractProps (data: VNodeData, Ctor: Class<Component>): ?Object {
  // we are only extrating raw values here.
  // validation and default values are handled in the child
  // component itself.
  const propOptions = Ctor.options.props
  if (!propOptions) {
    return
  }
  const res = {}
  const { attrs, props, domProps } = data
  if (attrs || props || domProps) {
    for (const key in propOptions) {
      const altKey = hyphenate(key)
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey) ||
      checkProp(res, domProps, key, altKey)
    }
  }
  return res
}

function checkProp (
  res: Object,
  hash: ?Object,
  key: string,
  altKey: string,
  preserve?: boolean
): boolean {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      if (!preserve) {
        delete hash[key]
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey]
      if (!preserve) {
        delete hash[altKey]
      }
      return true
    }
  }
  return false
}

function mergeHooks (data: VNodeData) {
  if (!data.hook) {
    data.hook = {}
  }
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const fromParent = data.hook[key]
    const ours = hooks[key]
    data.hook[key] = fromParent ? mergeHook(ours, fromParent) : ours
  }
}

function mergeHook (a: Function, b: Function): Function {
  // since all hooks have at most two args, use fixed args
  // to avoid having to use fn.apply().
  return (_, __) => {
    a(_, __)
    b(_, __)
  }
}
