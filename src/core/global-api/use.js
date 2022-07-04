/*
 * @Description:
 * @version:
 * @Author: Murphy
 * @Date: 2022-07-02 12:30:56
 * @LastEditTime: 2022-07-02 18:00:15
 */
/* @flow */

import { toArray } from '../util/index'

export function initUse(Vue: GlobalAPI) {
  // 增加一个use方法
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 参数转化成数组，并去除第一个元素，也就是插件
    const args = toArray(arguments, 1)
    // 数组中插入this到第一个位置，也就是Vue
    args.unshift(this)
    // 根据插件的类型执行插件的方法
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
