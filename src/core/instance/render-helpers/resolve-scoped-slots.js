/* @flow */

export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  hasDynamicKeys?: boolean,
  res?: Object
): { [key: string]: Function, $stable: boolean } {
  res = res || { $stable: !hasDynamicKeys }
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i]
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, hasDynamicKeys, res)
    } else if (slot) {
      res[slot.key] = slot.fn
    }
  }
  return res
}
