import { isServerRendering, noop, warn, def, isFunction } from 'core/util';
import { Ref, RefFlag } from './ref';
import Watcher from 'core/observer/watcher';
import Dep from 'core/observer/dep';
import { currentInstance } from '../currentInstance';
import { ReactiveFlags } from './reactive';
import { TrackOpTypes } from './operations';
import { DebuggerOptions } from '../debug';

declare const ComputedRefSymbol: unique symbol;

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T;
  [ComputedRefSymbol]: true;
}

export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: any /* Watcher */;
}

export type ComputedGetter<T> = () => T;
export type ComputedSetter<T> = (v: T) => void;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  debugOptions?: DebuggerOptions
): ComputedRef<T> | WritableComputedRef<T> {
  const isGetterOnly = isFunction(getterOrOptions);
  const getter = isGetterOnly ? getterOrOptions : getterOrOptions.get;
  const setter = isGetterOnly
    ? (__DEV__
      ? () => warn('Write operation failed: computed value is readonly')
      : noop)
    : getterOrOptions.set;

  const watcher = isServerRendering()
    ? null
    : new Watcher(currentInstance, getter, noop, { lazy: true });

  if (__DEV__ && watcher && debugOptions) {
    watcher.onTrack = debugOptions.onTrack;
    watcher.onTrigger = debugOptions.onTrigger;
  }

  const ref = {
    effect: watcher,
    get value() {
      if (watcher) {
        if (watcher.dirty) watcher.evaluate();
        if (Dep.target) {
          if (__DEV__ && Dep.target.onTrack) {
            Dep.target.onTrack({
              effect: Dep.target,
              target: ref,
              type: TrackOpTypes.GET,
              key: 'value',
            });
          }
          watcher.depend();
        }
        return watcher.value;
      }
      return getter();
    },
    set value(newValue: T) {
      setter(newValue);
    },
  } as WritableComputedRef<T>;

  def(ref, RefFlag, true);
  def(ref, ReactiveFlags.IS_READONLY, isGetterOnly);

  return ref;
}
