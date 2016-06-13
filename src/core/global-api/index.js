/* @flow */

import config from '../config'
import * as util from '../util/index'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import builtInComponents from '../components/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  Vue.config = config
  Vue.util = util
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = util.nextTick

  Vue.options = Object.create(null)
  config._assetTypes.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  util.extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
