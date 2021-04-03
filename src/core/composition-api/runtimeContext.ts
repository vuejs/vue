import type { VueConstructor, VNode } from 'vue'
import { ComponentInstance, Data } from './component'
import { assert, hasOwn, warn, proxy, UnionToIntersection } from './utils'

let vueDependency: VueConstructor | undefined = undefined

try {
  const requiredVue = require('vue')
  if (requiredVue && isVue(requiredVue)) {
    vueDependency = requiredVue
  } else if (
    requiredVue &&
    'default' in requiredVue &&
    isVue(requiredVue.default)
  ) {
    vueDependency = requiredVue.default
  }
} catch {
  // not available
}

let vueConstructor: VueConstructor | null = null
let currentInstance: ComponentInstance | null = null

const PluginInstalledFlag = '__composition_api_installed__'

function isVue(obj: any): obj is VueConstructor {
  return obj && typeof obj === 'function' && obj.name === 'Vue'
}

export function isPluginInstalled() {
  return !!vueConstructor
}

export function isVueRegistered(Vue: VueConstructor) {
  return hasOwn(Vue, PluginInstalledFlag)
}

export function getVueConstructor(): VueConstructor {
  if (__DEV__) {
    assert(
      vueConstructor,
      `must call Vue.use(VueCompositionAPI) before using any function.`
    )
  }

  return vueConstructor!
}

// returns registered vue or `vue` dependency
export function getRegisteredVueOrDefault(): VueConstructor {
  let constructor = vueConstructor || vueDependency

  if (__DEV__) {
    assert(constructor, `No vue dependency found.`)
  }

  return constructor!
}

export function setVueConstructor(Vue: VueConstructor) {
  // @ts-ignore
  if (__DEV__ && vueConstructor && Vue.__proto__ !== vueConstructor.__proto__) {
    warn('[vue-composition-api] another instance of Vue installed')
  }
  vueConstructor = Vue
  Object.defineProperty(Vue, PluginInstalledFlag, {
    configurable: true,
    writable: true,
    value: true,
  })
}

export function setCurrentInstance(vm: ComponentInstance | null) {
  // currentInstance?.$scopedSlots
  currentInstance = vm
}

export type Slot = (...args: any[]) => VNode[]

export type InternalSlots = {
  [name: string]: Slot | undefined
}

export type ObjectEmitsOptions = Record<
  string,
  ((...args: any[]) => any) | null
>
export type EmitsOptions = ObjectEmitsOptions | string[]

export type EmitFn<
  Options = ObjectEmitsOptions,
  Event extends keyof Options = keyof Options
> = Options extends Array<infer V>
  ? (event: V, ...args: any[]) => void
  : {} extends Options // if the emit is empty object (usually the default value for emit) should be converted to function
  ? (event: string, ...args: any[]) => void
  : UnionToIntersection<
      {
        [key in Event]: Options[key] extends (...args: infer Args) => any
          ? (event: key, ...args: Args) => void
          : (event: key, ...args: any[]) => void
      }[Event]
    >

/**
 * We expose a subset of properties on the internal instance as they are
 * useful for advanced external libraries and tools.
 */
export declare interface ComponentInternalInstance {
  uid: number
  // type: ConcreteComponent
  parent: ComponentInternalInstance | null
  root: ComponentInternalInstance

  //appContext: AppContext

  /**
   * Vnode representing this component in its parent's vdom tree
   */
  vnode: VNode
  /**
   * Root vnode of this component's own vdom tree
   */
  // subTree: VNode // does not exist in Vue 2

  /**
   * The reactive effect for rendering and patching the component. Callable.
   */
  update: Function

  data: Data
  props: Data
  attrs: Data
  refs: Data
  emit: EmitFn

  slots: InternalSlots
  emitted: Record<string, boolean> | null

  proxy: ComponentInstance

  isMounted: boolean
  isUnmounted: boolean
  isDeactivated: boolean
}

export function getCurrentVue2Instance() {
  return currentInstance
}

export function getCurrentInstance() {
  if (currentInstance) {
    return toVue3ComponentInstance(currentInstance)
  }
  return null
}

const instanceMapCache = new WeakMap<
  ComponentInstance,
  ComponentInternalInstance
>()

function toVue3ComponentInstance(
  vue2Instance: ComponentInstance
): ComponentInternalInstance {
  if (instanceMapCache.has(vue2Instance)) {
    return instanceMapCache.get(vue2Instance)!
  }

  const instance: ComponentInternalInstance = ({
    proxy: vue2Instance,
    update: vue2Instance.$forceUpdate,
    uid: vue2Instance._uid,

    // $emit is defined on prototype and it expected to be bound
    emit: vue2Instance.$emit.bind(vue2Instance),

    parent: null,
    root: null as any,
  } as unknown) as ComponentInternalInstance

  // map vm.$props =
  const instanceProps = [
    'data',
    'props',
    'attrs',
    'refs',
    'vnode',
    'slots',
  ] as const

  instanceProps.forEach((prop) => {
    proxy(instance, prop, {
      get() {
        return (vue2Instance as any)[`$${prop}`]
      },
    })
  })

  proxy(instance, 'isMounted', {
    get() {
      // @ts-expect-error private api
      return vue2Instance._isMounted
    },
  })

  proxy(instance, 'isUnmounted', {
    get() {
      // @ts-expect-error private api
      return vue2Instance._isDestroyed
    },
  })

  proxy(instance, 'isDeactivated', {
    get() {
      // @ts-expect-error private api
      return vue2Instance._inactive
    },
  })

  proxy(instance, 'emitted', {
    get() {
      // @ts-expect-error private api
      return vue2Instance._events
    },
  })

  instanceMapCache.set(vue2Instance, instance)

  if (vue2Instance.$parent) {
    instance.parent = toVue3ComponentInstance(vue2Instance.$parent)
  }

  if (vue2Instance.$root) {
    instance.root = toVue3ComponentInstance(vue2Instance.$root)
  }

  return instance
}
