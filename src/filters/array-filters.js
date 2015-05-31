var _ = require('../util')
var Path = require('../parsers/path')

/**
 * Filter filter for v-repeat
 *
 * @param {String} searchKey
 * @param {String} [delimiter]
 * @param {String} dataKey
 */

exports.filterBy = function (arr, search, delimiter, dataKey) {
  // allow optional `in` delimiter
  // because why not
  if (delimiter && delimiter !== 'in') {
    dataKey = delimiter
  }
  if (!search) {
    return arr
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase()
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
 * @param {String} reverse
 */

exports.orderBy = function (arr, sortKey, reverse) {
  if (!sortKey) {
    return arr
  }
  var asc = true
  if (arguments.length > 2) {
    if (reverse === '-1') {
      asc = false
    } else {
      asc = !reverse
    }
  }
  
  var getKey = function(item) {
    if (sortKey !== '$key' && sortKey !== '$value') {
      if (item && '$value' in item) item = item.$value
    }
    return _.isObject(item) ? Path.get(item, sortKey) : item
  }

  var merge = function(left, right) {
    var result = []
    while ((left.length > 0) && (right.length > 0)) {
      if (asc) {
        if (noTilde(getKey(left[0])) < noTilde(getKey(right[0]))) {
          result.push(left.shift())
        } else {
          result.push(right.shift())
        }
      } else {
        if (noTilde(getKey(left[0])) > noTilde(getKey(right[0]))) {
          result.push(left.shift())
        } else {
          result.push(right.shift())
        }    
      }
    }
    return result.concat(left, right)
  }

  var sort = function(array) {
    var len = array.length
    if (len < 2) {
      return array
    }
    var pivot = Math.ceil(len / 2)
    return merge(sort(array.slice(0, pivot)), sort(array.slice(pivot)))
  }
  return sort(arr)
}

/**
 * String unicode normalizer helper
 *
 * @param {*} s
 */

function noTilde(s) {
  if (!!s) {
    if (typeof s === "number") {
      return s
    } else {
      if (typeof s.normalize !== "undefined") {
        s = s.normalize("NFKD")
      }
      return s.replace(/[\u0300-\u036F]/g, "")
    }
  } else {
    return ""
  }
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains (val, search) {
  if (_.isPlainObject(val)) {
    for (var key in val) {
      if (contains(val[key], search)) {
        return true
      }
    }
  } else if (_.isArray(val)) {
    var i = val.length
    while (i--) {
      if (contains(val[i], search)) {
        return true
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1
  }
}