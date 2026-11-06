import Vue from './vue.runtime.common.js'
export default Vue

// this should be kept in sync with src/v3/index.ts
export const {
  version,

  // refs
  ref,
  shallowRef,
  isRef,
  toRef,
  toRefs,
  unref,
  proxyRefs,
  customRef,
  triggerRef,
  computed,

  // reactive
  reactive,
  isReactive,
  isReadonly,
  isShallow,
  isProxy,
  shallowReactive,
  markRaw,
  toRaw,
  readonly,
  shallowReadonly,

  // watch
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,

  // effectScope
  effectScope,
  onScopeDispose,
  getCurrentScope,

  // provide / inject
  provide,
  inject,

  // lifecycle
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated,
  onServerPrefetch,
  onRenderTracked,
  onRenderTriggered,

  // v2 only
  set,
  del,

  // v3 compat
  h,
  getCurrentInstance,
  useSlots,
  useAttrs,
  mergeDefaults,
  nextTick,
  useCssModule,
  useCssVars,
  defineComponent,
  defineAsyncComponent
} = Vue
