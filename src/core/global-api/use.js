/* @flow */
// qifa toArray 不在util中就在 shared/util中作为最常用的公共方法
import { toArray } from '../util/index'

// qifa 安装 Vue.js 插件。如果插件是一个对象，必须提供 install 方法。如果插件是一个函数，它会被作为 install 方法。
// install 方法调用时，会将 Vue 作为参数传入。当 install 方法被同一个插件多次调用，插件将只会被安装一次。

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // qifa 这个数组保存了所有的插件
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }
    // qifa args 是除第一个参数外的剩下的参数
    // additional parameters
    const args = toArray(arguments, 1)
    // qifa 神奇，把this指向的调用实例放入数组第一项
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
