/* @flow */

import { extend, warn, inProduction } from 'core/util/index'

/**
 * Runtime helper for rendering <slot>
 */
export function renderSlot (
  name: string,
  fallback: ?Array<VNode>,
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name]
  if (scopedSlotFn) { // scoped slot
    props = props || {}
    if (bindObject) {
      props = extend(extend({}, bindObject), props)
    }
    return scopedSlotFn(props) || fallback
  } else {
    const slotNodes = this.$slots[name]
    // warn duplicate slot usage
    if (slotNodes && !inProduction) {
      slotNodes._rendered && warn(
        `Duplicate presence of slot "${name}" found in the same render tree ` +
        `- this will likely cause render errors.`,
        this
      )
      slotNodes._rendered = true
    }
    return slotNodes || fallback
  }
}
