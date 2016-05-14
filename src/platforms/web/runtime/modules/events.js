/* @flow */

import { updateListeners } from 'core/vdom/helpers'

function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  updateListeners(on, oldOn, (event, handler, capture) => {
    vnode.elm.addEventListener(event, handler, capture)
  })
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
