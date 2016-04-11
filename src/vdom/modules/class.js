import { isArray, isObject, setClass } from '../../util/index'

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

function updateClass (oldVnode, vnode) {
  let dynamicClass = vnode.data.class
  let staticClass = vnode.data.staticClass
  if (staticClass || dynamicClass) {
    dynamicClass = genClass(dynamicClass)
    let cls = staticClass
      ? staticClass + (dynamicClass ? ' ' + dynamicClass : '')
      : dynamicClass
    setClass(vnode.elm, cls)
  }
}

export default {
  init: updateClass,
  update: updateClass
}
