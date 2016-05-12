/* @flow */

import type Vue from '../instance/index'
import { mergeOptions } from '../util/index'

export function initMixin (Vue: Class<Vue>) {
  Vue.mixin = function (mixin: Object) {
    Vue.options = mergeOptions(Vue.options, mixin)
  }
}
