import { addClass, removeClass } from '../class-util'
import { isIE9, inBrowser, cached } from '../../util/index'

const TRANSITION = 'transition'
const ANIMATION = 'animation'

// Transition property/event sniffing
let transitionProp
let transitionEndEvent
let animationProp
let animationEndEvent
if (inBrowser && !isIE9) {
  const isWebkitTrans =
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  const isWebkitAnim =
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition'
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend'
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation'
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend'
}

const raf = (inBrowser && window.requestAnimationFrame) || setTimeout
function nextFrame (fn) {
  raf(() => {
    raf(fn)
  })
}

function beforeEnter (_, vnode) {
  // if this is a component root node and the compoennt's
  // parent container node also has transition, skip.
  if (vnode.parent && vnode.parent.data.transition) {
    return
  }

  const el = vnode.elm
  const data = vnode.data.transition
  if (data == null) {
    return
  }

  const {
    enterClass,
    enterActiveClass,
    beforeEnter,
    enter,
    afterEnter,
    enterCancelled
  } = detectAuto(data)

  const userWantsControl = enter && enter.length > 1
  const cb = el._enterCb = () => {
    // ensure only called once
    if (cb.called) {
      return
    }
    cb.called = true
    if (enterActiveClass) {
      removeTransitionClass(el, enterActiveClass)
    }
    if (cb.cancelled) {
      enterCancelled && enterCancelled(el)
    } else {
      afterEnter && afterEnter(el)
    }
    el._enterCb = null
  }

  beforeEnter && beforeEnter(el)
  if (enterClass) {
    addTransitionClass(el, enterClass)
    nextFrame(() => {
      removeTransitionClass(el, enterClass)
    })
  }
  if (enterActiveClass) {
    nextFrame(() => {
      addTransitionClass(el, enterActiveClass)
      if (!userWantsControl) {
        whenTransitionEnds(el, cb)
      }
    })
  }
  enter && enter(el, cb)
  if (!enterActiveClass && !userWantsControl) {
    cb()
  }
}

function onLeave (vnode, rm) {
  // if this is a component root node and the compoennt's
  // parent container node also has transition, skip.
  if (vnode.parent && vnode.parent.data.transition) {
    return
  }

  const el = vnode.elm
  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true
    el._enterCb()
  }
  const data = vnode.data.transition
  if (data == null) {
    return rm()
  }

  const {
    leaveClass,
    leaveActiveClass,
    beforeLeave,
    leave,
    afterLeave
  } = detectAuto(data)

  const userWantsControl = leave && leave.length > 1
  const cb = () => {
    rm()
    afterLeave && afterLeave(el)
  }

  beforeLeave && beforeLeave(el)
  if (leaveClass) {
    addTransitionClass(el, leaveClass)
    nextFrame(() => {
      removeTransitionClass(el, leaveClass)
    })
  }
  if (leaveActiveClass) {
    nextFrame(() => {
      addTransitionClass(el, leaveActiveClass)
      if (!userWantsControl) {
        whenTransitionEnds(el, cb)
      }
    })
  }
  leave && leave(el, cb)
  if (!leaveActiveClass && !userWantsControl) {
    cb()
  }
}

function detectAuto (data) {
  return typeof data === 'string'
    ? autoCssTransition(data)
    : data
}

const autoCssTransition = cached(name => {
  name = name || 'v'
  return {
    enterClass: `${name}-enter`,
    leaveClass: `${name}-leave`,
    enterActiveClass: `${name}-enter-active`,
    leaveActiveClass: `${name}-leave-active`
  }
})

function addTransitionClass (el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls)
  addClass(el, cls)
}

function removeTransitionClass (el, cls) {
  el._transitionClasses.$remove(cls)
  removeClass(el, cls)
}

function whenTransitionEnds (el, cb) {
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
  }, timeout)
  el.addEventListener(event, onEnd)
}

function getTransitionInfo (el) {
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

function getTimeout (delays, durations) {
  return Math.max.apply(null, durations.map((d, i) => {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) {
  return Number(s.slice(0, -1)) * 1000
}

export default !transitionEndEvent ? {} : {
  create: beforeEnter,
  remove: onLeave
}
