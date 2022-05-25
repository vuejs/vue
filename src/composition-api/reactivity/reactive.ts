import { observe, Observer } from 'core/observer'
import { def, isPrimitive, warn } from 'core/util'
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

export declare const ShallowReactiveMarker: unique symbol

// only unwrap nested ref
export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>

export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (!isReadonly(target)) {
    const ob = observe(target)
    if (__DEV__ && !ob && (target == null || isPrimitive(target))) {
      warn(`value cannot be made reactive: ${String(target)}`)
    }
  }
  return target
}

export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target).__ob__)
}

export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target).__v_isShallow)
}

export function isReadonly(value: unknown): boolean {
  // TODO
  return !!(value && (value as Target).__v_isReadonly)
}

export function toRaw<T>(observed: T): T {
  // TODO for readonly
  return observed
}

export function markRaw<T extends object>(
  value: T
): T & { [RawSymbol]?: true } {
  def(value, ReactiveFlags.SKIP, true)
  return value
}
