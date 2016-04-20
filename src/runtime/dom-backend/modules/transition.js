import { addClass, removeClass } from '../class-util'
import { isIE9, inBrowser, cached, once } from '../../util/index'

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
  const el = vnode.elm
  let data = vnode.data.transition
  if (data != null) {
    data = detectAuto(data)
    // apply enter classes
    const enterClass = data.enterClass
    const enterActiveClass = data.enterActiveClass
    if (enterClass) {
      addTransitionClass(el, enterClass)
      nextFrame(() => {
        removeTransitionClass(el, enterClass)
      })
    }
    if (enterActiveClass) {
      addTransitionClass(el, enterActiveClass)
      nextFrame(() => {
        whenTransitionEnds(el, el._enterCb = once(() => {
          el._enterCb = null
          removeTransitionClass(el, enterActiveClass)
        }))
      })
    }
  }
}

function onLeave (vnode, rm) {
  const el = vnode.elm
  if (!el) return
  // call enter callback now
  if (el._enterCb) {
    el._enterCb()
  }
  let data = vnode.data.transition
  if (data != null) {
    data = detectAuto(data)
    // apply leave classes
    const leaveClass = data.leaveClass
    const leaveActiveClass = data.leaveActiveClass
    if (leaveClass || leaveActiveClass) {
      if (leaveClass) {
        addTransitionClass(el, leaveClass)
        nextFrame(() => {
          removeTransitionClass(el, leaveClass)
        })
      }
      if (leaveActiveClass) {
        nextFrame(() => {
          addTransitionClass(el, leaveActiveClass)
          whenTransitionEnds(el, rm)
        })
      }
    } else {
      rm()
    }
  } else {
    rm()
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
