/* @flow */

import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'

export function handleError (err: Error, vm: any, info: string) {
  if (config.errorHandler) {
    try {
      config.errorHandler.call(null, err, vm, info)
      return
    } catch (e) {
      logError(e, null, 'errorHandler')
    }
  }
  logError(err, vm, info)
}

function logError (err, vm, info) {
  if (process.env.NODE_ENV !== 'production') {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if (inBrowser && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}
