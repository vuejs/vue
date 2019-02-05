/* @flow */

import { hasOwn } from 'shared/util'
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
        res[key] = normalizeScopedSlot(normalSlots, key, slots[key])
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

function normalizeScopedSlot(normalSlots, key, fn) {
  const normalized = (scope = {}) => {
    const res = fn(scope)
    return res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res)
  }
  // proxy scoped slots on normal $slots
  if (!hasOwn(normalSlots, key)) {
    Object.defineProperty(normalSlots, key, {
      get: normalized
    })
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return () => slots[key]
}
