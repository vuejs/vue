import { warn, extend, isPlainObject } from 'core/util/index'
import type { VNodeData } from 'types/vnode'

export function bindObjectListeners(data: any, value: any): VNodeData {
  if (value) {
    if (!isPlainObject(value)) {
      __DEV__ && warn('v-on without argument expects an Object value', this)
    } else {
      const on = (data.on = data.on ? extend({}, data.on) : {})
      for (const key in value) {
        const existing = on[key]
        const ours = value[key]
        on[key] = existing ? [].concat(existing, ours) : ours
      }
    }
  }
  return data
}
