import { isServerRendering, noop, warn, def } from 'core/util'
import { Ref, RefFlag } from './ref'
import Watcher from 'core/observer/watcher'
import Dep from 'core/observer/dep'
import { currentInstance } from '../currentInstance'
import { DebuggerOptions } from '../apiWatch'
import { ReactiveFlags } from './reactive'

declare const ComputedRefSymbol: unique symbol

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
  [ComputedRefSymbol]: true
}

export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: Watcher
}

export type ComputedGetter<T> = (...args: any[]) => T
export type ComputedSetter<T> = (v: T) => void

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}

export function computed<T>(
  getter: ComputedGetter<T>,
  debugOptions?: DebuggerOptions
): ComputedRef<T>
export function computed<T>(
  options: WritableComputedOptions<T>,
  debugOptions?: DebuggerOptions
): WritableComputedRef<T>
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  // TODO debug options
  debugOptions?: DebuggerOptions
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  const onlyGetter = typeof getterOrOptions === 'function'
  if (onlyGetter) {
    getter = getterOrOptions
    setter = __DEV__
      ? () => {
          warn('Write operation failed: computed value is readonly')
        }
      : noop
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  const watcher = isServerRendering()
    ? null
    : new Watcher(currentInstance, getter, noop, { lazy: true })

  const ref = {
    // some libs rely on the presence effect for checking computed refs
    // from normal refs, but the implementation doesn't matter
    effect: watcher,
    get value() {
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate()
        }
        if (Dep.target) {
          watcher.depend()
        }
        return watcher.value
      } else {
        return getter()
      }
    },
    set value(newVal) {
      setter(newVal)
    }
  } as any

  def(ref, RefFlag, true)
  def(ref, ReactiveFlags.IS_READONLY, onlyGetter)

  return ref
}
