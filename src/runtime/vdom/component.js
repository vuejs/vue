import Vue from '../instance/index'
import { callHook } from '../instance/lifecycle'
import { warn, isObject } from '../util/index'

export default function Component (Ctor, data, parent, children) {
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
  // merge hooks on the placeholder node itself
  const hook = { init, insert, prepatch, destroy }
  if (data.hook) {
    for (let key in data.hook) {
      let existing = hook[key]
      let fromParent = data.hook[key]
      hook[key] = existing ? mergeHook(existing, fromParent) : fromParent
    }
  }
  // return a placeholder vnode
  return {
    tag: 'vue-component-' + Ctor.cid,
    key: data && data.key,
    data: { hook, Ctor, data, parent, children }
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

function init (vnode) {
  const data = vnode.data
  const child = new data.Ctor({
    parent: data.parent,
    _renderData: data.data,
    _renderChildren: data.children
  })
  child.$mount()
  data.child = child
}

function insert (vnode) {
  callHook(vnode.data.child, 'ready')
}

function prepatch (oldVnode, vnode) {
  const old = oldVnode.data
  const cur = vnode.data
  if (cur.Ctor !== old.Ctor) {
    // component changed, teardown and create new
    // TODO: keep-alive?
    old.child.$destroy()
    init(vnode)
  } else {
    cur.child = old.child
    // try re-render child. the child may optimize it
    // and just does nothing.
    old.child._updateFromParent(cur.data, cur.children, vnode.key)
  }
}

function destroy (vnode) {
  vnode.data.child.$destroy()
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
