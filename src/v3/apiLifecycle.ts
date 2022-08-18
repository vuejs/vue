import { DebuggerEvent } from './debug'
import { Component } from 'types/component'
import { mergeLifecycleHook, warn } from '../core/util'
import { currentInstance } from './currentInstance'

function createLifeCycle<T extends (...args: any[]) => any = () => void>(
  hookName: string
) {
  return (fn: T, target: any = currentInstance) => {
    if (!target) {
      __DEV__ &&
        warn(
          `${formatName(
            hookName
          )} is called when there is no active component instance to be ` +
            `associated with. ` +
            `Lifecycle injection APIs can only be used during execution of setup().`
        )
      return
    }
    return injectHook(target, hookName, fn)
  }
}

function formatName(name: string) {
  if (name === 'beforeDestroy') {
    name = 'beforeUnmount'
  } else if (name === 'destroyed') {
    name = 'unmounted'
  }
  return `on${name[0].toUpperCase() + name.slice(1)}`
}

function injectHook(instance: Component, hookName: string, fn: () => void) {
  const options = instance.$options
  options[hookName] = mergeLifecycleHook(options[hookName], fn)
}

export const onBeforeMount = createLifeCycle('beforeMount')
export const onMounted = createLifeCycle('mounted')
export const onBeforeUpdate = createLifeCycle('beforeUpdate')
export const onUpdated = createLifeCycle('updated')
export const onBeforeUnmount = createLifeCycle('beforeDestroy')
export const onUnmounted = createLifeCycle('destroyed')
export const onActivated = createLifeCycle('activated')
export const onDeactivated = createLifeCycle('deactivated')
export const onServerPrefetch = createLifeCycle('serverPrefetch')

export const onRenderTracked =
  createLifeCycle<(e: DebuggerEvent) => any>('renderTracked')
export const onRenderTriggered =
  createLifeCycle<(e: DebuggerEvent) => any>('renderTriggered')

export type ErrorCapturedHook<TError = unknown> = (
  err: TError,
  instance: any,
  info: string
) => boolean | void

const injectErrorCapturedHook =
  createLifeCycle<ErrorCapturedHook<any>>('errorCaptured')

export function onErrorCaptured<TError = Error>(
  hook: ErrorCapturedHook<TError>,
  target: any = currentInstance
) {
  injectErrorCapturedHook(hook, target)
}
