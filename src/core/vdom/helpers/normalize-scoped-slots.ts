import { def } from 'core/util/lang'
import { normalizeChildren } from 'core/vdom/helpers/normalize-children'
import { emptyObject, isArray } from 'shared/util'
import { isAsyncPlaceholder } from './is-async-placeholder'
import type VNode from '../vnode'
import { Component } from 'types/component'
import { currentInstance, setCurrentInstance } from 'v3/currentInstance'

export function normalizeScopedSlots(
  ownerVm: Component,
  slots: { [key: string]: Function } | void,
  normalSlots: { [key: string]: VNode[] }
): any {
  let res
  const prevSlots = ownerVm.$scopedSlots
  const hasNormalSlots = Object.keys(normalSlots).length > 0
  const isStable = slots ? !!slots.$stable : !hasNormalSlots
  const key = slots && slots.$key
  if (!slots) {
    res = {}
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {}
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(ownerVm, normalSlots, key, slots[key])
      }
    }
  }
  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key)
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    slots._normalized = res
  }
  def(res, '$stable', isStable)
  def(res, '$key', key)
  def(res, '$hasNormal', hasNormalSlots)
  return res
}

function normalizeScopedSlot(vm, normalSlots, key, fn) {
  const normalized = function () {
    const cur = currentInstance
    setCurrentInstance(vm)
    let res = arguments.length ? fn.apply(null, arguments) : fn({})
    res =
      res && typeof res === 'object' && !isArray(res)
        ? [res] // single vnode
        : normalizeChildren(res)
    const vnode: VNode | null = res && res[0]
    setCurrentInstance(cur)
    return res &&
      (!vnode ||
        (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode))) // #9658, #10391
      ? undefined
      : res
  }
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    })
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return () => slots[key]
}
