import { compileRegex } from './parsers/text'

let delimiters = ['{{', '}}']
let unsafeDelimiters = ['{{{', '}}}']

const config = {

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

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
   * Whether to allow devtools inspection.
   * Disabled by default in production builds.
   */

  devtools: process.env.NODE_ENV !== 'production',

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

  _maxUpdateCount: 100,

  /**
   * Interpolation delimiters. Changing these would trigger
   * the text parser to re-compile the regular expressions.
   *
   * @type {Array<String>}
   */

  get delimiters () {
    return delimiters
  },

  set delimiters (val) {
    delimiters = val
    compileRegex()
  },

  get unsafeDelimiters () {
    return unsafeDelimiters
  },

  set unsafeDelimiters (val) {
    unsafeDelimiters = val
    compileRegex()
  }
}

export default config
