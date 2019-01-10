/* @flow */

import config from 'core/config'
import { isDef, isUndef } from 'shared/util'
import { updateListeners } from 'core/vdom/helpers/index'
import { isIE, isPhantomJS, supportsPassive } from 'core/util/index'
import { RANGE_TOKEN, CHECKBOX_RADIO_TOKEN } from 'web/compiler/directives/model'

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    const event = isIE ? 'change' : 'input'
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || [])
    delete on[RANGE_TOKEN]
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || [])
    delete on[CHECKBOX_RADIO_TOKEN]
  }
}

let target: any

function createOnceHandler (event, handler, capture) {
  const _target = target // save current target element in closure
  return function onceHandler () {
    const res = handler.apply(null, arguments)
    if (res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}

const delegateRE = /^(?:click|dblclick|submit|(?:key|mouse|touch|pointer).*)$/
const eventCounts = {}
const attachedGlobalHandlers = {}

type TargetRef = { el: Element | Document }

function add (
  name: string,
  handler: Function,
  capture: boolean,
  passive: boolean
) {
  if (
    !capture &&
    !passive &&
    config.useEventDelegation &&
    delegateRE.test(name)
  ) {
    const count = eventCounts[name]
    let store = target.__events
    if (!count) {
      attachGlobalHandler(name)
    }
    if (!store) {
      store = target.__events = {}
    }
    if (!store[name]) {
      eventCounts[name]++
    }
    store[name] = handler
  } else {
    target.addEventListener(
      name,
      handler,
      supportsPassive
        ? { capture, passive }
        : capture
    )
  }
}

function attachGlobalHandler(name: string) {
  const handler = (attachedGlobalHandlers[name] = (e: any) => {
    const isClick = e.type === 'click' || e.type === 'dblclick'
    if (isClick && e.button !== 0) {
      e.stopPropagation()
      return false
    }
    const targetRef: TargetRef = { el: document }
    dispatchEvent(e, name, isClick, targetRef)
  })
  document.addEventListener(name, handler)
  eventCounts[name] = 0
}

function stopPropagation() {
  this.cancelBubble = true
  if (!this.immediatePropagationStopped) {
    this.stopImmediatePropagation()
  }
}

function dispatchEvent(
  e: Event,
  name: string,
  isClick: boolean,
  targetRef: TargetRef
) {
  let el: any = e.target
  let userEvent
  if (isPhantomJS) {
    // in PhantomJS it throws if we try to re-define currentTarget,
    // so instead we create a wrapped event to the user
    userEvent = Object.create((e: any))
    userEvent.stopPropagation = stopPropagation.bind((e: any))
    userEvent.preventDefault = e.preventDefault.bind(e)
  } else {
    userEvent = e
  }
  Object.defineProperty(userEvent, 'currentTarget', ({
    configurable: true,
    get() {
      return targetRef.el
    }
  }: any))
  while (el != null) {
    // Don't process clicks on disabled elements
    if (isClick && el.disabled) {
      break
    }
    const store = el.__events
    if (store) {
      const handler = store[name]
      if (handler) {
        targetRef.el = el
        handler(userEvent)
        if (e.cancelBubble) {
          break
        }
      }
    }
    el = el.parentNode
  }
}

function removeGlobalHandler(name: string) {
  document.removeEventListener(name, attachedGlobalHandlers[name])
  attachedGlobalHandlers[name] = null
}

function remove (
  name: string,
  handler: Function,
  capture: boolean,
  _target?: HTMLElement
) {
  const el: any = _target || target
  if (!capture && config.useEventDelegation && delegateRE.test(name)) {
    el.__events[name] = null
    if (--eventCounts[name] === 0) {
      removeGlobalHandler(name)
    }
  } else {
    el.removeEventListener(
      name,
      handler._withTask || handler,
      capture
    )
  }
}

function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  target = vnode.elm
  normalizeEvents(on)
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context)
  target = undefined
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
