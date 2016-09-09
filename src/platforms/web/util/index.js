/* @flow */

import { warn, inBrowser } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isAndroid = UA && UA.indexOf('android') > 0

// According to
// https://w3c.github.io/DOM-Parsing/#dfn-serializing-an-attribute-value
// when serializing innerHTML, <, >, ", & should be encoded as entities.
// However, only some browsers, e.g. PhantomJS, encodes < and >.
// this causes problems with the in-browser parser.
export const shouldDecodeTags = inBrowser ? (function () {
  const div = document.createElement('div')
  div.innerHTML = '<div a=">">'
  return div.innerHTML.indexOf('&gt;') > 0
})() : false

/**
 * Query an element selector if it's not an element already.
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selector = el
    el = document.querySelector(el)
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + selector
      )
      return document.createElement('div')
    }
  }
  return el
}
