/*
 * @Description:
 * @version:
 * @Author: Murphy
 * @Date: 2022-07-02 12:30:56
 * @LastEditTime: 2022-07-02 18:11:46
 */
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

export function initGlobalAPI(Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    // 不要给config直接重新赋值，应该是在config上挂载成员
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 初始化 Vue.config 对象
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // 静态方法 直接挂载到vue的构造函数上
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 让一个对象可响应
  Vue.observable = <>(obj: T): T => {
    observe(obj)
    return obj
  }
    /* 初始化Vue.options对象，并设置原型为null，可以提高性能，
    并给其扩展为components directives filters
    用来存储全局的组件，指令，过滤器
    */
    Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
      Vue.options[type + 's'] = Object.create(null)
    })

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    //记录一下构造函数
    Vue.options._base = Vue

    /* 注册了一个内置组件，设置keep-alive组件 ，浅拷贝builtInComponents*/
    extend(Vue.options.components, builtInComponents)

    // 下面也是静态方法
    /* 注册Vue.use()用来注册插件 */
    initUse(Vue)
    /* 实现混入 */
    initMixin(Vue)
    /* 注册Vue.extend 基于传入的options返回一个组件的构造函数
    实际上里面就是继承自Vue的组件
    */
    initExtend(Vue)
    /* 注册Vue.directive(),Vue.component(), Vue.filter()*/
    initAssetRegisters(Vue)
}
