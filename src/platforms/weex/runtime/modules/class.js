/* @flow */

import { extend } from 'shared/util'

function updateClass (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  const el = vnode.elm
  const ctx = vnode.context

  const data: VNodeData = vnode.data
  const oldData: VNodeData = oldVnode.data
  if (!data.staticClass && !data.class &&
      (!oldData || (!oldData.staticClass && !oldData.class))) {
    return
  }

  const oldClassList = []
  if (oldData.staticClass) {
    oldClassList.push.apply(oldClassList, oldData.staticClass)
  }
  if (oldData.class) {
    oldClassList.push.apply(oldClassList, oldData.class)
  }

  const classList = []
  if (data.staticClass) {
    classList.push.apply(classList, data.staticClass)
  }
  if (data.class) {
    classList.push.apply(classList, data.class)
  }

  const style = getStyle(oldClassList, classList, ctx)
  for (const key in style) {
    el.setStyle(key, style[key])
  }
}

function getStyle (oldClassList: Array<string>, classList: Array<string>, ctx: Component): Object {
  const stylesheet = ctx.$options.style || {}
  const result = {}
  classList.forEach(name => {
    const style = stylesheet[name]
    extend(result, style)
  })
  oldClassList.forEach(name => {
    const style = stylesheet[name]
    for (const key in style) {
      if (!result.hasOwnProperty(key)) {
        result[key] = ''
      }
    }
  })
  return result
}

export default {
  create: updateClass,
  update: updateClass
}
