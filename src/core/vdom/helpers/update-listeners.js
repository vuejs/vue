/* @flow */

import { warn } from 'core/util/index'
import { cached, isUndef } from 'shared/util'

const normalizeEvent = cached((name: string): {
  name: string,
  plain: boolean,
  once: boolean,
  capture: boolean,
  passive: boolean,
  handler?: Function
} => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  const plain = !(passive || once || capture)
  return {
    name,
    plain,
    once,
    capture,
    passive
  }
})

export function createFnInvoker (fns: Function | Array<Function>): Function {
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments)
      }
    } else {
      // return handler return value for single handlers
      return fns.apply(null, arguments)
    }
  }
  invoker.fns = fns
  return invoker
}

// #6552
function prioritizePlainEvents (a, b) {
  return a.plain ? -1 : b.plain ? 1 : 0
}

export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  vm: Component
) {
  let name, cur, old, event
  const toAdd = []
  let hasModifier = false
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (!event.plain) hasModifier = true
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur)
      }
      event.handler = cur
      toAdd.push(event)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  if (toAdd.length) {
    if (hasModifier) toAdd.sort(prioritizePlainEvents)
    for (let i = 0; i < toAdd.length; i++) {
      const event = toAdd[i]
      add(event.name, event.handler, event.once, event.capture, event.passive)
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
