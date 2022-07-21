import { warn, isFunction, isObject } from 'core/util'

interface AsyncComponentOptions {
  loader: Function
  loadingComponent?: any
  errorComponent?: any
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

type AsyncComponentFactory = () => {
  component: Promise<any>
  loading?: any
  error?: any
  delay?: number
  timeout?: number
}

/**
 * v3-compatible async component API.
 * @internal the type is manually declared in <root>/types/v3-define-async-component.d.ts
 * because it relies on existing manual types
 */
export function defineAsyncComponent(
  source: (() => any) | AsyncComponentOptions
): AsyncComponentFactory {
  if (isFunction(source)) {
    source = { loader: source } as AsyncComponentOptions
  }

  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout, // undefined = never times out
    suspensible = false, // in Vue 3 default is true
    onError: userOnError
  } = source

  if (__DEV__ && suspensible) {
    warn(
      `The suspensiblbe option for async components is not supported in Vue2. It is ignored.`
    )
  }

  let pendingRequest: Promise<any> | null = null

  let retries = 0
  const retry = () => {
    retries++
    pendingRequest = null
    return load()
  }

  const load = (): Promise<any> => {
    let thisRequest: Promise<any>
    return (
      pendingRequest ||
      (thisRequest = pendingRequest =
        loader()
          .catch(err => {
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
      component,
      delay,
      timeout,
      error: errorComponent,
      loading: loadingComponent
    }
  }
}
