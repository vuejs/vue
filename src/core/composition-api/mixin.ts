import type { VueConstructor } from 'vue'
import {
  ComponentInstance,
  SetupContext,
  SetupFunction,
  Data,
} from './component'
import { isRef, isReactive, toRefs, isRaw } from './reactivity'
import {
  isPlainObject,
  assert,
  proxy,
  warn,
  isFunction,
  isObject,
  def,
  isArray,
} from './utils'
import { ref } from './apis'
import vmStateManager from './utils/vmStateManager'
import {
  updateTemplateRef,
  activateCurrentInstance,
  resolveScopedSlots,
  asVmProperty,
} from './utils/instance'
import { getVueConstructor } from './runtimeContext'
import { createObserver, reactive } from './reactivity/reactive'

export function mixin(Vue: VueConstructor) {
  Vue.mixin({
    beforeCreate: functionApiInit,
    mounted(this: ComponentInstance) {
      updateTemplateRef(this)
    },
    updated(this: ComponentInstance) {
      updateTemplateRef(this)
    },
  })

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function functionApiInit(this: ComponentInstance) {
    const vm = this
    const $options = vm.$options
    const { setup, render } = $options

    if (render) {
      // keep currentInstance accessible for createElement
      $options.render = function (...args: any): any {
        return activateCurrentInstance(vm, () => render.apply(this, args))
      }
    }

    if (!setup) {
      return
    }
    if (typeof setup !== 'function') {
      if (__DEV__) {
        warn(
          'The "setup" option should be a function that returns a object in component definitions.',
          vm
        )
      }
      return
    }

    const { data } = $options
    // wrapper the data option, so we can invoke setup before data get resolved
    $options.data = function wrappedData() {
      initSetup(vm, vm.$props)
      return typeof data === 'function'
        ? (data as (
            this: ComponentInstance,
            x: ComponentInstance
          ) => object).call(vm, vm)
        : data || {}
    }
  }

  function initSetup(vm: ComponentInstance, props: Record<any, any> = {}) {
    const setup = vm.$options.setup!
    const ctx = createSetupContext(vm)

    // fake reactive for `toRefs(props)`
    def(props, '__ob__', createObserver())

    // resolve scopedSlots and slots to functions
    // @ts-expect-error
    resolveScopedSlots(vm, ctx.slots)

    let binding: ReturnType<SetupFunction<Data, Data>> | undefined | null
    activateCurrentInstance(vm, () => {
      // make props to be fake reactive, this is for `toRefs(props)`
      binding = setup(props, ctx)
    })

    if (!binding) return
    if (isFunction(binding)) {
      // keep typescript happy with the binding type.
      const bindingFunc = binding
      // keep currentInstance accessible for createElement
      vm.$options.render = () => {
        // @ts-expect-error
        resolveScopedSlots(vm, ctx.slots)
        return activateCurrentInstance(vm, () => bindingFunc())
      }
      return
    } else if (isPlainObject(binding)) {
      if (isReactive(binding)) {
        binding = toRefs(binding) as Data
      }

      vmStateManager.set(vm, 'rawBindings', binding)
      const bindingObj = binding

      Object.keys(bindingObj).forEach((name) => {
        let bindingValue: any = bindingObj[name]

        if (!isRef(bindingValue)) {
          if (!isReactive(bindingValue)) {
            if (isFunction(bindingValue)) {
              bindingValue = bindingValue.bind(vm)
            } else if (!isObject(bindingValue)) {
              bindingValue = ref(bindingValue)
            } else if (hasReactiveArrayChild(bindingValue)) {
              // creates a custom reactive properties without make the object explicitly reactive
              // NOTE we should try to avoid this, better implementation needed
              customReactive(bindingValue)
            }
          } else if (isArray(bindingValue)) {
            bindingValue = ref(bindingValue)
          }
        }
        asVmProperty(vm, name, bindingValue)
      })

      return
    }

    if (__DEV__) {
      assert(
        false,
        `"setup" must return a "Object" or a "Function", got "${Object.prototype.toString
          .call(binding)
          .slice(8, -1)}"`
      )
    }
  }

  function customReactive(target: object) {
    if (
      !isPlainObject(target) ||
      isRef(target) ||
      isReactive(target) ||
      isRaw(target)
    )
      return
    const Vue = getVueConstructor()
    const defineReactive = Vue.util.defineReactive

    Object.keys(target).forEach((k) => {
      const val = target[k]
      defineReactive(target, k, val)
      if (val) {
        customReactive(val)
      }
      return
    })
  }

  function hasReactiveArrayChild(target: object, visited = new Map()): boolean {
    if (visited.has(target)) {
      return visited.get(target)
    }
    visited.set(target, false)
    if (Array.isArray(target) && isReactive(target)) {
      visited.set(target, true)
      return true
    }

    if (!isPlainObject(target) || isRaw(target)) {
      return false
    }
    return Object.keys(target).some((x) =>
      hasReactiveArrayChild(target[x], visited)
    )
  }

  function createSetupContext(
    vm: ComponentInstance & { [x: string]: any }
  ): SetupContext {
    const ctx = { slots: {} } as SetupContext

    const propsPlain = [
      'root',
      'parent',
      'refs',
      'listeners',
      'isServer',
      'ssrContext',
    ]
    const propsReactiveProxy = ['attrs']
    const methodReturnVoid = ['emit']

    propsPlain.forEach((key) => {
      let srcKey = `$${key}`
      proxy(ctx, key, {
        get: () => vm[srcKey],
        set() {
          warn(
            `Cannot assign to '${key}' because it is a read-only property`,
            vm
          )
        },
      })
    })

    propsReactiveProxy.forEach((key) => {
      let srcKey = `$${key}`
      proxy(ctx, key, {
        get: () => {
          const data = reactive({})
          const source = vm[srcKey]

          for (const attr of Object.keys(source)) {
            proxy(data, attr, {
              get: () => {
                // to ensure it always return the latest value
                return vm[srcKey][attr]
              },
            })
          }

          return data
        },
        set() {
          warn(
            `Cannot assign to '${key}' because it is a read-only property`,
            vm
          )
        },
      })
    })

    methodReturnVoid.forEach((key) => {
      const srcKey = `$${key}`
      proxy(ctx, key, {
        get() {
          return (...args: any[]) => {
            const fn: Function = vm[srcKey]
            fn.apply(vm, args)
          }
        },
      })
    })
    if (process.env.NODE_ENV === 'test') {
      ;(ctx as any)._vm = vm
    }
    return ctx
  }
}
