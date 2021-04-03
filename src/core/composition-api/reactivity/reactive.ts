import { AnyObject } from '../types/basic'
import { getRegisteredVueOrDefault } from '../runtimeContext'
import { isPlainObject, def, warn, isArray, hasOwn, noopFn } from '../utils'
import { isComponentInstance, defineComponentInstance } from '../utils/helper'
import { RefKey } from '../utils/symbols'
import { isRef, UnwrapRef } from './ref'
import { rawSet, accessModifiedSet } from '../utils/sets'

export function isRaw(obj: any): boolean {
  return Boolean(obj?.__ob__ && obj.__ob__?.__raw__)
}

export function isReactive(obj: any): boolean {
  return Boolean(obj?.__ob__ && !obj.__ob__?.__raw__)
}

/**
 * Proxing property access of target.
 * We can do unwrapping and other things here.
 */
function setupAccessControl(target: AnyObject): void {
  if (
    !isPlainObject(target) ||
    isRaw(target) ||
    Array.isArray(target) ||
    isRef(target) ||
    isComponentInstance(target) ||
    accessModifiedSet.has(target)
  )
    return

  accessModifiedSet.set(target, true)

  const keys = Object.keys(target)
  for (let i = 0; i < keys.length; i++) {
    defineAccessControl(target, keys[i])
  }
}

/**
 * Auto unwrapping when access property
 */
export function defineAccessControl(target: AnyObject, key: any, val?: any) {
  if (key === '__ob__') return
  if (isRaw(target[key])) return

  let getter: (() => any) | undefined
  let setter: ((x: any) => void) | undefined
  const property = Object.getOwnPropertyDescriptor(target, key)
  if (property) {
    if (property.configurable === false) {
      return
    }
    getter = property.get
    setter = property.set
    if (
      (!getter || setter) /* not only have getter */ &&
      arguments.length === 2
    ) {
      val = target[key]
    }
  }

  setupAccessControl(val)
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function getterHandler() {
      const value = getter ? getter.call(target) : val
      // if the key is equal to RefKey, skip the unwrap logic
      if (key !== RefKey && isRef(value)) {
        return value.value
      } else {
        return value
      }
    },
    set: function setterHandler(newVal) {
      if (getter && !setter) return

      const value = getter ? getter.call(target) : val
      // If the key is equal to RefKey, skip the unwrap logic
      // If and only if "value" is ref and "newVal" is not a ref,
      // the assignment should be proxied to "value" ref.
      if (key !== RefKey && isRef(value) && !isRef(newVal)) {
        value.value = newVal
      } else if (setter) {
        setter.call(target, newVal)
      } else {
        val = newVal
      }
      setupAccessControl(newVal)
    },
  })
}

function observe<T>(obj: T): T {
  const Vue = getRegisteredVueOrDefault()
  let observed: T
  if (Vue.observable) {
    observed = Vue.observable(obj)
  } else {
    const vm = defineComponentInstance(Vue, {
      data: {
        $$state: obj,
      },
    })
    observed = vm._data.$$state
  }

  // in SSR, there is no __ob__. Mock for reactivity check
  if (!hasOwn(observed, '__ob__')) {
    def(observed, '__ob__', mockObserver(observed))
  }

  return observed
}

export function createObserver() {
  return observe<any>({}).__ob__
}

function mockObserver(value: any = {}): any {
  return {
    value,
    dep: {
      notify: noopFn,
      depend: noopFn,
      addSub: noopFn,
      removeSub: noopFn,
    },
  }
}

export function shallowReactive<T extends object = any>(obj: T): T
export function shallowReactive(obj: any): any {
  if (__DEV__ && !obj) {
    warn('"shallowReactive()" is called without provide an "object".')
    return
  }

  if (
    !(isPlainObject(obj) || isArray(obj)) ||
    isRaw(obj) ||
    !Object.isExtensible(obj)
  ) {
    return obj as any
  }

  const observed = observe({})
  setupAccessControl(observed)

  const ob = (observed as any).__ob__

  for (const key of Object.keys(obj)) {
    let val = obj[key]
    let getter: (() => any) | undefined
    let setter: ((x: any) => void) | undefined
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property) {
      if (property.configurable === false) {
        continue
      }
      getter = property.get
      setter = property.set
    }

    Object.defineProperty(observed, key, {
      enumerable: true,
      configurable: true,
      get: function getterHandler() {
        const value = getter ? getter.call(obj) : val
        ob.dep?.depend()
        return value
      },
      set: function setterHandler(newVal) {
        if (getter && !setter) return
        if (setter) {
          setter.call(obj, newVal)
        } else {
          val = newVal
        }
        ob.dep?.notify()
      },
    })
  }
  return observed
}

/**
 * Make obj reactivity
 */
export function reactive<T extends object>(obj: T): UnwrapRef<T> {
  if (__DEV__ && !obj) {
    warn('"reactive()" is called without provide an "object".')
    // @ts-ignore
    return
  }

  if (
    !(isPlainObject(obj) || isArray(obj)) ||
    isRaw(obj) ||
    !Object.isExtensible(obj)
  ) {
    return obj as any
  }

  const observed = observe(obj)
  setupAccessControl(observed)
  return observed as UnwrapRef<T>
}

/**
 * Make sure obj can't be a reactive
 */
export function markRaw<T extends object>(obj: T): T {
  if (!(isPlainObject(obj) || isArray(obj)) || !Object.isExtensible(obj)) {
    return obj
  }

  // set the vue observable flag at obj
  const ob = createObserver()
  ob.__raw__ = true
  def(obj, '__ob__', ob)

  // mark as Raw
  rawSet.set(obj, true)

  return obj
}

export function toRaw<T>(observed: T): T {
  if (isRaw(observed) || !Object.isExtensible(observed)) {
    return observed
  }

  return (observed as any)?.__ob__?.value || observed
}
