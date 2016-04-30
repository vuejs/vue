import { isArray, isPrimitive } from '../util/index'
import VNode from './vnode'

const whitespace = VNode(undefined, undefined, undefined, ' ')

export function flatten (children) {
  if (typeof children === 'string') {
    return [VNode(undefined, undefined, undefined, children)]
  }
  if (isArray(children)) {
    const res = []
    for (let i = 0, l = children.length; i < l; i++) {
      const c = children[i]
      // flatten nested
      if (isArray(c)) {
        res.push.apply(res, flatten(c))
      } else if (isPrimitive(c)) {
        // optimize whitespace
        if (c === ' ') {
          res.push(whitespace)
        } else {
          // convert primitive to vnode
          res.push(VNode(undefined, undefined, undefined, c))
        }
      } else if (c) {
        res.push(c)
      }
    }
    return res
  }
}

export function updateListeners (on, oldOn, add) {
  let name, cur, old, event, capture
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (old === undefined) {
      capture = name.charAt(0) === '!'
      event = capture ? name.slice(1) : name
      if (isArray(cur)) {
        add(event, arrInvoker(cur), capture)
      } else {
        cur = { fn: cur }
        on[name] = cur
        add(event, fnInvoker(cur), capture)
      }
    } else if (isArray(old)) {
      old.length = cur.length
      for (let i = 0; i < old.length; i++) old[i] = cur[i]
      on[name] = old
    } else {
      old.fn = cur
      on[name] = old
    }
  }
}

function arrInvoker (arr) {
  return function (ev) {
    const single = arguments.length === 1
    for (let i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments)
    }
  }
}

function fnInvoker (o) {
  return function (ev) {
    const single = arguments.length === 1
    single ? o.fn(ev) : o.fn.apply(null, arguments)
  }
}
