/* @flow */

import { cached, extend, toObject } from 'shared/util'

const parseStyleText = cached(function (cssText) {
  const rs = {}
  if (!cssText) {
    return rs
  }
  const hasBackground = cssText.indexOf('background') >= 0
  // maybe with background-image: url(http://xxx) or base64 img
  const listDelimiter = hasBackground ? /;(?![^(]*\))/g : ';'
  const propertyDelimiter = hasBackground ? /:(.+)/ : ':'
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter)
      tmp.length > 1 && (rs[tmp[0].trim()] = tmp[1].trim())
    }
  })
  return rs
})

function normalizeStyleData (styleData: Object): Object {
  const style = normalizeBindingStyle(styleData.style)
  const staticStyle = parseStyleText(styleData.staticStyle)
  return extend(extend({}, staticStyle), style)
}

export function normalizeBindingStyle (bindingStyle: any): Object {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }

  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
export function getStyle (vnode: VNode, checkChild: boolean): Object {
  let data = vnode.data
  let parentNode = vnode
  let childNode = vnode

  data = normalizeStyleData(data)

  if (checkChild) {
    while (childNode.child) {
      childNode = childNode.child._vnode
      if (childNode.data) {
        data = extend(normalizeStyleData(childNode.data), data)
      }
    }
  }
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = extend(data, normalizeStyleData(parentNode.data))
    }
  }
  return data
}

