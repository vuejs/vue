import config from '../config'
import { warn } from './debug'

export function handleError (err, vm, type) {
  if (config.errorHandler) {
    config.errorHandler.call(null, err, vm, type)
  } else {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Error in ${type}:`, vm)
    }
    if (typeof console !== 'undefined') {
      console.error(err)
    }
  }
}
