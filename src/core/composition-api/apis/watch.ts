import { ComponentInstance } from '../component'
import { Ref, isRef, isReactive } from '../reactivity'
import { assert, logError, noopFn, warn, isFunction } from '../utils'
import { defineComponentInstance } from '../utils/helper'
import { getCurrentInstance, getVueConstructor } from '../runtimeContext'
import {
  WatcherPreFlushQueueKey,
  WatcherPostFlushQueueKey,
} from '../utils/symbols'
import { ComputedRef } from './computed'

export type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onInvalidate: InvalidateCbRegistrator
) => any

type MapSources<T> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never
}

type MapOldSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V>
    ? Immediate extends true
      ? V | undefined
      : V
    : never
}

export interface WatchOptionsBase {
  flush?: FlushMode
  // onTrack?: ReactiveEffectOptions['onTrack'];
  // onTrigger?: ReactiveEffectOptions['onTrigger'];
}

type InvalidateCbRegistrator = (cb: () => void) => void

export type FlushMode = 'pre' | 'post' | 'sync'

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate
  deep?: boolean
}

export interface VueWatcher {
  lazy: boolean
  get(): any
  teardown(): void
  run(): void

  value: any
}

export type WatchStopHandle = () => void

let fallbackVM: ComponentInstance

function flushPreQueue(this: any) {
  flushQueue(this, WatcherPreFlushQueueKey)
}

function flushPostQueue(this: any) {
  flushQueue(this, WatcherPostFlushQueueKey)
}

function hasWatchEnv(vm: any) {
  return vm[WatcherPreFlushQueueKey] !== undefined
}

function installWatchEnv(vm: any) {
  vm[WatcherPreFlushQueueKey] = []
  vm[WatcherPostFlushQueueKey] = []
  vm.$on('hook:beforeUpdate', flushPreQueue)
  vm.$on('hook:updated', flushPostQueue)
}

function getWatcherOption(options?: Partial<WatchOptions>): WatchOptions {
  return {
    ...{
      immediate: false,
      deep: false,
      flush: 'pre',
    },
    ...options,
  }
}

function getWatchEffectOption(options?: Partial<WatchOptions>): WatchOptions {
  return {
    ...{
      immediate: true,
      deep: false,
      flush: 'pre',
    },
    ...options,
  }
}

function getWatcherVM() {
  let vm = getCurrentInstance()?.proxy
  if (!vm) {
    if (!fallbackVM) {
      fallbackVM = defineComponentInstance(getVueConstructor())
    }
    vm = fallbackVM
  } else if (!hasWatchEnv(vm)) {
    installWatchEnv(vm)
  }
  return vm
}

function flushQueue(vm: any, key: any) {
  const queue = vm[key]
  for (let index = 0; index < queue.length; index++) {
    queue[index]()
  }
  queue.length = 0
}

function queueFlushJob(
  vm: any,
  fn: () => void,
  mode: Exclude<FlushMode, 'sync'>
) {
  // flush all when beforeUpdate and updated are not fired
  const fallbackFlush = () => {
    vm.$nextTick(() => {
      if (vm[WatcherPreFlushQueueKey].length) {
        flushQueue(vm, WatcherPreFlushQueueKey)
      }
      if (vm[WatcherPostFlushQueueKey].length) {
        flushQueue(vm, WatcherPostFlushQueueKey)
      }
    })
  }

  switch (mode) {
    case 'pre':
      fallbackFlush()
      vm[WatcherPreFlushQueueKey].push(fn)
      break
    case 'post':
      fallbackFlush()
      vm[WatcherPostFlushQueueKey].push(fn)
      break
    default:
      assert(
        false,
        `flush must be one of ["post", "pre", "sync"], but got ${mode}`
      )
      break
  }
}

function createVueWatcher(
  vm: ComponentInstance,
  getter: () => any,
  callback: (n: any, o: any) => any,
  options: {
    deep: boolean
    sync: boolean
    immediateInvokeCallback?: boolean
    noRun?: boolean
    before?: () => void
  }
): VueWatcher {
  const index = vm._watchers.length
  // @ts-ignore: use undocumented options
  vm.$watch(getter, callback, {
    immediate: options.immediateInvokeCallback,
    deep: options.deep,
    lazy: options.noRun,
    sync: options.sync,
    before: options.before,
  })

  return vm._watchers[index]
}

// We have to monkeypatch the teardown function so Vue will run
// runCleanup() when it tears down the watcher on unmounted.
function patchWatcherTeardown(watcher: VueWatcher, runCleanup: () => void) {
  const _teardown = watcher.teardown
  watcher.teardown = function (...args) {
    _teardown.apply(watcher, args)
    runCleanup()
  }
}

