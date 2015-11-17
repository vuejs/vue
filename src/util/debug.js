import config from '../config'

/**
 * Enable debug utilities.
 */

const hasConsole = typeof console !== 'undefined'

/**
 * Log a message.
 *
 * @param {String} msg
 */

export function log (msg) {
  if (hasConsole && config.debug) {
    console.log('[Vue info]: ' + msg)
  }
}

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
      console.warn((e || new Error('Warning Stack Trace')).stack)
    }
  }
}
