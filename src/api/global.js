var _ = require('../util')
var config = require('../config')

/**
 * Configuration
 */

exports.config = function () {
  
}

/**
 * Class inehritance
 */

exports.extend = function () {
  
}

/**
 * Plugin system
 */

exports.use = function () {
  
}

/**
 * Expose some internal utilities
 */

exports.require = function () {
  
}

/**
 * Define asset registries and registration
 * methods on a constructor.
 */

config.assetTypes.forEach(function (type) {
  var registry = '_' + type + 's'
  exports[registry] = {}

  /**
   * Asset registration method.
   *
   * @param {String} id
   * @param {*} definition
   */

  exports[type] = function (id, definition) {
    this[registry][id] = definition
  }
})

/**
 * This is pretty useful so we expose it as a global method.
 */

exports.nextTick = _.nextTick