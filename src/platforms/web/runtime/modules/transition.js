/* @flow */

import { addClass, removeClass } from '../class-util'
import { inBrowser, resolveAsset } from 'core/util/index'
import { cached, remove, extend } from 'shared/util'
import { isIE9 } from 'web/util/index'

const hasTransition = inBrowser && !isIE9
const TRANSITION = 'transition'
const ANIMATION = 'animation'

// Transition property/event sniffing
export let transitionProp = 'transition'
export let transitionEndEvent = 'transitionend'
export let animationProp = 'animation'
export let animationEndEvent = 'animationend'
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition'
    transitionEndEvent = 'webkitTransitionEnd'
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation'
    animationEndEvent = 'webkitAnimationEnd'
  }
}

const raf = (inBrowser && window.requestAnimationFrame) || setTimeout
export function nextFrame (fn: Function) {
  raf(() => {
    raf(fn)
  })
}

export function enter (vnode: VNodeWithData) {
  const el: any = vnode.elm
  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true
    el._leaveCb()
  }
  const data = vnode.data.transition
  if (!data) {
    return
  }
  if (!vnode.context.$root._isMounted && !data.appear) {
    return
  }

  const {
    css,
    enterClass,
    enterActiveClass,
    beforeEnter,
    enter,
    afterEnter,
    enterCancelled
  } = resolveTransition(data.definition, vnode.context)

  const expectsCSS = css !== false
  const userWantsControl = enter && enter.length > 1
  const cb = el._enterCb = once(() => {
    if (enterActiveClass) {
      removeTransitionClass(el, enterActiveClass)
    }
    if (cb.cancelled) {
      if (enterClass) {
        removeTransitionClass(el, enterClass)
      }
      enterCancelled && enterCancelled(el)
    } else {
      afterEnter && afterEnter(el)
    }
    el._enterCb = null
  })

  beforeEnter && beforeEnter(el)
  if (enterClass && expectsCSS) {
    addTransitionClass(el, enterClass)
    nextFrame(() => {
      removeTransitionClass(el, enterClass)
    })
  }
  if (enterActiveClass && expectsCSS) {
    nextFrame(() => {
      if (!cb.cancelled) {
        addTransitionClass(el, enterActiveClass)
        if (!userWantsControl) {
          whenTransitionEnds(el, cb)
        }
      }
    })
  }
  enter && enter(el, cb)
  if ((!expectsCSS || !enterActiveClass) && !userWantsControl) {
    cb()
  }
}

export function leave (vnode: VNodeWithData, rm: Function) {
  const el: any = vnode.elm
  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true
    el._enterCb()
  }
  const data = vnode.data.transition
  if (!data) {
    return rm()
  }

  const {
    css,
    leaveClass,
    leaveActiveClass,
    beforeLeave,
    leave,
    afterLeave,
    leaveCancelled
  } = resolveTransition(data.definition, vnode.context)

  const expectsCSS = css !== false
  const userWantsControl = leave && leave.length > 1
  const cb = el._leaveCb = once(() => {
    if (leaveActiveClass) {
      removeTransitionClass(el, leaveActiveClass)
    }
    if (cb.cancelled) {
      if (leaveClass) {
        removeTransitionClass(el, leaveClass)
      }
      leaveCancelled && leaveCancelled(el)
    } else {
      rm()
      afterLeave && afterLeave(el)
    }
    el._leaveCb = null
  })

  beforeLeave && beforeLeave(el)
  if (leaveClass && expectsCSS) {
    addTransitionClass(el, leaveClass)
    nextFrame(() => {
      removeTransitionClass(el, leaveClass)
    })
  }
  if (leaveActiveClass && expectsCSS) {
    nextFrame(() => {
      if (!cb.cancelled) {
        addTransitionClass(el, leaveActiveClass)
        if (!userWantsControl) {
          whenTransitionEnds(el, cb)
        }
      }
    })
  }
  leave && leave(el, cb)
  if ((!expectsCSS || !leaveActiveClass) && !userWantsControl) {
    cb()
  }
}

