import config from '../config'

let warn

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined'
  warn = function (msg, e) {
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
}

export { warn }
