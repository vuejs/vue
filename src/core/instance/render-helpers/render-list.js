/* @flow */

import { isObject, isDef, hasSymbol } from 'core/util/index'

/**
 * Runtime helper for rendering v-for lists.
 */
type ForLoopParams = {
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
  remaining: number;
}

function genForLoopParams(i, length): ForLoopParams {
  return {
    first: i === 0,
    last: i === length - 1,
    even: i % 2 === 0,
    odd: i % 2 !== 0,
    remaining: length - (i + 1)
  }
}

export function renderList(
  val: any,
  render: (
    val: any,
    keyOrIndex: string | number,
    indexOrLoop?: number | ForLoopParams,
    loop?: ForLoopParams
  ) => VNode
): ?Array<VNode> {
  let ret: ?Array<VNode>, i, l, keys, key
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length)
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i, genForLoopParams(i, ret.length))
    }
  } else if (typeof val === 'number') {
    ret = new Array(val)
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i, genForLoopParams(i, val))
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = []
      const iterator1: Iterator<any> = val[Symbol.iterator]()
      let size = 0, res = iterator1.next()
      while (!res.done) {
        size++
        res = iterator1.next()
      }
      const iterator: Iterator<any> = val[Symbol.iterator]()
      let result = iterator.next()
      while (!result.done) {
        ret.push(render(result.value, ret.length, genForLoopParams(ret.length, size)))
        result = iterator.next()
      }
    } else {
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], key, i, genForLoopParams(i, ret.length))
      }
    }
  }
  if (!isDef(ret)) {
    ret = []
  }
  (ret: any)._isVList = true
  return ret
}
