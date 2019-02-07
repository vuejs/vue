/* @flow */

import { def } from 'core/util/lang'
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
  def(res, '_normalized', true)
  def(res, '$stable', slots ? !!slots.$stable : true)
  return res
}

function normalizeScopedSlot(fn: Function): Function {
  return scope => {
    let res = fn(scope)
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res)
    return res && res.length === 0
      ? undefined
      : res
  }
}

function proxyNormalSlot(slots, key) {
  return () => slots[key]
}
