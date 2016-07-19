/* @flow */

import { isPrimitive } from '../util/index'
import VNode from './vnode'

export function normalizeChildren (
  children: any,
  ns: string | void
): Array<VNode> | void {
  // invoke children thunks.
  // components always receive their children as thunks so that they
  // can perform the actual render inside their own dependency collection cycle.
  if (typeof children === 'function') {
    children = children()
  }
  if (isPrimitive(children)) {
    return [createTextVNode(children)]
  }
  if (Array.isArray(children)) {
    const res = []
    for (let i = 0, l = children.length; i < l; i++) {
      const c = children[i]
      const last = res[res.length - 1]
      //  nested
      if (Array.isArray(c)) {
        res.push.apply(res, normalizeChildren(c, ns))
      } else if (isPrimitive(c)) {
        if (last && last.text) {
          last.text += String(c)
        } else {
          // convert primitive to vnode
          res.push(createTextVNode(c))
        }
      } else if (c instanceof VNode) {
        if (c.text && last && last.text) {
          last.text += c.text
        } else {
          // inherit parent namespace
          if (ns) {
            applyNS(c, ns)
          }
          res.push(c)
        }
      }
    }
    return res
  }
}

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

function applyNS (vnode, ns) {
  if (vnode.tag && !vnode.ns) {
    vnode.ns = ns
    if (vnode.children) {
      for (let i = 0, l = vnode.children.length; i < l; i++) {
        applyNS(vnode.children[i], ns)
      }
    }
  }
}

// in case the child is also an abstract component, e.g. <transition-control>
// we want to recrusively retrieve the real component to be rendered
export function getRealChild (vnode: ?VNode): ?VNode {
  const compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(compOptions.propsData && compOptions.propsData.child)
  } else {
    return vnode
  }
}

export function mergeVNodeHook (def: Object, key: string, hook: Function) {
  const oldHook = def[key]
  if (oldHook) {
    def[key] = function () {
      oldHook.apply(this, arguments)
      hook.apply(this, arguments)
    }
  } else {
    def[key] = hook
  }
}

export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function
) {
  let name, cur, old, fn, event, capture
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (!old) {
      capture = name.charAt(0) === '!'
      event = capture ? name.slice(1) : name
      if (Array.isArray(cur)) {
        add(event, (cur.invoker = arrInvoker(cur)), capture)
      } else {
        fn = cur
        cur = on[name] = {}
        cur.fn = fn
        add(event, (cur.invoker = fnInvoker(cur)), capture)
      }
    } else if (Array.isArray(old)) {
      old.length = cur.length
      for (let i = 0; i < old.length; i++) old[i] = cur[i]
      on[name] = old
    } else {
      old.fn = cur
      on[name] = old
    }
  }
  for (name in oldOn) {
    if (!on[name]) {
      event = name.charAt(0) === '!' ? name.slice(1) : name
      remove(event, oldOn[name].invoker)
    }
  }
}

function arrInvoker (arr: Array<Function>): Function {
  return function (ev) {
    const single = arguments.length === 1
    for (let i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments)
    }
  }
}

function fnInvoker (o: { fn: Function }): Function {
  return function (ev) {
    const single = arguments.length === 1
    single ? o.fn(ev) : o.fn.apply(null, arguments)
  }
}
