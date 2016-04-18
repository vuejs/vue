/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

export function isReserved (str) {
  var c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * Parse simple path.
 */

const bailRE = /[^\w\.]/
export function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    path = path.split('.')
    return function (obj) {
      for (let i = 0; i < path.length; i++) {
        if (!obj) return
        obj = obj[path[i]]
      }
      return obj
    }
  }
}
