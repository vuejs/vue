import Vue from '../instance/index'
import VNode from './vnode'
import { callHook } from '../instance/lifecycle'
import { warn, isObject, hasOwn, hyphenate } from '../util/index'

const hooks = { init, prepatch, insert, destroy }
const hooksToMerge = Object.keys(hooks)

export function createComponent (Ctor, data, parent, children) {
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
      resolveAsyncComponent(Ctor, () => {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered.
        parent.$forceUpdate()
      })
      return
    }
  }

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
  const id = `vue-component-${Ctor.cid}${
    Ctor.options.name ? `-${Ctor.options.name}` : ''
  }`
  const vnode = VNode(id, data)
  vnode.componentOptions = { Ctor, propsData, listeners, parent, children }
  return vnode
}

function init (vnode) {
  const { Ctor, propsData, listeners, parent, children } = vnode.componentOptions
  const child = new Ctor({
    parent,
    propsData,
    _parentVnode: vnode,
    _parentListeners: listeners,
    _renderChildren: children
  })
  // the child sets the parent vnode's elm when mounted
  // and when updated.
  child.$mount()
  vnode.child = child
}

function prepatch (oldVnode, vnode) {
  const oldCtor = oldVnode.componentOptions.Ctor
  const { Ctor, listeners, propsData, children } = vnode.componentOptions
  if (Ctor !== oldCtor) {
    // component changed, teardown and create new
    // TODO: keep-alive?
    oldVnode.child.$destroy()
    hooks.init(vnode)
  } else {
    vnode.child = oldVnode.child
    vnode.child._updateFromParent(
      propsData, // updated props
      listeners, // updated listeners
      vnode, // new parent vnode
      children // new children
    )
  }
}

function insert (vnode) {
  callHook(vnode.child, 'ready')
}

function destroy (vnode) {
  vnode.child.$destroy()
}

function resolveAsyncComponent (factory, cb) {
  if (factory.resolved) {
    // cached
    cb(factory.resolved)
  } else if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb)
  } else {
    factory.requested = true
    const cbs = factory.pendingCallbacks = [cb]
    factory(function resolve (res) {
      if (isObject(res)) {
        res = Vue.extend(res)
      }
      // cache resolved
      factory.resolved = res
      // invoke callbacks
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i](res)
      }
    }, function reject (reason) {
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${factory}` +
        (reason ? `\nReason: ${reason}` : '')
      )
    })
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
  if (!attrs && !props) {
    return res
  }
  for (let key in propOptions) {
    let altKey = hyphenate(key)
    if (attrs && hasOwn(attrs, key)) {
      res[key] = attrs[key]
      delete attrs[key]
    } else if (attrs && hasOwn(attrs, altKey)) {
      res[key] = attrs[altKey]
      delete attrs[altKey]
    } else if (props && hasOwn(props, key)) {
      res[key] = props[key]
      delete props[key]
    } else if (props && hasOwn(props, altKey)) {
      res[key] = props[altKey]
      delete props[altKey]
    }
  }
  return res
}

function mergeHooks (data) {
  if (data.hook) {
    for (let i = 0; i < hooksToMerge.length; i++) {
      let key = hooksToMerge[i]
      let fromParent = data.hook[key]
      let ours = hooks[key]
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
