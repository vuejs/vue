import Watcher from 'core/observer/watcher'
import { noop } from 'shared/util'
import { currentInstance } from '../currentInstance'
import { TrackOpTypes, TriggerOpTypes } from './operations'

export type EffectScheduler = (...args: any[]) => any

export type DebuggerEvent = {
  effect: ReactiveEffect
} & DebuggerEventExtraInfo

export type DebuggerEventExtraInfo = {
  target: object
  type: TrackOpTypes | TriggerOpTypes
  key: any
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}

export class ReactiveEffect<T = any> {
  onStop?: () => void
  // dev only
  onTrack?: (event: DebuggerEvent) => void
  // dev only
  onTrigger?: (event: DebuggerEvent) => void

  public active = true
  private _watcher: Watcher

  constructor(
    public fn: () => T,
    scheduler?: EffectScheduler // TODO scope?: EffectScope
  ) {
    // TODO recordEffectScope(this, scope)
    // TODO debug options
    this._watcher = new Watcher(currentInstance, fn, noop, {
      // always force trigger update if has scheduler
      deep: true,
      sync: !scheduler,
      scheduler
    })
  }

  run() {
    this._watcher.run()
    return this._watcher.value
  }

  stop() {
    this._watcher.teardown()
    this.active = false
  }
}

// since we are not exposing this in Vue 2, it's used only for internal testing.
export const effect = (fn: () => any, scheduler?: any) =>
  new ReactiveEffect(fn, scheduler)
