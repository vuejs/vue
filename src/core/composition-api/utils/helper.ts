import Vue, { VNode, ComponentOptions, VueConstructor } from 'vue'
import { ComponentInstance } from '../component'
import { getCurrentInstance, getVueConstructor } from '../runtimeContext'
import { warn } from './utils'

export function currentVMInFn(hook: string): ComponentInstance | undefined {
  const vm = getCurrentInstance()
  if (__DEV__ && !vm) {
    warn(
      `${hook} is called when there is no active component instance to be ` +
        `associated with. ` +
        `Lifecycle injection APIs can only be used during execution of setup().`
    )
  }
  return vm?.proxy
}

export function defineComponentInstance<V extends Vue = Vue>(
  Ctor: VueConstructor<V>,
  options: ComponentOptions<V> = {}
) {
  const silent = Ctor.config.silent
  Ctor.config.silent = true
  const vm = new Ctor(options)
  Ctor.config.silent = silent
  return vm
}

export function isComponentInstance(obj: any) {
  const Vue = getVueConstructor()
  return Vue && obj instanceof Vue
}

export function createSlotProxy(vm: ComponentInstance, slotName: string) {
  return (...args: any) => {
    if (!vm.$scopedSlots[slotName]) {
      return warn(
        `slots.${slotName}() got called outside of the "render()" scope`,
        vm
      )
    }

    return vm.$scopedSlots[slotName]!.apply(vm, args)
  }
}

export function resolveSlots(
  slots: { [key: string]: Function } | void,
  normalSlots: { [key: string]: VNode[] | undefined }
): { [key: string]: true } {
  let res: { [key: string]: true }
  if (!slots) {
    res = {}
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized as any
  } else {
    res = {}
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = true
      }
    }
  }

  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = true
    }
  }

  return res
}

let vueInternalClasses:
  | {
      Watcher: any
      Dep: any
    }
  | undefined

export const getVueInternalClasses = () => {
  if (!vueInternalClasses) {
    const vm: any = defineComponentInstance(getVueConstructor(), {
      computed: {
        value() {
          return 0
        },
      },
    })

    // to get Watcher class
    const Watcher = vm._computedWatchers.value.constructor
    // to get Dep class
    const Dep = vm._data.__ob__.dep.constructor

    vueInternalClasses = {
      Watcher,
      Dep,
    }

    vm.$destroy()
  }

  return vueInternalClasses
}
