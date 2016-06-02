/* @flow */

import Vue from '../instance/index'
import VNode from './vnode'
import { callHook } from '../instance/lifecycle'
import { warn, isObject, hasOwn, hyphenate } from '../util/index'

const hooks = { init, prepatch, insert, destroy }
const hooksToMerge = Object.keys(hooks)

export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data?: VNodeData,
  parent: Component,
  context: Component,
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
      warn(`Invalid Component definition: ${Ctor}`, parent)
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
        // $forceUpdate is buffered. this is only called
        // if the
        parent.$forceUpdate()
      })
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return
      }
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
    delete data.on
  }

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, parent, tag, children: undefined }
    // children to be set later by renderElementWithChildren,
    // but before the init hook
  )
  return vnode
}

export function createComponentInstanceForVnode (
  vnode: any // we know it's MountedComponentVNode but flow doesn't
): Component {
  const vnodeComponentOptions = vnode.componentOptions
  const options: InternalComponentOptions = {
    _isComponent: true,
    parent: vnodeComponentOptions.parent,
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
  const child = vnode.child = createComponentInstanceForVnode(vnode)
  child.$mount(hydrating ? vnode.elm : undefined, hydrating)
}

function prepatch (
  oldVnode: MountedComponentVNode,
  vnode: MountedComponentVNode
) {
  const options = vnode.componentOptions
  vnode.child = oldVnode.child
  vnode.child._updateFromParent(
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  )
}

function insert (vnode: MountedComponentVNode) {
  callHook(vnode.child, 'mounted')
}

function destroy (vnode: MountedComponentVNode) {
  vnode.child.$destroy()
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
  const attrs = data.attrs
  const props = data.props
  const staticAttrs = data.staticAttrs
  if (!attrs && !props && !staticAttrs) {
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

function checkProp (
  res: Object,
  hash: ?Object,
  key: string,
  altKey: string
): boolean {
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
  return false
}

function mergeHooks (data: VNodeData) {
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

function mergeHook (a: Function, b: Function): Function {
  // since all hooks have at most two args, use fixed args
  // to avoid having to use fn.apply().
  return (_, __) => {
    a(_, __)
    b(_, __)
  }
}
