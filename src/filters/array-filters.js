var _ = require('../util')
var Path = require('../parsers/path')

/**
 * Filter filter for v-repeat
 *
 * @param {String} searchKey
 * @param {String} [delimiter]
 * @param {String} dataKey
 */

exports.filterBy = function (arr, searchKey, delimiter, dataKey) {
  // allow optional `in` delimiter
  // because why not
  if (delimiter && delimiter !== 'in') {
    dataKey = delimiter
  }
  // get the search string
  var search =
    _.stripQuotes(searchKey) ||
    this.$get(searchKey)
  if (!search) {
    return arr
  }
  search = ('' + search).toLowerCase()
  // get the optional dataKey
  dataKey =
    dataKey &&
    (_.stripQuotes(dataKey) || this.$get(dataKey))
  return arr.filter(function (item) {
    return dataKey
      ? contains(Path.get(item, dataKey), search)
      : contains(item, search)
  })
}

/**
 * Filter filter for v-repeat
 *
 * @param {String} sortKey
 * @param {String} reverseKey
 */

exports.orderBy = function (arr, sortKey, reverseKey) {
  var key =
    _.stripQuotes(sortKey) ||
    this.$get(sortKey)
  if (!key) {
    return arr
  }
  var order = 1
  if (reverseKey) {
    if (reverseKey === '-1') {
      order = -1
    } else if (reverseKey.charCodeAt(0) === 0x21) { // !
      reverseKey = reverseKey.slice(1)
      order = this.$get(reverseKey) ? 1 : -1
    } else {
      order = this.$get(reverseKey) ? -1 : 1
    }
  }
  // sort on a copy to avoid mutating original array
  return arr.slice().sort(function (a, b) {
    a = Path.get(a, key)
    b = Path.get(b, key)
    return a === b ? 0 : a > b ? order : -order
  })
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains (val, search) {
  if (_.isObject(val)) {
    for (var key in val) {
      if (contains(val[key], search)) {
        return true
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1
  }
}