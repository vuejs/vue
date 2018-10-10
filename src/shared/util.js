/* @flow */

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining
// 是否是undefined或null
export function isUndef (v: any): boolean %checks {
  return v === undefined || v === null
}

// 是否不是undefined，且不是null
export function isDef (v: any): boolean %checks {
  return v !== undefined && v !== null
}

// 是否是ture
export function isTrue (v: any): boolean %checks {
  return v === true
}

// 是否是false
export function isFalse (v: any): boolean %checks {
  return v === false
}

/**
 * Check if value is primitive
 */
// 判断值不是引用类型，即string，number，boolean
export function isPrimitive (value: any): boolean %checks {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
// 判断是一个对象（不包括null）
export function isObject (obj: mixed): boolean %checks {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value e.g. [object Object]
 */
const _toString = Object.prototype.toString

// 如果是对象，则取出对象的名称，如toRawType([])，返回Array
export function toRawType (value: any): string {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
// 判断是否是纯Object
export function isPlainObject (obj: any): boolean {
  return _toString.call(obj) === '[object Object]'
}

// 校验对象是否是正则
export function isRegExp (v: any): boolean {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
// 校验是否是有效的数组索引。大于等于0，不是无限大，是整数
export function isValidArrayIndex (val: any): boolean {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * Convert a value to a string that is actually rendered.
 */
export function toString (val: any): string {
  return val == null
    ? ''
    //  如果是对象，用json序列化
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      // 如果不是对象，直接字符串输出
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
// 字符串转数字，如果失败了返回原始字符串
export function toNumber (val: string): number | string {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
// 根据字符串创建map，字符串要求是多个key之间用“,”分割。
// 如“slot,component”会创成{slot: true, component: true}
export function makeMap (
  str: string,
  expectsLowerCase?: boolean
): (key: string) => true | void {
  const map = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

/**
 * Check if a tag is a built-in tag.
 */
// 一个内置标签的数组，应该是用于校验标签名？？？？？
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * Check if a attribute is a reserved attribute.
 */
// 一个预留属性的数组，应该是用于校验属性名？？？？？
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

/**
 * Remove an item from an array
 */
// 从数组中删除某个元素
export function remove (arr: Array<any>, item: any): Array<any> | void {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 */
// 重写hasOwnProperty
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
// 创建一个函数缓存。该函数参数是只有一个，是个字符串。根据参数缓存函数的值
export function cached<F: Function> (fn: F): F {
  const cache = Object.create(null)
  return (function cachedFn (str: string) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }: any)
}

/**
 * Camelize a hyphen-delimited string.
 */
// 转驼峰命名
const camelizeRE = /-(\w)/g
export const camelize = cached((str: string): string => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

/**
 * Capitalize a string.
 */
// 转首字母大写
export const capitalize = cached((str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * Hyphenate a camelCase string.
 */
// 大写字母换成-加小写字母
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cached((str: string): string => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

/**
 * Simple bind, faster than native
 */
// 自己实现的bind，比浏览器更快？？？？？
export function bind (fn: Function, ctx: Object): Function {
  function boundFn (a) {
    const l: number = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  // ？？？？？
  // record original fn length
  boundFn._length = fn.length
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 */
// 实现Array.from，为什么不基于浏览器原始的
export function toArray (list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Mix properties into target object.
 */
// 实现Object.assgin
export function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
// 讲一个数组的所有对象mixin到一起，类似Object.assgin(...arr)
export function toObject (arr: Array<any>): Object {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
// 一个空函数
export function noop (a?: any, b?: any, c?: any) {}

/**
 * Always return false.
 */
// 一个恒定返回false函数
export const no = (a?: any, b?: any, c?: any) => false

/**
 * Return same value
 */
// 一个返回自己的函数
export const identity = (_: any) => _

// 以上几个函数应该是做一些回调的默认值使用的

/**
 * Generate a static keys string from compiler modules.
 */
// ????????????
export function genStaticKeys (modules: Array<ModuleOptions>): string {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
// 判断两个对象是否值相等。
export function looseEqual (a: any, b: any): boolean {
  // a和b相等，如果是引用类型表示是同一个对象，如果是值类型表示值相等，这两种情况都认为相等
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      // 数组认为每一个元素都looseEqual，则两个数组looseEqual
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        // 不是数组要求两个对象的每一个值都looseEqual，则两个对象looseEqual
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    // 如果不是对象，比较toString的结果
    return String(a) === String(b)
  } else {
    return false
  }
}

// 使用looseEqual重写 indexOf
export function looseIndexOf (arr: Array<mixed>, val: mixed): number {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
// 返回一个只能调用一次的函数，类似_.once
export function once (fn: Function): Function {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
      // 执行完之后应该加上 fn = null，否则fn一直不释放
    }
  }
}
