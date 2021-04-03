import { extend, warn, isObject } from 'core/util/index'
import VNode from 'core/vdom/vnode'

/**
 * Runtime helper for rendering <slot>
 */
export function renderSlot(
  name: string,
  fallback: Array<VNode> | null,
  props: Record<string, any> | null,
  bindObject: object | null
): Array<VNode> | null {
  const scopedSlotFn = this.$scopedSlots[name]
  let nodes
  if (scopedSlotFn) {
    // scoped slot
    props = props || {}
    if (bindObject) {
      if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this)
      }
      props = extend(extend({}, bindObject), props)
    }
    nodes = scopedSlotFn(props) || fallback
  } else {
    nodes = this.$slots[name] || fallback
  }

  const target = props && props.slot
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}
