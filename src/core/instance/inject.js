/* @flow */

import { hasOwn } from 'shared/util'
import { warn, hasSymbol } from '../util/index'
import { defineReactive, toggleObserving } from '../observer/index'

export function initProvide (vm: Component) {
  // 找到 provide 存储的数据 放到 vm._provided中 
  // 这样在inject中获取 对应父组件的 _provided 属性
  const provide = vm.$options.provide
  if (provide) {
    // 判断是否是函数 如果是函数直接执行 并且改变this指向
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}

export function initInjections (vm: Component) {
  // 将 vm.$options.inject 中存在的属性提取出来 放到 result
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    // 遍历这些数据 设置成响应式的 并且注入到到vm实例
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}

export function resolveInject (inject: any, vm: Component): ?Object {
  // 先判断 vm.$options 中是否存在 inject
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    // 获取 inject 所有的key集合 数组
    const keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject)
    // 遍历 inject key的集合
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // #6574 in case the inject object is observed...
      if (key === '__ob__') continue
      const provideKey = inject[key].from
      let source = vm
      while (source) {
        // 判断是否在 source._provided 属性中
        if (source._provided && hasOwn(source._provided, provideKey)) {
          // 如果存在于provided中 就放到 result中  最后返回
          // 也就是会把父组件存在的属性放到result中 最后返回
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      if (!source) {
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
