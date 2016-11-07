/* @flow */

import { cached, extend, toObject } from 'shared/util'

export const parseStyleText = cached(function (cssText) {
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

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data: VNodeData): ?Object {
  const style = normalizeStyleBinding(data.style)
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
export function normalizeStyleBinding (bindingStyle: any): ?Object {
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
  const res = {}
  let styleData

  if (checkChild) {
    let childNode = vnode
    while (childNode.child) {
      childNode = childNode.child._vnode
      if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData)
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData)
  }

  let parentNode = vnode
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData)
    }
  }
  return res
}

