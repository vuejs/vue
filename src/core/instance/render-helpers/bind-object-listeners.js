/* @flow */

import { extend, inProduction, isPlainObject, warn } from 'core/util/index'

export function bindObjectListeners (data: any, value: any): VNodeData {
  if (value) {
    if (!isPlainObject(value)) {
      !inProduction && warn(
        'v-on without argument expects an Object value',
        this
      )
    } else {
      const on = data.on = data.on ? extend({}, data.on) : {}
      for (const key in value) {
        const existing = on[key]
        const ours = value[key]
        on[key] = existing ? [].concat(ours, existing) : ours
      }
    }
  }
  return data
}
