/* @flow */

import { handleError } from 'core/util/index'
import { updateListeners } from 'core/vdom/helpers/update-listeners'

let target: any
let targetContext: Component | void

function invokeHandler (invoker: Function, args: Array<any>, context = null) {
  const fns = invoker.fns
  if (Array.isArray(fns)) {
    const cloned = fns.slice()
    for (let i = 0; i < cloned.length; i++) {
      cloned[i].apply(context, args)
    }
  } else if (typeof fns === 'function') {
    return fns.apply(context, args)
  } else {
    return invoker.apply(context, args)
  }
}

function add (
  event: string,
  handler: Function,
  once: boolean,
  capture: boolean,
  passive?: boolean,
  params?: Array<any>
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

  // create virtual component template handler
  if (targetContext && targetContext._virtualComponents) {
    target._context = targetContext
    const formerHandler = handler
    handler = function virtualHandler (...args) {
      const componentId = (args[0] || {}).componentId
      let context = this._context
      if (componentId && this._context) {
        const vcs = this._context._virtualComponents || {}
        context = vcs[componentId] || context
      }
      try {
        invokeHandler(formerHandler, args, context)
      } catch (err) {
        handleError(err, context, `Failed to invoke virtual component handler (${componentId})`)
      }
    }
  }

  target.addEvent(event, handler, params)
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
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  target = vnode.elm
  targetContext = vnode.context
  updateListeners(on, oldOn, add, remove, vnode.context)
  target = undefined
  targetContext = undefined
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
