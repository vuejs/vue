import { Component } from 'types/component'
import type { SetupContext } from 'types/options'
import { def, invokeWithErrorHandling, isReserved, warn } from '../core/util'
import VNode from '../core/vdom/vnode'
import { bind, emptyObject, isFunction, isObject } from '../shared/util'
import { currentInstance, setCurrentInstance } from './currentInstance'
import { isRef } from './reactivity/ref'

export function initSetup(vm: Component) {
  const options = vm.$options
  const setup = options.setup
  if (setup) {
    const ctx = (vm._setupContext = createSetupContext(vm))

    setCurrentInstance(vm)
    const setupResult = invokeWithErrorHandling(
      setup,
      null,
      [vm._props, ctx],
      vm,
      `setup`
    )
    setCurrentInstance()

    if (isFunction(setupResult)) {
      // render function
      // @ts-ignore
      options.render = setupResult
    } else if (isObject(setupResult)) {
      // bindings
      if (__DEV__ && setupResult instanceof VNode) {
        warn(
          `setup() should not return VNodes directly - ` +
            `return a render function instead.`
        )
      }
      vm._setupState = setupResult
      for (const key in setupResult) {
        if (!isReserved(key)) {
          proxySetupProperty(vm, setupResult, key)
        }
      }
    } else if (__DEV__ && setupResult !== undefined) {
      warn(
        `setup() should return an object. Received: ${
          setupResult === null ? 'null' : typeof setupResult
        }`
      )
    }
  }
}

function proxySetupProperty(
  vm: Component,
  setupResult: Record<string, any>,
  key: string
) {
  const raw = setupResult[key]
  const unwrap = isRef(raw)
  Object.defineProperty(vm, key, {
    enumerable: true,
    configurable: true,
    get: unwrap ? () => raw.value : () => setupResult[key],
    set: unwrap ? v => (raw.value = v) : v => (setupResult[key] = v)
  })
}

function createSetupContext(vm: Component) {
  return {
    get attrs() {
      return initAttrsProxy(vm)
    },
    get slots() {
      return initSlotsProxy(vm)
    },
    emit: bind(vm.$emit, vm) as any
  }
}

function initAttrsProxy(vm: Component) {
  if (!vm._attrsProxy) {
    const proxy = (vm._attrsProxy = {})
    def(proxy, '_v_attr_proxy', true)
    syncSetupAttrs(proxy, vm.$attrs, emptyObject, vm)
  }
  return vm._attrsProxy
}

export function syncSetupAttrs(
  to: any,
  from: any,
  prev: any,
  instance: Component
) {
  let changed = false
  for (const key in from) {
    if (!(key in to)) {
      changed = true
      defineProxyAttr(to, key, instance)
    } else if (from[key] !== prev[key]) {
      changed = true
    }
  }
  for (const key in to) {
    if (!(key in from)) {
      changed = true
      delete to[key]
    }
  }
  return changed
}

function defineProxyAttr(proxy: any, key: string, instance: Component) {
  Object.defineProperty(proxy, key, {
    enumerable: true,
    configurable: true,
    get() {
      return instance.$attrs[key]
    }
  })
}

function initSlotsProxy(vm: Component) {
  if (!vm._slotsProxy) {
    syncSetupSlots((vm._slotsProxy = {}), vm.$scopedSlots)
  }
  return vm._slotsProxy
}

export function syncSetupSlots(to: any, from: any) {
  for (const key in from) {
    to[key] = from[key]
  }
  for (const key in to) {
    if (!(key in from)) {
      delete to[key]
    }
  }
}

/**
 * @internal use manual type def
 */
export function useSlots(): SetupContext['slots'] {
  return getContext().slots
}

/**
 * @internal use manual type def
 */
export function useAttrs(): SetupContext['attrs'] {
  return getContext().attrs
}

function getContext(): SetupContext {
  if (__DEV__ && !currentInstance) {
    warn(`useContext() called without active instance.`)
  }
  const vm = currentInstance!
  return vm._setupContext || (vm._setupContext = createSetupContext(vm))
}
