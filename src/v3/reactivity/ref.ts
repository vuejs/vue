import { defineReactive } from 'core/observer/index'
import {
  isReactive,
  ReactiveFlags,
  type ShallowReactiveMarker
} from './reactive'
import type { IfAny } from 'types/utils'
import Dep from 'core/observer/dep'
import { warn, isArray, def } from 'core/util'
import { TrackOpTypes, TriggerOpTypes } from './operations'

declare const RefSymbol: unique symbol
export declare const RawSymbol: unique symbol

/**
 * @internal
 */
export const RefFlag = `__v_isRef`

export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
  /**
   * @internal
   */
  dep?: Dep
  /**
   * @internal
   */
  [RefFlag]: true
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return !!(r && (r as Ref).__v_isRef === true)
}

export function ref<T extends object>(
  value: T
): [T] extends [Ref] ? T : Ref<UnwrapRef<T>>
export function ref<T>(value: T): Ref<UnwrapRef<T>>
export function ref<T = any>(): Ref<T | undefined>
export function ref(value?: unknown) {
  return createRef(value, false)
}

declare const ShallowRefMarker: unique symbol

export type ShallowRef<T = any> = Ref<T> & { [ShallowRefMarker]?: true }

export function shallowRef<T extends object>(
  value: T
): T extends Ref ? T : ShallowRef<T>
export function shallowRef<T>(value: T): ShallowRef<T>
export function shallowRef<T = any>(): ShallowRef<T | undefined>
export function shallowRef(value?: unknown) {
  return createRef(value, true)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  const ref: any = {}
  def(ref, RefFlag, true)
  def(ref, ReactiveFlags.IS_SHALLOW, true)
  ref.dep = defineReactive(ref, 'value', rawValue, null, shallow)
  return ref
}

export function triggerRef(ref: Ref) {
  if (__DEV__ && !ref.dep) {
    warn(`received object is not a triggerable ref.`)
  }
  if (__DEV__) {
    ref.dep &&
      ref.dep.notify({
        type: TriggerOpTypes.SET,
        target: ref,
        key: 'value'
      })
  } else {
    ref.dep && ref.dep.notify()
  }
}

export function unref<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? (ref.value as any) : ref
}

export type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}

export function customRef<T>(factory: CustomRefFactory<T>): Ref<T> {
  const dep = new Dep()
  const { get, set } = factory(
    () => {
      if (__DEV__) {
        dep.depend({
          target: ref,
          type: TrackOpTypes.GET,
          key: 'value'
        })
      } else {
        dep.depend()
      }
    },
    () => {
      if (__DEV__) {
        dep.notify({
          target: ref,
          type: TriggerOpTypes.SET,
          key: 'value'
        })
      } else {
        dep.notify()
      }
    }
  )
  const ref = {
    get value() {
      return get()
    },
    set value(newVal) {
      set(newVal)
    }
  } as any
  def(ref, RefFlag, true)
  return ref
}

export type ToRefs<T = any> = {
  [K in keyof T]: ToRef<T[K]>
}

export function toRefs<T extends object>(object: T): ToRefs<T> {
  if (__DEV__ && !isReactive(object)) {
    warn(`toRefs() expects a reactive object but received a plain one.`)
  }
  const ret: any = isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}

export type ToRef<T> = IfAny<T, Ref<T>, [T] extends [Ref] ? T : Ref<T>>

export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): ToRef<T[K]>

export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K,
  defaultValue: T[K]
): ToRef<Exclude<T[K], undefined>>

export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K,
  defaultValue?: T[K]
): ToRef<T[K]> {
  const val = object[key]
  if (isRef(val)) {
    return val as any
  }
  const ref = {
    get value() {
      const val = object[key]
      return val === undefined ? (defaultValue as T[K]) : val
    },
    set value(newVal) {
      object[key] = newVal
    }
  } as any
  def(ref, RefFlag, true)
  return ref
}

/**
 * This is a special exported interface for other packages to declare
 * additional types that should bail out for ref unwrapping. For example
 * \@vue/runtime-dom can declare it like so in its d.ts:
 *
 * ``` ts
 * declare module 'vue' {
 *   export interface RefUnwrapBailTypes {
 *     runtimeDOMBailTypes: Node | Window
 *   }
 * }
 * ```
 *
 * Note that api-extractor somehow refuses to include `declare module`
 * augmentations in its generated d.ts, so we have to manually append them
 * to the final generated d.ts in our build process.
 */
export interface RefUnwrapBailTypes {
  runtimeDOMBailTypes: Node | Window
}

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: T[K] extends Ref<infer V>
    ? V
    : // if `V` is `unknown` that means it does not extend `Ref` and is undefined
    T[K] extends Ref<infer V> | undefined
    ? unknown extends V
      ? undefined
      : V | undefined
    : T[K]
}

export type UnwrapRef<T> = T extends ShallowRef<infer V>
  ? V
  : T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

type BaseTypes = string | number | boolean
type CollectionTypes = IterableCollections | WeakCollections
type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>

export type UnwrapRefSimple<T> = T extends
  | Function
  | CollectionTypes
  | BaseTypes
  | Ref
  | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  | { [RawSymbol]?: true }
  ? T
  : T extends Array<any>
  ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
  : T extends object & { [ShallowReactiveMarker]?: never }
  ? {
      [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>
    }
  : T
