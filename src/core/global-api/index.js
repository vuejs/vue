/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  // 初始化 configDef
  const configDef = {}
  configDef.get = () => config
  // 非开发环境不能修改config属性
  if (process.env.NODE_ENV !== 'production') {
    // 在赋值的时候会提醒不要修改
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 使用defineProperty定义config 并没有响应式
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 这些不被认为是公共API的一部分  除非你意识到风险 。否则不要使用
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // 静态方法   set/delete/nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 定义observer 让一个对象变成可响应的
  Vue.observable = <>(obj: T): T => {
    observe(obj)
    return obj
  }

  // 初始化option的一些属性
  // ASSET_TYPES 定义常量的一个对象
  // 初始化了 'component', 'directive', 'filter'
  // 设置 options 对象 使用Object.create(null)创建对象并且设置对象的原型为NUll 效率会高一点
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {

    // 初始化 'component', 'directive', 'filter' + s 
    // 全局
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // 设置keep-alive组件
  extend(Vue.options.components, builtInComponents)

  // 注册Vue.use() 用来注册插件
  initUse(Vue)

  // 注册Vue.mixin() 实现混入
  initMixin(Vue)
  
  // 注册Vue.extend() 基于传入的options 返回一个组件的构造函数
  initExtend(Vue)
  
  // 注册Vue.directive() Vue.component() Vue.filter()
  initAssetRegisters(Vue)
}
