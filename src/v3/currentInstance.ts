import { Component } from 'types/component'

export let currentInstance: Component | null = null

/**
 * This is exposed for compatibility with v3 (e.g. some functions in VueUse
 * relies on it). Do not use this internally, just use `currentInstance`.
 *
 * @internal this function needs manual type declaration because it relies
 * on previously manually authored types from Vue 2
 */
export function getCurrentInstance(): { proxy: Component } | null {
  return currentInstance && { proxy: currentInstance }
}

/**
 * @internal
 */
export function setCurrentInstance(vm: Component | null = null) {
  if (!vm) currentInstance && currentInstance._scope.off()
  currentInstance = vm
  vm && vm._scope.on()
}
