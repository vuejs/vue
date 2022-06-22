import { observe, Observer } from 'core/observer'
import { def, isArray, isPrimitive, warn, toRawType } from 'core/util'
import type { Ref, UnwrapRefSimple, RawSymbol } from './ref'

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw'
}

export interface Target {
  __ob__?: Observer
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

// only unwrap nested ref
export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>

export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  makeReactive(target, false)
  return target
}

export declare const ShallowReactiveMarker: unique symbol

export type ShallowReactive<T> = T & { [ShallowReactiveMarker]?: true }

/**
 * Return a shallowly-reactive copy of the original object, where only the root
 * level properties are reactive. It also does not auto-unwrap refs (even at the
 * root level).
 */
export function shallowReactive<T extends object>(
  target: T
): ShallowReactive<T> {
  makeReactive(target, true)
  def(target, ReactiveFlags.IS_SHALLOW, true)
  return target
}

function makeReactive(target: any, shallow: boolean) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (!isReadonly(target)) {
    if (__DEV__) {
      if (isArray(target)) {
        warn(
          `Avoid using Array as root value for ${
            shallow ? `shallowReactive()` : `reactive()`
          } as it cannot be tracked in watch() or watchEffect(). Use ${
            shallow ? `shallowRef()` : `ref()`
          } instead. This is a Vue-2-only limitation.`
        )
      }
      const existingOb = target && target.__ob__
      if (existingOb && existingOb.shallow !== shallow) {
        warn(
          `Target is already a ${
            existingOb.shallow ? `` : `non-`
          }shallow reactive object, and cannot be converted to ${
            shallow ? `` : `non-`
          }shallow.`
        )
      }
    }
    const ob = observe(target, shallow)
    if (__DEV__ && !ob) {
      if (target == null || isPrimitive(target)) {
        warn(`value cannot be made reactive: ${String(target)}`)
      }
      if (isCollectionType(target)) {
        warn(
          `Vue 2 does not support reactive collection types such as Map or Set.`
        )
      }
    }
  }
}

export function isReactive(value: unknown): boolean {
  if (isReadonly(value)) {
    return isReactive((value as Target)[ReactiveFlags.RAW])
  }
  return !!(value && (value as Target).__ob__)
}

export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target).__v_isShallow)
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target).__v_isReadonly)
}

export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}

export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}

export function markRaw<T extends object>(
  value: T
): T & { [RawSymbol]?: true } {
  def(value, ReactiveFlags.SKIP, true)
  return value
}

/**
 * @internal
 */
export function isCollectionType(value: unknown): boolean {
  const type = toRawType(value)
  return (
    type === 'Map' || type === 'WeakMap' || type === 'Set' || type === 'WeakSet'
  )
}
