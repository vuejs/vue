/* @flow */

import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'

export function handleError (err: Error, vm: any, info: string) {
  if (vm) {
    let cur = vm
    while ((cur = cur.$parent)) {
      if (cur.$options.errorCaptured) {
        try {
          const propagate = cur.$options.errorCaptured.call(cur, err, vm, info)
          if (!propagate) return
        } catch (e) {
          globalHandleError(e, cur, 'errorCaptured hook')
        }
      }
    }
  }
  globalHandleError(err, vm, info)
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      logError(e, null, 'config.errorHandler')
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
