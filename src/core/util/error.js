/* @flow */

import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'
import { inProduction } from 'core/util/index'

export function handleError (err: Error, vm: any, info: string) {
  if (config.errorHandler) {
    config.errorHandler.call(null, err, vm, info)
  } else {
    !inProduction && warn(`Error in ${info}: "${err.toString()}"`, vm)

    /* istanbul ignore else */
    if (inBrowser && typeof console !== 'undefined') {
      console.error(err)
    } else {
      throw err
    }
  }
}
