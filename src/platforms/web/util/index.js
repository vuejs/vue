/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    // querySelector 由IE9开始支持，由于最核心的 defineProperty 需要 IE9 以上的浏览器，所以这里这样使用没问题
    const selected = document.querySelector(el)
    if (!selected) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      // 兼容处理
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}
