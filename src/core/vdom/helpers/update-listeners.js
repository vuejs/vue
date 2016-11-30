/* @flow */

import { warn } from 'core/util/index'

export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  vm: Component
) {
  let name, cur, old, fn, event, capture, once
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (!cur) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${name}": got ` + String(cur),
        vm
      )
    } else if (!old) {
      once = name.charAt(0) === '~' // Prefixed last, checked first
      event = once ? name.slice(1) : name
      capture = event.charAt(0) === '!'
      event = capture ? event.slice(1) : event
      if (Array.isArray(cur)) {
        add(event, (cur.invoker = arrInvoker(cur)), once, capture)
      } else {
        if (!cur.invoker) {
          fn = cur
          cur = on[name] = {}
          cur.fn = fn
          cur.invoker = fnInvoker(cur)
        }
        add(event, cur.invoker, once, capture)
      }
    } else if (cur !== old) {
      if (Array.isArray(old)) {
        old.length = cur.length
        for (let i = 0; i < old.length; i++) old[i] = cur[i]
        on[name] = old
      } else {
        old.fn = cur
        on[name] = old
      }
    }
  }
  for (name in oldOn) {
    if (!on[name]) {
      once = name.charAt(0) === '~' // Prefixed last, checked first
      event = once ? name.slice(1) : name
      capture = event.charAt(0) === '!'
      event = capture ? event.slice(1) : event
      remove(event, oldOn[name].invoker, capture)
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
