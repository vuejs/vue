import config from '../config'

/**
 * Enable debug utilities.
 */

const hasConsole = typeof console !== 'undefined'

/**
 * We've got a problem here.
 *
 * @param {String} msg
 */

export function warn (msg, e) {
  if (hasConsole && (!config.silent || config.debug)) {
    console.warn('[Vue warn]: ' + msg)
    /* istanbul ignore if */
    if (config.debug) {
      if (e) {
        throw e
      } else {
        console.warn((new Error('Warning Stack Trace')).stack)
      }
    }
  }
}
