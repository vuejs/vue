import { ComponentInstance } from '../component'
import vmStateManager from './vmStateManager'
import { setCurrentInstance, getCurrentVue2Instance } from '../runtimeContext'
import { Ref, isRef } from '../apis'
import { hasOwn, proxy, warn } from './utils'
import { createSlotProxy, resolveSlots } from './helper'

export function asVmProperty(
  vm: ComponentInstance,
  propName: string,
  propValue: Ref<unknown>
) {
  const props = vm.$options.props
  if (!(propName in vm) && !(props && hasOwn(props, propName))) {
    if (isRef(propValue)) {
      proxy(vm, propName, {
        get: () => propValue.value,
        set: (val: unknown) => {
          propValue.value = val
        },
      })
    } else {
      // @ts-ignore
      vm[propName] = propValue
    }

    if (__DEV__) {
      // expose binding to Vue Devtool as a data property
      // delay this until state has been resolved to prevent repeated works
      vm.$nextTick(() => {
        if (isRef(propValue)) {
          proxy(vm._data, propName, {
            get: () => propValue.value,
            set: (val: unknown) => {
              propValue.value = val
            },
          })
        } else {
          vm._data[propName] = propValue
        }
      })
    }
  } else if (__DEV__) {
    if (props && hasOwn(props, propName)) {
      warn(
        `The setup binding property "${propName}" is already declared as a prop.`,
        vm
      )
    } else {
      warn(`The setup binding property "${propName}" is already declared.`, vm)
    }
  }
}

export function updateTemplateRef(vm: ComponentInstance) {
  const rawBindings = vmStateManager.get(vm, 'rawBindings') || {}
  if (!rawBindings || !Object.keys(rawBindings).length) return

  const refs = vm.$refs
  const oldRefKeys = vmStateManager.get(vm, 'refs') || []
  for (let index = 0; index < oldRefKeys.length; index++) {
    const key = oldRefKeys[index]
    const setupValue = rawBindings[key]
    if (!refs[key] && setupValue && isRef(setupValue)) {
      setupValue.value = null
    }
  }

  const newKeys = Object.keys(refs)
  const validNewKeys = []
  for (let index = 0; index < newKeys.length; index++) {
    const key = newKeys[index]
    const setupValue = rawBindings[key]
    if (refs[key] && setupValue && isRef(setupValue)) {
      setupValue.value = refs[key]
      validNewKeys.push(key)
    }
  }
  vmStateManager.set(vm, 'refs', validNewKeys)
}

export function resolveScopedSlots(
  vm: ComponentInstance,
  slotsProxy: { [x: string]: Function }
): void {
  const parentVNode = (vm.$options as any)._parentVnode
  if (!parentVNode) return

  const prevSlots = vmStateManager.get(vm, 'slots') || []
  const curSlots = resolveSlots(parentVNode.data.scopedSlots, vm.$slots)
  // remove staled slots
  for (let index = 0; index < prevSlots.length; index++) {
    const key = prevSlots[index]
    if (!curSlots[key]) {
      delete slotsProxy[key]
    }
  }

  // proxy fresh slots
  const slotNames = Object.keys(curSlots)
  for (let index = 0; index < slotNames.length; index++) {
    const key = slotNames[index]
    if (!slotsProxy[key]) {
      slotsProxy[key] = createSlotProxy(vm, key)
    }
  }
  vmStateManager.set(vm, 'slots', slotNames)
}

export function activateCurrentInstance(
  vm: ComponentInstance,
  fn: (vm_: ComponentInstance) => any,
  onError?: (err: Error) => void
) {
  let preVm = getCurrentVue2Instance()
  setCurrentInstance(vm)
  try {
    return fn(vm)
  } catch (err) {
    if (onError) {
      onError(err)
    } else {
      throw err
    }
  } finally {
    setCurrentInstance(preVm)
  }
}
