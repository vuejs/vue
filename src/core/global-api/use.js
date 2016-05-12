/* @flow */

import type Vue from '../instance/index'
import { toArray } from '../util/index'

export function initUse (Vue: Class<Vue>) {
  Vue.use = function (plugin: Function | Object) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return
    }
    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else {
      plugin.apply(null, args)
    }
    plugin.installed = true
    return this
  }
}
