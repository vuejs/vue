/* @flow */

import { warn } from 'core/util/index'
import directives from 'web/runtime/directives/index'
export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

export function isBuitInDirective (key) {
  return key in directives
}
