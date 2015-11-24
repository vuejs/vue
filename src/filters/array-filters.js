import { getPath } from '../parsers/path'
import { toArray, isArray, isObject, isPlainObject } from '../util/index'
import vFor from '../directives/public/for'
const convertArray = vFor._postProcess

/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

export function limitBy (arr, n, offset) {
  offset = offset ? parseInt(offset, 10) : 0
  return typeof n === 'number'
    ? arr.slice(offset, offset + n)
    : arr
}

/**
 * Filter filter for arrays
 *
 * @param {String} search
 * @param {String} [delimiter]
 * @param {String} ...dataKeys
 */

export function filterBy (arr, search, delimiter) {
  arr = convertArray(arr)
  if (search == null) {
    return arr
  }
  if (typeof search === 'function') {
    return arr.filter(search)
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase()
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2
  // extract and flatten keys
  var keys = toArray(arguments, n).reduce(function (prev, cur) {
    return prev.concat(cur)
  }, [])
  var res = []
  var item, key, val, j
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i]
    val = (item && item.$value) || item
    j = keys.length
    if (j) {
      while (j--) {
        key = keys[j]
        if ((key === '$key' && contains(item.$key, search)) ||
            contains(getPath(val, key), search)) {
          res.push(item)
          break
        }
      }
    } else if (contains(item, search)) {
      res.push(item)
    }
  }
  return res
}

/**
 * Filter filter for arrays
 *
 * @param {String} sortKey
 * @param {String} reverse
 */

export function orderBy (arr, sortKey, reverse) {
  arr = convertArray(arr)
  if (!sortKey) {
    return arr
  }
  var order = (reverse && reverse < 0) ? -1 : 1
  // sort on a copy to avoid mutating original array
  return arr.slice().sort(function (a, b) {
    if (sortKey !== '$key') {
      if (isObject(a) && '$value' in a) a = a.$value
      if (isObject(b) && '$value' in b) b = b.$value
    }
    a = isObject(a) ? getPath(a, sortKey) : a
    b = isObject(b) ? getPath(b, sortKey) : b
    return a === b ? 0 : a > b ? order : -order
  })
}
/**
 * Filter order by for arrays,like sql order: "a desc,b asc,c asc"
 *
 * @param {String} sortKeys
 */
function orderByKeys(arr, sortKeys) {
	//console.log("sortKeys="+sortKeys);
	arr = toArray(arr)
	if (!sortKeys) {
		return arr
	}
	sortKeys = sortKeys.trim().split(",");
	//console.log("sortKeys.length="+sortKeys.length);
	// sort on a copy to avoid mutating original array
	return arr.slice().sort(function(a, b) {
		//console.log("a="+JSON.stringify(a));
		//console.log("b="+JSON.stringify(b));
		if (a === b) return 0;
		var result = 0;
		for (var i in sortKeys) {
			var sortKey = sortKeys[i].trim();

			var order = 1;
			if (sortKey.indexOf(" ") > 0) {
				sortKey = sortKeys[i].split(" ")[0].trim();
				order = sortKeys[i].split(" ")[1].trim().toLowerCase();
				if (order === "desc" || (order && order < 0)) {
					order = -1;
				} else {
					order = 1;
				}
			}
			var va = a,
				vb = b;
			if (sortKey !== '$key') {
				if (isObject(va) && '$value' in va) va = va.$value;
				if (isObject(vb) && '$value' in vb) vb = vb.$value;
			}
			va = isObject(va) ? Path.get(va, sortKey) : va;
			vb = isObject(vb) ? Path.get(vb, sortKey) : vb;
			if (va === undefined || va === null) va = "";
			if (vb === undefined || vb === null) vb = "";
			result = (va === vb ? 0 : va > vb ? order : -order);
			//console.log("a="+va+",b="+vb+",sortKey="+sortKey+",order="+order+",result="+result);
			if (result !== 0) break;
		}
		//console.log("result="+result);
		return result;
	})
}
/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains (val, search) {
  var i
  if (isPlainObject(val)) {
    var keys = Object.keys(val)
    i = keys.length
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true
      }
    }
  } else if (isArray(val)) {
    i = val.length
    while (i--) {
      if (contains(val[i], search)) {
        return true
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1
  }
}