function createWatcher(
  vm: ComponentInstance,
  source: WatchSource<unknown> | WatchSource<unknown>[] | WatchEffect,
  cb: WatchCallback<any> | null,
  options: WatchOptions
): () => void {
  const flushMode = options.flush
  const isSync = flushMode === 'sync'
  let cleanup: (() => void) | null
  const registerCleanup: InvalidateCbRegistrator = (fn: () => void) => {
    cleanup = () => {
      try {
        fn()
      } catch (error) {
        logError(error, vm, 'onCleanup()')
      }
    }
  }
  // cleanup before running getter again
  const runCleanup = () => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }
  const createScheduler = <T extends Function>(fn: T): T => {
    if (
      isSync ||
      /* without a current active instance, ignore pre|post mode */ vm ===
        fallbackVM
    ) {
      return fn
    }
    return (((...args: any[]) =>
      queueFlushJob(
        vm,
        () => {
          fn(...args)
        },
        flushMode as 'pre' | 'post'
      )) as any) as T
  }

  // effect watch
  if (cb === null) {
    let running = false
    const getter = () => {
      // preventing the watch callback being call in the same execution
      if (running) {
        return
      }
      try {
        running = true
        ;(source as WatchEffect)(registerCleanup)
      } finally {
        running = false
      }
    }
    const watcher = createVueWatcher(vm, getter, noopFn, {
      deep: options.deep || false,
      sync: isSync,
      before: runCleanup,
    })

    patchWatcherTeardown(watcher, runCleanup)

    // enable the watcher update
    watcher.lazy = false
    const originGet = watcher.get.bind(watcher)

    // always run watchEffect
    watcher.get = createScheduler(originGet)

    return () => {
      watcher.teardown()
    }
  }

  let deep = options.deep

  let getter: () => any
  if (Array.isArray(source)) {
    getter = () => source.map((s) => (isRef(s) ? s.value : s()))
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    deep = true
  } else if (isFunction(source)) {
    getter = source as () => any
  } else {
    getter = noopFn
    warn(
      `Invalid watch source: ${JSON.stringify(source)}.
      A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`,
      vm
    )
  }

  const applyCb = (n: any, o: any) => {
    // cleanup before running cb again
    runCleanup()
    cb(n, o, registerCleanup)
  }
  let callback = createScheduler(applyCb)
  if (options.immediate) {
    const originalCallback = callback
    // `shiftCallback` is used to handle the first sync effect run.
    // The subsequent callbacks will redirect to `callback`.
    let shiftCallback = (n: any, o: any) => {
      shiftCallback = originalCallback
      applyCb(n, o)
    }
    callback = (n: any, o: any) => {
      shiftCallback(n, o)
    }
  }

  // @ts-ignore: use undocumented option "sync"
  const stop = vm.$watch(getter, callback, {
    immediate: options.immediate,
    deep: deep,
    sync: isSync,
  })

  // Once again, we have to hack the watcher for proper teardown
  const watcher = vm._watchers[vm._watchers.length - 1]

  // if the return value is reactive and deep:true
  // watch for changes, this might happen when new key is added
  if (isReactive(watcher.value) && watcher.value.__ob__?.dep && deep) {
    watcher.value.__ob__.dep.addSub({
      update() {
        // this will force the source to be revaluated and the callback
        // executed if needed
        watcher.run()
      },
    })
  }

  patchWatcherTeardown(watcher, runCleanup)

  return () => {
    stop()
  }
}

export function watchEffect(
  effect: WatchEffect,
  options?: WatchOptionsBase
): WatchStopHandle {
  const opts = getWatchEffectOption(options)
  const vm = getWatcherVM()
  return createWatcher(vm, effect, null, opts)
}

// overload #1: array of multiple sources + cb
// Readonly constraint helps the callback to correctly infer value types based
// on position in the source array. Otherwise the values will get a union type
// of all possible value types.
export function watch<
  T extends Readonly<WatchSource<unknown>[]>,
  Immediate extends Readonly<boolean> = false
>(
  sources: T,
  cb: WatchCallback<MapSources<T>, MapOldSources<T, Immediate>>,
  options?: WatchOptions<Immediate>
): WatchStopHandle

// overload #2: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle

// overload #3: watching reactive object w/ cb
export function watch<
  T extends object,
  Immediate extends Readonly<boolean> = false
>(
  source: T,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle

// implementation
export function watch<T = any>(
  source: WatchSource<T> | WatchSource<T>[],
  cb: WatchCallback<T>,
  options?: WatchOptions
): WatchStopHandle {
  let callback: WatchCallback<unknown> | null = null
  if (typeof cb === 'function') {
    // source watch
    callback = cb as WatchCallback<unknown>
  } else {
    // effect watch
    if (__DEV__) {
      warn(
        `\`watch(fn, options?)\` signature has been moved to a separate API. ` +
          `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
          `supports \`watch(source, cb, options?) signature.`
      )
    }
    options = cb as Partial<WatchOptions>
    callback = null
  }

  const opts = getWatcherOption(options)
  const vm = getWatcherVM()

  return createWatcher(vm, source, callback, opts)
}
