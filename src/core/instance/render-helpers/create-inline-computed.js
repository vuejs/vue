/* @flow */

import { noop } from 'shared/util'
import Watcher from 'core/observer/watcher'

/**
 * This runtime helper creates an inline computed property for component
 * props that contain object or array literals. The caching ensures the same
 * object/array is returned unless the value has indeed changed, thus avoiding
 * the child component to always re-render when comparing props values.
 *
 * Installed to the instance as _a, requires special handling in parser that
 * transforms the following
 *   <foo :bar="{ a: 1 }"/>
 * to:
 *   <foo :bar="_a(0, function(){return { a: 1 }})"
 */
export function createInlineComputed (id: string, getter: Function): any {
  const vm: Component = this
  const watchers = vm._inlineComputed || (vm._inlineComputed = {})
  const cached = watchers[id]
  if (cached) {
    return cached.value
  } else {
    watchers[id] = new Watcher(vm, getter, noop, { sync: true })
    return watchers[id].value
  }
}