function resolveTransition (id: string | Object, context: Component): Object {
  if (id && typeof id === 'string') {
    const def = resolveAsset(context.$options, 'transitions', id)
    if (def) {
      return ensureTransitionClasses(id, def)
    } else {
      return autoCssTransition(id)
    }
  } else if (typeof id === 'object') { // inline transition object
    return ensureTransitionClasses('v', id)
  } else {
    return autoCssTransition('v')
  }
}

function ensureTransitionClasses (id: string, def: Object): Object {
  if (def.css === false) return def
  const key = `_cache_${id}`
  if (def[key]) return def[key]
  const res = def[key] = {}
  extend(res, autoCssTransition(id))
  extend(res, def)
  return res
}

const autoCssTransition: (name: string) => Object = cached(name => {
  return {
    enterClass: `${name}-enter`,
    leaveClass: `${name}-leave`,
    enterActiveClass: `${name}-enter-active`,
    leaveActiveClass: `${name}-leave-active`
  }
})

function addTransitionClass (el: any, cls: string) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls)
  addClass(el, cls)
}

function removeTransitionClass (el: any, cls: string) {
  remove(el._transitionClasses, cls)
  removeClass(el, cls)
}

function whenTransitionEnds (el: Element, cb: Function) {
  const { type, timeout, propCount } = getTransitionInfo(el)
  if (!type) return cb()
  const event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = () => {
    el.removeEventListener(event, onEnd)
    cb()
  }
  const onEnd = () => {
    if (++ended >= propCount) {
      end()
    }
  }
  setTimeout(() => {
    if (ended < propCount) {
      end()
    }
  }, timeout + 1)
  el.addEventListener(event, onEnd)
}

function getTransitionInfo (el: Element): {
  type: ?string,
  propCount: number,
  timeout: number
} {
  const styles = window.getComputedStyle(el)
  // 1. determine the maximum duration (timeout)
  const transitioneDelays = styles[transitionProp + 'Delay'].split(', ')
  const transitionDurations = styles[transitionProp + 'Duration'].split(', ')
  const animationDelays = styles[animationProp + 'Delay'].split(', ')
  const animationDurations = styles[animationProp + 'Duration'].split(', ')
  const transitionTimeout = getTimeout(transitioneDelays, transitionDurations)
  const animationTimeout = getTimeout(animationDelays, animationDurations)
  const timeout = Math.max(transitionTimeout, animationTimeout)
  const type = timeout > 0
    ? transitionTimeout > animationTimeout
      ? TRANSITION
      : ANIMATION
    : null
  const propCount = type
    ? type === TRANSITION
      ? transitionDurations.length
      : animationDurations.length
    : 0
  return {
    type,
    timeout,
    propCount
  }
}

function getTimeout (delays: Array<string>, durations: Array<string>): number {
  return Math.max.apply(null, durations.map((d, i) => {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s: string): number {
  return Number(s.slice(0, -1)) * 1000
}

function once (fn: Function): Function {
  let called = false
  return () => {
    if (!called) {
      called = true
      fn()
    }
  }
}

function shouldSkipTransition (vnode: VNodeWithData): boolean {
  return !!(
    // if this is a component root node and the compoennt's
    // parent container node also has transition, skip.
    (vnode.parent && vnode.parent.data.transition) ||
    // if the element has v-show, let the runtime directive
    // call the hooks instead
    vnode.data.show
  )
}

export default hasTransition ? {
  create: function (_: any, vnode: VNodeWithData) {
    if (!shouldSkipTransition(vnode)) {
      enter(vnode)
    }
  },
  remove: function (vnode: VNode, rm: Function) {
    if (!shouldSkipTransition(vnode)) {
      leave(vnode, rm)
    } else {
      rm()
    }
  }
} : {}
