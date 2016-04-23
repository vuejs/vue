import { mergeOptions } from '../util/index'

export function initMixin (Vue) {
  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin)
  }
}
