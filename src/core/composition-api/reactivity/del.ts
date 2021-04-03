import { getVueConstructor } from '../runtimeContext'
import { hasOwn, isPrimitive, isUndef, isValidArrayIndex } from '../utils'

/**
 * Delete a property and trigger change if necessary.
 */
export function del(target: any, key: any) {
  const Vue = getVueConstructor()
  const { warn } = Vue.util

  if (__DEV__ && (isUndef(target) || isPrimitive(target))) {
    warn(
      `Cannot delete reactive property on undefined, null, or primitive value: ${target}`
    )
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = target.__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    __DEV__ &&
      warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
          '- just set it to null.'
      )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}
