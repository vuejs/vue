import { isRef, Ref } from './reactivity/ref'
import { ComputedRef } from './reactivity/computed'
import { isReactive, isShallow } from './reactivity/reactive'
import {
  warn,
  noop,
  isArray,
  isFunction,
  emptyObject,
  hasChanged,
  isServerRendering,
  invokeWithErrorHandling
} from 'core/util'
import { currentInstance } from './currentInstance'
import { traverse } from 'core/observer/traverse'
import Watcher from '../core/observer/watcher'
import { queueWatcher } from '../core/observer/scheduler'
import { DebuggerOptions } from './debug'

const WATCHER = `watcher`
const WATCHER_CB = `${WATCHER} callback`
const WATCHER_GETTER = `${WATCHER} getter`
const WATCHER_CLEANUP = `${WATCHER} cleanup`

export type WatchEffect = (onCleanup: OnCleanup) => void

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: OnCleanup
) => any

type MapSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V>
    ? Immediate extends true
      ? V | undefined
      : V
    : T[K] extends object
    ? Immediate extends true
      ? T[K] | undefined
      : T[K]
    : never
}

type OnCleanup = (cleanupFn: () => void) => void

export interface WatchOptionsBase extends DebuggerOptions {
  flush?: 'pre' | 'post' | 'sync'
}

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate
  deep?: boolean
}

export type WatchStopHandle = () => void

// Simple effect.
export function watchEffect(
  effect: WatchEffect,
  options?: WatchOptionsBase
): WatchStopHandle {
  return doWatch(effect, null, options)
}

export function watchPostEffect(
  effect: WatchEffect,
  options?: DebuggerOptions
) {
  return doWatch(
    effect,
    null,
    (__DEV__
      ? { ...options, flush: 'post' }
      : { flush: 'post' }) as WatchOptionsBase
  )
}

export function watchSyncEffect(
  effect: WatchEffect,
  options?: DebuggerOptions
) {
  return doWatch(
    effect,
    null,
    (__DEV__
      ? { ...options, flush: 'sync' }
      : { flush: 'sync' }) as WatchOptionsBase
  )
}

// initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {}

type MultiWatchSources = (WatchSource<unknown> | object)[]

// overload: array of multiple sources + cb
export function watch<
  T extends MultiWatchSources,
  Immediate extends Readonly<boolean> = false
>(
  sources: [...T],
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>
): WatchStopHandle

// overload: multiple sources w/ `as const`
// watch([foo, bar] as const, () => {})
// somehow [...T] breaks when the type is readonly
export function watch<
  T extends Readonly<MultiWatchSources>,
  Immediate extends Readonly<boolean> = false
>(
  source: T,
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>
): WatchStopHandle

// overload: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle

// overload: watching reactive object w/ cb
export function watch<
  T extends object,
  Immediate extends Readonly<boolean> = false
>(
  source: T,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle

// implementation
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
  source: T | WatchSource<T>,
  cb: any,
  options?: WatchOptions<Immediate>
): WatchStopHandle {
  if (__DEV__ && typeof cb !== 'function') {
    warn(
      `\`watch(fn, options?)\` signature has been moved to a separate API. ` +
        `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
        `supports \`watch(source, cb, options?) signature.`
    )
  }
  return doWatch(source as any, cb, options)
}

