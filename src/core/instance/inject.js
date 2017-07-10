/* @flow */

import { hasSymbol } from 'core/util/env'
import { warn, defWithGetterSetter } from '../util/index'
import { defineReactive, isObserver } from '../observer/index'
import { hasOwn } from 'shared/util'

export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}

export function initInjections (vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    Object.keys(result).forEach(key => {
      const value = result[key]
      const warnSetter = () => {
        warn(
          `Avoid mutating an injected value directly since the changes will be ` +
          `overwritten whenever the provided component re-renders. ` +
          `injection being mutated: "${key}"`,
          vm
        )
      }
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        if (isObserver(value)) {
          defineReactive(vm, key, value, warnSetter)
        } else {
          defWithGetterSetter(vm, key, value, warnSetter)
        }
      } else {
        if (isObserver(value)) {
          defineReactive(vm, key, value)
        } else {
          defWithGetterSetter(vm, key, value)
        }
      }
    })
  }
}

export function resolveInject (inject: any, vm: Component): ?Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    const keys = hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = inject[key]
      let source = vm
      while (source) {
        if (source._provided && provideKey in source._provided) {
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      if (process.env.NODE_ENV !== 'production' && !hasOwn(result, key)) {
        warn(`Injection "${key}" not found`, vm)
      }
    }
    return result
  }
}
