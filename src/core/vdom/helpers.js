/* @flow */

import { isPrimitive } from '../util/index'
import VNode from './vnode'

const whitespace = new VNode(undefined, undefined, undefined, ' ')

export function normalizeChildren (children: any): Array<VNode> {
  if (typeof children === 'string') {
    return [new VNode(undefined, undefined, undefined, children)]
  }
  if (typeof children === 'function') {
    children = children()
  }
  if (Array.isArray(children)) {
    const res = []
    for (let i = 0, l = children.length; i < l; i++) {
      const c = children[i]
      //  nested
      if (Array.isArray(c)) {
        res.push.apply(res, normalizeChildren(c))
      } else if (isPrimitive(c)) {
        // optimize whitespace
        if (c === ' ') {
          res.push(whitespace)
        } else {
          // convert primitive to vnode
          res.push(new VNode(undefined, undefined, undefined, c))
        }
      } else if (c instanceof VNode) {
        res.push(c)
      }
    }
    return res
  }
  return []
}

export function updateListeners (on: Object, oldOn: Object, add: Function) {
  let name, cur, old, event, capture
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (old === undefined) {
      capture = name.charAt(0) === '!'
      event = capture ? name.slice(1) : name
      if (Array.isArray(cur)) {
        add(event, arrInvoker(cur), capture)
      } else {
        cur = { fn: cur }
        on[name] = cur
        add(event, fnInvoker(cur), capture)
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
