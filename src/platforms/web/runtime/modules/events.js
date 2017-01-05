/* @flow */

import { updateListeners } from 'core/vdom/helpers/index'

function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  const target: HTMLElement = vnode.elm

  function add (event: string, handler: Function, once: boolean, capture: boolean) {
    if (once) {
      const oldHandler = handler
      handler = function (ev) {
        remove(event, handler, capture)
        arguments.length === 1
          ? oldHandler(ev)
          : oldHandler.apply(null, arguments)
      }
    }
    target.addEventListener(event, handler, capture)
  }

  function remove (event: string, handler: Function, capture: boolean) {
    target.removeEventListener(event, handler, capture)
  }

  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  updateListeners(on, oldOn, add, remove, vnode.context)
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