function doWatch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb: WatchCallback | null,
  {
    immediate,
    deep,
    flush = 'pre',
    onTrack,
    onTrigger
  }: WatchOptions = emptyObject
): WatchStopHandle {
  if (__DEV__ && !cb) {
    if (immediate !== undefined) {
      warn(
        `watch() "immediate" option is only respected when using the ` +
          `watch(source, callback, options?) signature.`
      )
    }
    if (deep !== undefined) {
      warn(
        `watch() "deep" option is only respected when using the ` +
          `watch(source, callback, options?) signature.`
      )
    }
  }

  const warnInvalidSource = (s: unknown) => {
    warn(
      `Invalid watch source: ${s}. A watch source can only be a getter/effect ` +
        `function, a ref, a reactive object, or an array of these types.`
    )
  }

  const instance = currentInstance
  const call = (fn: Function, type: string, args: any[] | null = null) => {
    const res = invokeWithErrorHandling(fn, null, args, instance, type)
    if (deep && res && res.__ob__) res.__ob__.dep.depend()
    return res
  }

  let getter: () => any
  let forceTrigger = false
  let isMultiSource = false

  if (isRef(source)) {
    getter = () => source.value
    forceTrigger = isShallow(source)
  } else if (isReactive(source)) {
    getter = () => {
      ;(source as any).__ob__.dep.depend()
      return source
    }
    deep = true
  } else if (isArray(source)) {
    isMultiSource = true
    forceTrigger = source.some(s => isReactive(s) || isShallow(s))
    getter = () =>
      source.map(s => {
        if (isRef(s)) {
          return s.value
        } else if (isReactive(s)) {
          s.__ob__.dep.depend()
          return traverse(s)
        } else if (isFunction(s)) {
          return call(s, WATCHER_GETTER)
        } else {
          __DEV__ && warnInvalidSource(s)
        }
      })
  } else if (isFunction(source)) {
    if (cb) {
      // getter with cb
      getter = () => call(source, WATCHER_GETTER)
    } else {
      // no cb -> simple effect
      getter = () => {
        if (instance && instance._isDestroyed) {
          return
        }
        if (cleanup) {
          cleanup()
        }
        return call(source, WATCHER, [onCleanup])
      }
    }
  } else {
    getter = noop
    __DEV__ && warnInvalidSource(source)
  }

  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let cleanup: () => void
  let onCleanup: OnCleanup = (fn: () => void) => {
    cleanup = watcher.onStop = () => {
      call(fn, WATCHER_CLEANUP)
    }
  }

  // in SSR there is no need to setup an actual effect, and it should be noop
  // unless it's eager
  if (isServerRendering()) {
    // we will also not call the invalidate callback (+ runner is not set up)
    onCleanup = noop
    if (!cb) {
      getter()
    } else if (immediate) {
      call(cb, WATCHER_CB, [
        getter(),
        isMultiSource ? [] : undefined,
        onCleanup
      ])
    }
    return noop
  }

  const watcher = new Watcher(currentInstance, getter, noop, {
    lazy: true
  })
  watcher.noRecurse = !cb

  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE
  // overwrite default run
  watcher.run = () => {
    if (!watcher.active) {
      return
    }
    if (cb) {
      // watch(source, cb)
      const newValue = watcher.get()
      if (
        deep ||
        forceTrigger ||
        (isMultiSource
          ? (newValue as any[]).some((v, i) =>
              hasChanged(v, (oldValue as any[])[i])
            )
          : hasChanged(newValue, oldValue))
      ) {
        // cleanup before running cb again
        if (cleanup) {
          cleanup()
        }
        call(cb, WATCHER_CB, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
          onCleanup
        ])
        oldValue = newValue
      }
    } else {
      // watchEffect
      watcher.get()
    }
  }

  if (flush === 'sync') {
    watcher.update = watcher.run
  } else if (flush === 'post') {
    watcher.post = true
    watcher.update = () => queueWatcher(watcher)
  } else {
    // pre
    watcher.update = () => {
      if (instance && instance === currentInstance && !instance._isMounted) {
        // pre-watcher triggered before
        const buffer = instance._preWatchers || (instance._preWatchers = [])
        if (buffer.indexOf(watcher) < 0) buffer.push(watcher)
      } else {
        queueWatcher(watcher)
      }
    }
  }

  if (__DEV__) {
    watcher.onTrack = onTrack
    watcher.onTrigger = onTrigger
  }

  // initial run
  if (cb) {
    if (immediate) {
      watcher.run()
    } else {
      oldValue = watcher.get()
    }
  } else if (flush === 'post' && instance) {
    instance.$once('hook:mounted', () => watcher.get())
  } else {
    watcher.get()
  }

  return () => {
    watcher.teardown()
  }
}
