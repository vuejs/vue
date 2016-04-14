import Vue from '../instance/index'

export default function Component (Ctor, data, children) {
  if (typeof Ctor === 'object') {
    Ctor = Vue.extend(Ctor)
  }
  // return a placeholder vnode
  return {
    sel: 'component',
    data: {
      hook: { init, prepatch, destroy },
      Ctor, data, children
    }
  }
}

function init (vnode) {
  const data = vnode.data
  const child = new data.Ctor({
    _renderData: data.data,
    _renderChildren: data.children
  })
  child.$mount()
  data.child = child
  data.vnode = child._vnode
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
    // try re-render child. the child may optimize it
    // and just does nothing.
    old.child._tryUpdate(cur.data, cur.children)
    cur.vnode = old.child._vnode
  }
}

function destroy (vnode) {
  vnode.data.childComponent.$destroy()
}
