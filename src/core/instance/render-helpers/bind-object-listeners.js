/* @flow */

import { warn, extend, isPlainObject } from 'core/util/index'

export function bindObjectListeners (data: any, value: any): VNodeData {
  if (value) {
    const isArrayWithPlainObject = Array.isArray(value) && !value.some(item => !isPlainObject(item));
    if (isArrayWithPlainObject) {
      value = value.reduce((prev, item) => {
        for (const key in item) {
           prev[key] = prev[key] ? [].concat(prev[key], item[key]) : item[key]
        }
        return prev
      }, {})
    }

    if (!isPlainObject(value) || (Array.isArray(value) && !isArrayWithPlainObject)) {
      process.env.NODE_ENV !== 'production' && warn(
        'v-on without argument expects an Object value or Array containing Object',
        this
      )
    } else {
      const on = data.on = data.on ? extend({}, data.on) : {}
      for (const key in value) {
        const existing = on[key]
        const ours = value[key]
        on[key] = existing ? [].concat(existing, ours) : ours
      }
    }
  }
  return data
}
