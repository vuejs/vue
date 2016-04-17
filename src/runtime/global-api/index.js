import config from '../config'
import * as util from '../util/index'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { nextTick } from '../util/index'
import { set, del } from '../observer/index'

export function initGlobalAPI (Vue) {
  Vue.config = config
  Vue.util = util
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  Vue.options = {
    directives: Object.create(null),
    filters: Object.create(null),
    components: Object.create(null),
    transitions: Object.create(null)
  }

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
