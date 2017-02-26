import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'

export function handleError (err, vm, type) {
  if (config.errorHandler) {
    config.errorHandler.call(null, err, vm, type)
  } else {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Error in ${type}:`, vm)
    }
    /* istanbul ignore else */
    if (inBrowser && typeof console !== 'undefined') {
      console.error(err)
    } else {
      throw err
    }
  }
}
