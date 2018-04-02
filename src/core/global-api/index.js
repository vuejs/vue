/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 设置全局 config 配置，不能整个替换，支持单个属性覆盖
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 导出一些内部公用的方法，但是正在讨论这个方法公开的可行性，尽量避免使用
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // 设置 set del nextTick 这些公用的方法
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 设置 option 为一个对象
  Vue.options = Object.create(null)
  // 设置 components directives filters 为空对象
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // 保存原始 Vue 类对象
  Vue.options._base = Vue

  // 添加与平台无关的组件 keepAlive
  extend(Vue.options.components, builtInComponents)

  // 挂载注册中间件函数
  initUse(Vue)
  // 全局混入，并不会生成一个新的类，而是之后所有创建的类都会有影响，所以慎用，或者用 extend 来实现
  initMixin(Vue)
  // TODO 实现子类生成方法
  initExtend(Vue)
  // 生成注册全局的 component/directive/filter 方法
  initAssetRegisters(Vue)
}
