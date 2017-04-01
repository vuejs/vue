/* @flow */

// () => ({
//   component: import('./xxx.vue'),
//   delay: 200,
//   loading: LoadingComponent,
//   error: ErrorComponent
// })

import {
  warn,
  isObject
} from 'core/util/index'

export function resolveAsyncComponent (
  factory: Function,
  baseCtor: Class<Component>,
  context: Component
): Class<Component> | void {
  if (factory.resolved) {
    return factory.resolved
  }

  const cb = () => context.$forceUpdate()
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb)
  } else {
    factory.requested = true
    const cbs = factory.pendingCallbacks = [cb]
    let sync = true

    const resolve = (res: Object | Class<Component>) => {
      if (isObject(res)) {
        res = baseCtor.extend(res)
      }
      // cache resolved
      factory.resolved = res
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        for (let i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res)
        }
      }
    }

    const reject = reason => {
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      )
    }

    const res = factory(resolve, reject)

    // handle promise
    if (res && typeof res.then === 'function' && !factory.resolved) {
      res.then(resolve, reject)
    }

    sync = false
    // return in case resolved synchronously
    return factory.resolved
  }
}
