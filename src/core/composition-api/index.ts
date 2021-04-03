import type Vue from 'vue'
import { Data, SetupFunction } from './component'
import { Plugin } from './install'

export const version = __VERSION__

export * from './apis'
export * from './component'
export { getCurrentInstance } from './runtimeContext'

export default Plugin

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    setup?: SetupFunction<Data, Data>
  }
}

// auto install when using CDN
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Plugin)
}
