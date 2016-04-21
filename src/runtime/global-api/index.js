import config from '../config'
import * as util from '../util/index'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { remove, nextTick } from '../util/index'
import { set, del } from '../observer/index'
import directives from '../directives/index'

export function initGlobalAPI (Vue) {
  Vue.config = config
  Vue.util = util
  Vue.set = set
  Vue.delete = del
  Vue.remove = remove
  Vue.nextTick = nextTick

  Vue.options = {
    directives,
    filters: Object.create(null),
    components: Object.create(null),
    transitions: Object.create(null)
  }

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
