import { reactive, Ref, UnwrapRef } from '.'
import { isArray, isPlainObject, warn } from '../utils'
import { readonlySet } from '../utils/sets'

export function isReadonly(obj: any): boolean {
  return readonlySet.has(obj)
}

type Primitive = string | number | boolean | bigint | symbol | undefined | null
type Builtin = Primitive | Function | Date | Error | RegExp

// prettier-ignore
export type DeepReadonly<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
      : T extends WeakMap<infer K, infer V>
        ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends Set<infer U>
          ? ReadonlySet<DeepReadonly<U>>
          : T extends ReadonlySet<infer U>
            ? ReadonlySet<DeepReadonly<U>>
            : T extends WeakSet<infer U>
              ? WeakSet<DeepReadonly<U>>
              : T extends Promise<infer U>
                ? Promise<DeepReadonly<U>>
                : T extends {}
                  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
                  : Readonly<T>

// only unwrap nested ref
type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>

/**
 * **In @vue/composition-api, `reactive` only provides type-level readonly check**
 *
 * Creates a readonly copy of the original object. Note the returned copy is not
 * made reactive, but `readonly` can be called on an already reactive object.
 */
export function readonly<T extends object>(
  target: T
): DeepReadonly<UnwrapNestedRefs<T>> {
  return target as any
}

export function shallowReadonly<T extends object>(obj: T): Readonly<T>
export function shallowReadonly(obj: any): any {
  if (!(isPlainObject(obj) || isArray(obj)) || !Object.isExtensible(obj)) {
    return obj
  }

  const readonlyObj = {}

  const source = reactive({})
  const ob = (source as any).__ob__

  for (const key of Object.keys(obj)) {
    let val = obj[key]
    let getter: (() => any) | undefined
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property) {
      if (property.configurable === false) {
        continue
      }
      getter = property.get
    }

    Object.defineProperty(readonlyObj, key, {
      enumerable: true,
      configurable: true,
      get: function getterHandler() {
        const value = getter ? getter.call(obj) : val
        ob.dep.depend()
        return value
      },
      set(v) {
        if (__DEV__) {
          warn(`Set operation on key "${key}" failed: target is readonly.`)
        }
      },
    })
  }

  readonlySet.set(readonlyObj, true)

  return readonlyObj
}
