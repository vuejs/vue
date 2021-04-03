import { getVueConstructor, getCurrentInstance } from '../runtimeContext'
import { createRef, Ref } from '../reactivity'
import {
  warn,
  noopFn,
  defineComponentInstance,
  getVueInternalClasses,
} from '../utils'

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
}

export interface WritableComputedRef<T> extends Ref<T> {}

export type ComputedGetter<T> = (ctx?: any) => T
export type ComputedSetter<T> = (v: T) => void

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}

// read-only
export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
// writable
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>
// implement
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
): ComputedRef<T> | WritableComputedRef<T> {
  const vm = getCurrentInstance()?.proxy
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T> | undefined

  if (typeof getterOrOptions === 'function') {
    getter = getterOrOptions
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  let computedSetter
  let computedGetter

  if (vm && !vm.$isServer) {
    const { Watcher, Dep } = getVueInternalClasses()
    let watcher: any
    computedGetter = () => {
      if (!watcher) {
        watcher = new Watcher(vm, getter, noopFn, { lazy: true })
      }
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }

    computedSetter = (v: T) => {
      if (__DEV__ && !setter) {
        warn('Write operation failed: computed value is readonly.', vm!)
        return
      }

      if (setter) {
        setter(v)
      }
    }
  } else {
    // fallback
    const computedHost = defineComponentInstance(getVueConstructor(), {
      computed: {
        $$state: {
          get: getter,
          set: setter,
        },
      },
    })

    vm && vm.$on('hook:destroyed', () => computedHost.$destroy())

    computedGetter = () => (computedHost as any).$$state
    computedSetter = (v: T) => {
      if (__DEV__ && !setter) {
        warn('Write operation failed: computed value is readonly.', vm!)
        return
      }

      ;(computedHost as any).$$state = v
    }
  }

  return createRef<T>(
    {
      get: computedGetter,
      set: computedSetter,
    },
    !setter
  )
}
