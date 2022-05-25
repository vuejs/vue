import Vue from './runtime-with-compiler'
import * as vca from 'vca/index'
import { extend } from 'shared/util'

extend(Vue, vca)

import { effect } from 'vca/reactivity/effect'
Vue.effect = effect

export default Vue
