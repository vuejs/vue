/* @flow */

import config from '../config'
import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    Vue.options = mergeOptions(Vue.options, mixin)
    // update constructors that are already created
    config._ctors.forEach(Ctor => {
      Ctor.options = mergeOptions(Ctor['super'].options, Ctor.extendOptions)
    })
  }
}
