/* @flow */

import { hasSymbol } from 'core/util/env'
import { warn } from '../util/index'
import { defineReactive } from '../observer/index'

export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}

export function initInjections (vm: Component) {
  const inject: any = vm.$options.inject
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    // isArray here
    const isArray = Array.isArray(inject)
    const keys = isArray
      ? inject
      : hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = isArray ? key : inject[key]
      let source = vm
      while (source) {
        if (source._provided && provideKey in source._provided) {
          /* istanbul ignore else */
          if (process.env.NODE_ENV !== 'production') {
            defineReactive(vm, key, source._provided[provideKey], () => {
              warn(
                `Avoid mutating an injected value directly since the changes will be ` +
                `overwritten whenever the provided component re-renders. ` +
                `injection being mutated: "${key}"`,
                vm
              )
            })
          } else {
            defineReactive(vm, key, source._provided[provideKey])
          }
          break
        }
        source = source.$parent
      }
    }
  }
}
