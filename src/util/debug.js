var config = require('../config')

/**
 * Enable debug utilities. The enableDebug() function and all
 * _.log() & _.warn() calls will be dropped in the minified
 * production build.
 */

enableDebug()

function enableDebug () {
  var hasConsole = typeof console !== 'undefined'
  
  /**
   * Log a message.
   *
   * @param {String} msg
   */

  exports.log = function (msg) {
    if (hasConsole && config.debug) {
      console.log(msg)
    }
  }

  /**
   * We've got a problem here.
   *
   * @param {String} msg
   */

  exports.warn = function (msg) {
    if (hasConsole && !config.silent) {
      console.warn(msg)
      if (config.debug && console.trace) {
        console.trace(msg)
      }
    }
  }
}