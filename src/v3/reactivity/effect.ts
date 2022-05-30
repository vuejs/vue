import Watcher from 'core/observer/watcher'
import { noop } from 'shared/util'
import { currentInstance } from '../currentInstance'

// export type EffectScheduler = (...args: any[]) => any

/**
 * @internal since we are not exposing this in Vue 2, it's used only for
 * internal testing.
 */
export function effect(fn: () => any, scheduler?: (cb: any) => void) {
  const watcher = new Watcher(currentInstance, fn, noop, {
    sync: true
  })
  if (scheduler) {
    watcher.update = () => {
      scheduler(() => watcher.run())
    }
  }
}
