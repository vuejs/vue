/*
 * not type checking this file because flow doesn't like dynamically setting
 * fields on a class
 */

import config from '../config'
import { warn, isPlainObject } from '../util/index'

export function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  config._assetTypes.forEach(type => {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && config.isReservedTag(id)) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            )
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = id
          definition = Vue.extend(definition)
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
