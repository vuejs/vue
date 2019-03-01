/* @flow */

import { toArray, warn } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (plugin && typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    } else if (process.env.NODE_ENV !== 'production') {
      warn(
        'Plugin should be either function or object with install method.'
      )
    }
    installedPlugins.push(plugin)
    return this
  }
}
