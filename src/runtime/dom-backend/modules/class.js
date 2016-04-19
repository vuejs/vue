import { isIE9, isArray, isObject } from '../../util/index'

function updateClass (oldVnode, vnode) {
  let dynamicClass = vnode.data.class
  let staticClass = vnode.data.staticClass
  if (staticClass || dynamicClass) {
    dynamicClass = genClass(dynamicClass)
    let cls = staticClass
      ? staticClass + (dynamicClass ? ' ' + dynamicClass : '')
      : dynamicClass
    if (cls !== oldVnode.class) {
      setClass(vnode.elm, cls)
    }
    vnode.class = cls
  }
}

function genClass (data) {
  if (!data) {
    return ''
  }
  if (isObject(data)) {
    let res = ''
    for (var key in data) {
      if (data[key]) res += key + ' '
    }
    return res.slice(0, -1)
  }
  if (isArray(data)) {
    let res = ''
    for (let i = 0, l = data.length; i < l; i++) {
      if (data[i]) res += genClass(data[i]) + ' '
    }
    return res.slice(0, -1)
  }
  if (typeof data === 'string') {
    return data
  }
}

/**
 * In IE9, setAttribute('class') will result in empty class
 * if the element also has the :class attribute; However in
 * PhantomJS, setting `className` does not work on SVG elements...
 * So we have to do a conditional check here.
 *
 * @param {Element} el
 * @param {String} cls
 */

export function setClass (el, cls) {
  /* istanbul ignore if */
  if (isIE9 && !/svg$/.test(el.namespaceURI)) {
    el.className = cls
  } else {
    el.setAttribute('class', cls)
  }
}

export default {
  create: updateClass,
  update: updateClass
}
