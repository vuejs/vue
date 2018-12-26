/* @flow */

import { emptyObject } from 'core/util/index'

export function normalizeScopedSlots (slots: { [key: string]: Function } | void): any {
  if (!slots) {
    return emptyObject
  } else if (slots._normalized) {
    return slots
  } else {
    const res = {}
    for (const key in slots) {
      res[key] = normalizeScopedSlot(slots[key])
    }
    res._normalized = true
    return res
  }
}

function normalizeScopedSlot(fn: Function) {
  return scope => {
    const res = fn(scope)
    return Array.isArray(res) ? res : res ? [res] : res
  }
}
