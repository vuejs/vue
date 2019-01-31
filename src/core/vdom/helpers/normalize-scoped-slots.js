/* @flow */

import { normalizeChildren } from 'core/vdom/helpers/normalize-children'

export function normalizeScopedSlots (
  slots: { [key: string]: Function } | void,
  normalSlots: { [key: string]: Array<VNode> }
): any {
  let res
  if (!slots) {
    res = {}
  } else if (slots._normalized) {
    return slots
  } else {
    res = {}
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(slots[key])
      }
    }
  }
  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key)
    }
  }
  res._normalized = true
  res.$stable = slots ? slots.$stable : true
  return res
}

function normalizeScopedSlot(fn: Function): Function {
  return scope => {
    const res = fn(scope)
    return res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res)
  }
}

function proxyNormalSlot(slots, key) {
  return () => slots[key]
}
