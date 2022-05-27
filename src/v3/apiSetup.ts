import { Component } from 'typescript/component'
import type { SetupContext } from 'typescript/options'
import { invokeWithErrorHandling, isReserved, warn } from '../core/util'
import VNode from '../core/vdom/vnode'
import { bind, isObject } from '../shared/util'
import { currentInstance, setCurrentInstance } from './currentInstance'
import { isRef } from './reactivity/ref'

export function initSetup(vm: Component) {
  const options = vm.$options
  const setup = options.setup
  if (setup) {
    const ctx = {
      get attrs() {
        return initAttrsProxy(vm)
      },
      get slots() {
        return initSlotsProxy(vm)
      },
      emit: bind(vm.$emit, vm) as any
    }

    setCurrentInstance(vm)
    const setupResult = invokeWithErrorHandling(
      setup,
      null,
      [vm._props, ctx],
      vm,
      `setup`
    )
    setCurrentInstance()

    if (typeof setupResult === 'function') {
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

function initAttrsProxy(vm: Component) {
  if (!vm._attrsProxy) {
    syncObject((vm._attrsProxy = {}), vm.$attrs)
  }
  return vm._attrsProxy
}

function initSlotsProxy(vm: Component) {
  if (!vm._slotsProxy) {
    syncObject((vm._slotsProxy = {}), vm.$scopedSlots)
  }
  return vm._slotsProxy
}

export function syncObject(to: any, from: any) {
  for (const key in from) {
    to[key] = from[key]
  }
  for (const key in to) {
    if (!(key in from)) {
      delete to[key]
    }
  }
}

export function useSlots(): SetupContext['slots'] {
  return getContext().slots
}

export function useAttrs(): SetupContext['attrs'] {
  return getContext().attrs
}

function getContext(): SetupContext {
  if (__DEV__ && !currentInstance) {
    warn(`useContext() called without active instance.`)
  }
  return currentInstance!.setupContext
}
