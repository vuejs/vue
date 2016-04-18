import VNode from './vnode'
import Component from './component'
import { renderState } from '../instance/render'
import {
  warn,
  isPrimitive,
  isArray,
  isReservedTag,
  resolveAsset
} from '../util/index'

export default function createElement (tag, data, children) {
  data = data || {}
  const context = this
  const parent = renderState.activeInstance
  if (typeof tag === 'string') {
    let Ctor
    if (isReservedTag(tag)) {
      return VNode(tag, data, flatten(children))
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      return Component(Ctor, data, parent, children)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (!data.svg && isUnknownElement(tag)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.'
          )
        }
      }
      return VNode(tag, data, flatten(children && children()))
    }
  } else {
    return Component(tag, data, parent, children)
  }
}

export function flatten (children) {
  if (isArray(children)) {
    let res = []
    for (let i = 0, l = children.length; i < l; i++) {
      let c = children[i]
      // flatten nested
      if (isArray(c)) {
        res.push.apply(res, flatten(c))
      } else if (isPrimitive(c)) {
        // convert primitive to vnode
        res.push(VNode(undefined, undefined, undefined, c))
      } else if (c) {
        res.push(c)
      }
    }
    return res
  } else {
    return children
  }
}

const unknownElementCache = Object.create(null)

function isUnknownElement (tag) {
  tag = tag.toLowerCase()
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  const el = document.createElement(tag)
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = (
      /HTMLUnknownElement/.test(el.toString()) &&
      // Chrome returns unknown for several HTML5 elements.
      // https://code.google.com/p/chromium/issues/detail?id=540526
      !/^(data|time|rtc|rb)$/.test(tag)
    ))
  }
}
