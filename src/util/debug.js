var config = require('../config')

/**
 * Enable debug utilities. The enableDebug() function and
 * all _.log() & _.warn() calls will be dropped in the
 * minified production build.
 */

enableDebug()

function enableDebug () {
  var hasConsole = typeof console !== 'undefined'
  
  /**
   * Log a message.
   *
   * @param {*...}
   */

  exports.log = function () {
    if (hasConsole && config.debug) {
      console.log.apply(console, arguments)
    }
  }

  /**
   * We've got a problem here.
   *
   * @param {*...}
   */

  exports.warn = function () {
    if (hasConsole && !config.silent) {
      console.warn.apply(console, arguments)
      if (config.debug && console.trace) {
        console.trace()
      }
    }
  }
}