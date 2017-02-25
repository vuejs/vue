/* @flow */

import { isNative } from 'core/util/env'

const hasReflect = typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys)

export function initInjections (vm: Component) {
  const provide = vm.$options.provide
  const inject: any = vm.$options.inject
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    // isArray here
    const isArray = Array.isArray(inject)
    const keys = isArray
      ? inject
      : hasReflect
        ? Reflect.ownKeys(inject)
        : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = isArray ? key : inject[key]
      let source = vm
      while (source) {
        if (source._provided && source._provided[provideKey]) {
          vm[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
    }
  }
}
