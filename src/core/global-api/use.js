/* @flow */

import { toArray } from '../util/index'

// vue.use()实现
export function initUse (Vue: GlobalAPI) {
  // 插件可以是函数 可以使对象
  Vue.use = function (plugin: Function | Object) {
    // 下面定义的常量是 已经安装的常量 
    //  this指向Vue实例 如果 这个 _installedPlugins 已经有则使用 没有则创建
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 如果当前插件已经安装 则退出、
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 将arguments转换成数组  并且去除第一个参数  因为可能传入不止一个参数
    const args = toArray(arguments, 1)
    // 再将Vue实例再插入到第一个
    args.unshift(this)
    // 如果传入的plugin是对象   则调用install方法 并且将args传入 
    // args 第一个参数是this (vue)  其余的参数就是创建插件传入的剩余参数
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    // 将创建好的插件存入数组
    installedPlugins.push(plugin)
    return this
  }
}
