module.exports = {

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Strict mode.
   * Disables asset lookup in the view parent chain.
   */

  strict: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether allow observer to alter data objects'
   * __proto__.
   *
   * @type {Boolean}
   */

  proto: true,

  /**
   * Whether to parse mustache tags in templates.
   *
   * @type {Boolean}
   */

  interpolate: true,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: [
    'component',
    'directive',
    'elementDirective',
    'filter',
    'transition',
    'partial'
  ],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}

/**
 * The prefix to look for when parsing directives.
 *
 * @type {String}
 */

var prefix = 'v-'
Object.defineProperty(module.exports, 'prefix', {
  get: function () {
    return prefix
  },
  set: function (val) {
    prefix = val
    if (process.env.NODE_ENV !== 'production') {
      require('./util').deprecation.PREFIX()
    }
  }
})

/**
 * Interpolation delimiters. Changing these would trigger
 * the text parser to re-compile the regular expressions.
 *
 * @type {Array<String>}
 */

var delimiters = ['{{', '}}']
var unsafeDelimiters = ['{{{', '}}}']
var textParser = require('./parsers/text')

Object.defineProperty(module.exports, 'delimiters', {
  get: function () {
    return delimiters
  },
  set: function (val) {
    delimiters = val
    var unsafeOpen = val[0].charAt(0) + val[0]
    var unsafeClose = val[1] + val[1].slice(-1)
    unsafeDelimiters = [unsafeOpen, unsafeClose]
    if (process.env.NODE_ENV !== 'production') {
      require('./util').log(
        'Interpolation delimiters for unsafe HTML will ' +
        'need to be configured separately as ' +
        'Vue.config.unsafeDelimiters in 1.0.0.'
      )
    }
    textParser.compileRegex()
  }
})

Object.defineProperty(module.exports, 'unsafeDelimiters', {
  get: function () {
    return unsafeDelimiters
  },
  set: function (val) {
    unsafeDelimiters = val
    textParser.compileRegex()
  }
})
