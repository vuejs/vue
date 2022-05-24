import { Component } from 'typescript/component'

// TODO set this
export let currentInstance: Component | null = null

export function getCurrentInstance(): Component | null {
  return currentInstance
}

export function setCurrentInstance(vm: Component | null) {
  currentInstance = vm
}
