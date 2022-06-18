declare const __DEV__: boolean
declare const __TEST__: boolean
declare const __GLOBAL__: boolean

interface Window {
  __VUE_DEVTOOLS_GLOBAL_HOOK__: DevtoolsHook
}

// from https://github.com/vuejs/vue-devtools/blob/bc719c95a744614f5c3693460b64dc21dfa339a8/packages/app-backend-api/src/global-hook.ts#L3
interface DevtoolsHook {
  emit: (event: string, ...payload: any[]) => void
  on: (event: string, handler: Function) => void
  once: (event: string, handler: Function) => void
  off: (event?: string, handler?: Function) => void
  Vue?: any
  // apps: AppRecordOptions[]
}
