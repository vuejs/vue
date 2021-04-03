// `vue.common.js` is required for shallow mounts.
// Typescript can not infer it properly, this file is a workround to set the type

// @ts-ignore
import _vue from 'vue/dist/vue.common'
import { VueConstructor } from 'vue'

export default (_vue as any) as VueConstructor
