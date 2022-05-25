import { isServerRendering, noop, warn } from 'core/util'
import { Ref } from './ref'
import Watcher from 'core/observer/watcher'
import Dep from 'core/observer/dep'
import { currentInstance } from '../currentInstance'
import { DebuggerOptions } from '../apiWatch'

declare const ComputedRefSymbol: unique symbol

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
  [ComputedRefSymbol]: true
}

export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: { stop(): void }
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

  return new ComputedRefImpl(
    getter,
    setter,
    onlyGetter,
    isServerRendering()
  ) as any
}

class ComputedRefImpl<T> {
  public dep?: Dep = undefined

  public readonly __v_isRef = true
  public readonly effect

  private _watcher: Watcher | null

  constructor(
    private _getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>,
    public readonly __v_isReadonly: boolean,
    isSSR: boolean
  ) {
    const watcher = (this._watcher = isSSR
      ? null
      : new Watcher(currentInstance, _getter, noop, { lazy: true }))
    this.effect = {
      stop() {
        watcher && watcher.teardown()
      }
    }
  }

  get value() {
    const watcher = this._watcher
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    } else {
      return this._getter()
    }
  }

  set value(newValue: T) {
    this._setter(newValue)
  }
}
