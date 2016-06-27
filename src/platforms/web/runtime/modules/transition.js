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

  const {
    css,
    appear,
    enterClass,
    enterActiveClass,
    appearClass,
    appearActiveClass,
    beforeEnter,
    onEnter,
    afterEnter,
    enterCancelled,
    beforeAppear,
    onAppear,
    afterAppear,
    appearCancelled
  } = resolveTransition(data, vnode.context)

  const isAppear = !vnode.context.$root._isMounted
  if (isAppear && !appear && appear !== '') {
    return
  }

  const startClass = isAppear ? appearClass : enterClass
  const activeClass = isAppear ? appearActiveClass : enterActiveClass
  const beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter
  const enterHook = isAppear ? (onAppear || onEnter) : onEnter
  const afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter
  const enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled

  const expectsCSS = css !== false
  const userWantsControl = enterHook && enterHook.length > 1
  const cb = el._enterCb = once(() => {
    if (expectsCSS) {
      removeTransitionClass(el, activeClass)
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass)
      }
      enterCancelledHook && enterCancelledHook(el)
    } else {
      afterEnterHook && afterEnterHook(el)
    }
    el._enterCb = null
  })

  beforeEnterHook && beforeEnterHook(el)
  if (expectsCSS) {
    addTransitionClass(el, startClass)
    addTransitionClass(el, activeClass)
    nextFrame(() => {
      removeTransitionClass(el, startClass)
      if (!cb.cancelled && !userWantsControl) {
        whenTransitionEnds(el, cb)
      }
    })
  }
  enterHook && enterHook(el, cb)
  if (!expectsCSS && !userWantsControl) {
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
    onLeave,
    afterLeave,
    leaveCancelled,
    delayLeave
  } = resolveTransition(data, vnode.context)

  const expectsCSS = css !== false
  const userWantsControl = onLeave && onLeave.length > 1
  const cb = el._leaveCb = once(() => {
    if (expectsCSS) {
      removeTransitionClass(el, leaveActiveClass)
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass)
      }
      leaveCancelled && leaveCancelled(el)
    } else {
      rm()
      afterLeave && afterLeave(el)
    }
    el._leaveCb = null
  })

  if (delayLeave) {
    delayLeave(performLeave)
  } else {
    performLeave()
  }

  function performLeave () {
    beforeLeave && beforeLeave(el)
    if (expectsCSS) {
      addTransitionClass(el, leaveClass)
      addTransitionClass(el, leaveActiveClass)
      nextFrame(() => {
        removeTransitionClass(el, leaveClass)
        if (!cb.cancelled && !userWantsControl) {
          whenTransitionEnds(el, cb)
        }
      })
    }
    onLeave && onLeave(el, cb)
    if (!expectsCSS && !userWantsControl) {
      cb()
    }
  }
}

function resolveTransition (id: string | Object, context: Component): Object {
  let def
  if (id && typeof id === 'string') {
    def = resolveAsset(context.$options, 'transitions', id)
    return def
      ? ensureTransitionClasses(def.name || id, def)
      : autoCssTransition(id)
  } else if (typeof id === 'object') { // inline transition object
    if (id.name) {
      def = resolveAsset(context.$options, 'transitions', id.name)
    }
    def = def
      ? extend(ensureTransitionClasses(id.name, def), id)
      : ensureTransitionClasses(id.name, id)
    // extra hooks to be merged
    // added by <transition-control>
    if (id.hooks) {
      for (const key in id.hooks) {
        mergeHook(def, key, id.hooks[key])
      }
    }
    return def
  } else {
    return autoCssTransition('v')
  }
}

function ensureTransitionClasses (name: ?string, def: Object): Object {
  name = name || 'v'
  const res = {}
  if (def.css !== false) {
    extend(res, autoCssTransition(name))
  }
  extend(res, def)
  return res
}

const autoCssTransition: (name: string) => Object = cached(name => {
  return {
    enterClass: `${name}-enter`,
    leaveClass: `${name}-leave`,
    appearClass: `${name}-enter`,
    enterActiveClass: `${name}-enter-active`,
    leaveActiveClass: `${name}-leave-active`,
    appearActiveClass: `${name}-enter-active`
  }
})

function mergeHook (def: Object, key: string, hook: Function) {
  const oldHook = def[key]
  if (oldHook) {
    def[key] = function () {
      oldHook.apply(this, arguments)
      hook()
    }
  } else {
    def[key] = hook
  }
}

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
