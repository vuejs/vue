import { isFunction, isObject, warn } from '../utils'
import { VueProxy } from './componentProxy'
import { AsyncComponent } from 'vue'

import {
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithProps,
} from './componentOptions'

type ComponentOptions =
  | ComponentOptionsWithoutProps
  | ComponentOptionsWithArrayProps
  | ComponentOptionsWithProps

type Component = VueProxy<any, any, any, any, any>

type ComponentOrComponentOptions = ComponentOptions | Component

export type AsyncComponentResolveResult<T = ComponentOrComponentOptions> =
  | T
  | { default: T } // es modules

export type AsyncComponentLoader = () => Promise<AsyncComponentResolveResult>

export interface AsyncComponentOptions {
  loader: AsyncComponentLoader
  loadingComponent?: ComponentOrComponentOptions
  errorComponent?: ComponentOrComponentOptions
  delay?: number
  timeout?: number
  suspensible?: boolean
  onError?: (
    error: Error,
    retry: () => void,
    fail: () => void,
    attempts: number
  ) => any
}

export function defineAsyncComponent(
  source: AsyncComponentLoader | AsyncComponentOptions
): AsyncComponent {
  if (isFunction(source)) {
    source = { loader: source }
  }

  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout, // undefined = never times out
    suspensible = false, // in Vue 3 default is true
    onError: userOnError,
  } = source

  if (__DEV__ && suspensible) {
    warn(
      `The suspensiblbe option for async components is not supported in Vue2. It is ignored.`
    )
  }

  let pendingRequest: Promise<Component> | null = null

  let retries = 0
  const retry = () => {
    retries++
    pendingRequest = null
    return load()
  }

  const load = (): Promise<ComponentOrComponentOptions> => {
    let thisRequest: Promise<ComponentOrComponentOptions>
    return (
      pendingRequest ||
      (thisRequest = pendingRequest = loader()
        .catch((err) => {
          err = err instanceof Error ? err : new Error(String(err))
          if (userOnError) {
            return new Promise((resolve, reject) => {
              const userRetry = () => resolve(retry())
              const userFail = () => reject(err)
              userOnError(err, userRetry, userFail, retries + 1)
            })
          } else {
            throw err
          }
        })
        .then((comp: any) => {
          if (thisRequest !== pendingRequest && pendingRequest) {
            return pendingRequest
          }
          if (__DEV__ && !comp) {
            warn(
              `Async component loader resolved to undefined. ` +
                `If you are using retry(), make sure to return its return value.`
            )
          }
          // interop module default
          if (
            comp &&
            (comp.__esModule || comp[Symbol.toStringTag] === 'Module')
          ) {
            comp = comp.default
          }
          if (__DEV__ && comp && !isObject(comp) && !isFunction(comp)) {
            throw new Error(`Invalid async component load result: ${comp}`)
          }
          return comp
        }))
    )
  }

  return () => {
    const component = load()

    return {
      component: component as any, // there is a type missmatch between vue2 type and the docs
      delay,
      timeout,
      error: errorComponent,
      loading: loadingComponent,
    }
  }
}
