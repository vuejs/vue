/* @flow */

import { updateListeners } from 'core/vdom/helpers/update-listeners'

let target: any

function add (
  event: string,
  handler: Function,
  once: boolean,
  capture: boolean
) {
  if (capture) {
    console.log('Weex do not support event in bubble phase.')
    return
  }
  if (once) {
    const oldHandler = handler
    const _target = target // save current target element in closure
    handler = function (ev) {
      const res = arguments.length === 1
        ? oldHandler(ev)
        : oldHandler.apply(null, arguments)
      if (res !== null) {
        remove(event, null, null, _target)
      }
    }
  }
  target.addEvent(event, handler)
}

function remove (
  event: string,
  handler: any,
  capture: any,
  _target?: any
) {
  (_target || target).removeEvent(event)
}

function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  const isComponentRoot = !!vnode.componentOptions
  let oldOn = isComponentRoot ? oldVnode.data.nativeOn : oldVnode.data.on
  let on = isComponentRoot ? vnode.data.nativeOn : vnode.data.on
  if (!oldOn && !on) {
    return
  }
  on = on || {}
  oldOn = oldOn || {}
  target = vnode.elm
  updateListeners(on, oldOn, add, remove, vnode.context)
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
