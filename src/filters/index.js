import { toArray, debounce as _debounce } from '../util/index'
import { orderBy, filterBy, limitBy } from './array-filters'
const digitsRE = /(\d{3})(?=\d)/g

// asset collections must be a plain object.
export default {

  orderBy,
  filterBy,
  limitBy,

  /**
   * Stringify value.
   *
   * @param {Number} indent
   */

  json: {
    read: function (value, indent) {
      return typeof value === 'string'
        ? value
        : JSON.stringify(value, null, Number(indent) || 2)
    },
    write: function (value) {
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    }
  },

  /**
   * 'abc' => 'Abc'
   */

  capitalize (value) {
    if (!value && value !== 0) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },

  /**
   * 'abc' => 'ABC'
   */

  uppercase (value) {
    return (value || value === 0)
      ? value.toString().toUpperCase()
      : ''
  },

  /**
   * 'AbC' => 'abc'
   */

  lowercase (value) {
    return (value || value === 0)
      ? value.toString().toLowerCase()
      : ''
  },

  /**
   * 12345 => $12,345.00
   *
   * @param {String} sign
   * @param {Number} decimals Decimal places
   */

  currency (value, currency, decimals) {
    value = parseFloat(value)
    if (!isFinite(value) || (!value && value !== 0)) return ''
    currency = currency != null ? currency : '$'
    decimals = decimals != null ? decimals : 2
    var stringified = Math.abs(value).toFixed(decimals)
    var _int = decimals
      ? stringified.slice(0, -1 - decimals)
      : stringified
    var i = _int.length % 3
    var head = i > 0
      ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
      : ''
    var _float = decimals
      ? stringified.slice(-1 - decimals)
      : ''
    var sign = value < 0 ? '-' : ''
    return sign + currency + head +
      _int.slice(i).replace(digitsRE, '$1,') +
      _float
  },

  /**
   * 'item' => 'items'
   *
   * @params
   *  an array of strings corresponding to
   *  the single, double, triple ... forms of the word to
   *  be pluralized. When the number to be pluralized
   *  exceeds the length of the args, it will use the last
   *  entry in the array.
   *
   *  e.g. ['single', 'double', 'triple', 'multiple']
   */

  pluralize (value) {
    var args = toArray(arguments, 1)
    return args.length > 1
      ? (args[value % 10 - 1] || args[args.length - 1])
      : (args[0] + (value === 1 ? '' : 's'))
  },

  /**
   * Debounce a handler function.
   *
   * @param {Function} handler
   * @param {Number} delay = 300
   * @return {Function}
   */

  debounce (handler, delay) {
    if (!handler) return
    if (!delay) {
      delay = 300
    }
    return _debounce(handler, delay)
  }
}
