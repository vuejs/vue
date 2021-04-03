import { ScopedSlotsData } from 'typescript/vnode'

export function resolveScopedSlots(
  fns: ScopedSlotsData,
  res?: Record<string, any>,
  // the following are added in 2.6
  hasDynamicKeys?: boolean,
  contentHashKey?: number
): { $stable: boolean } & { [key: string]: Function } {
  res = res || { $stable: !hasDynamicKeys }
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i]
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys)
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      // @ts-expect-error
      if (slot.proxy) {
        // @ts-expect-error
        slot.fn.proxy = true
      }
      res[slot.key] = slot.fn
    }
  }
  if (contentHashKey) {
    ;(res as any).$key = contentHashKey
  }
  return res as any
}
