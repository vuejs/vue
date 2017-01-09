import { extend, cached, noop } from 'shared/util'
import { activeInstance } from 'core/instance/lifecycle'

export default {
  create: enter,
  activate: enter,
  remove: leave
}

function enter (_, vnode) {
  const el = vnode.elm

  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true
    el._leaveCb()
  }

  const data = resolveTransition(vnode.data.transition)
  if (!data) {
    return
  }

  /* istanbul ignore if */
  if (el._enterCb) {
    return
  }

  const {
    enterClass,
    enterActiveClass,
    appearClass,
    appearActiveClass,
    beforeEnter,
    enter,
    afterEnter,
    enterCancelled,
    beforeAppear,
    appear,
    afterAppear,
    appearCancelled
  } = data

  let context = activeInstance
  let transitionNode = activeInstance.$vnode
  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent
    context = transitionNode.context
  }

  const isAppear = !context._isMounted || !vnode.isRootInsert

  if (isAppear && !appear && appear !== '') {
    return
  }

  const startClass = isAppear ? appearClass : enterClass
  const activeClass = isAppear ? appearActiveClass : enterActiveClass
  const beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter
  const enterHook = isAppear ? (typeof appear === 'function' ? appear : enter) : enter
  const afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter
  const enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled

  const userWantsControl =
    enterHook &&
    // enterHook may be a bound method which exposes
    // the length of original fn as _length
    (enterHook._length || enterHook.length) > 1

  const stylesheet = vnode.context.$options.style || {}
  const startState = stylesheet[startClass]
  const endState = stylesheet[activeClass]
  const expectsCSS = startState && endState

  const cb = el._enterCb = once(() => {
    if (cb.cancelled) {
      enterCancelledHook && enterCancelledHook(el)
    } else {
      afterEnterHook && afterEnterHook(el)
    }
    el._enterCb = null
  })

  // We need to wait until the native element has been inserted, but currently
  // there's no API to do that. So we have to wait "one frame" - not entirely
  // sure if this is guaranteed to be enough (e.g. on slow devices?)
  setTimeout(() => {
    const parent = el.parentNode
    const pendingNode = parent && parent._pending && parent._pending[vnode.key]
    if (pendingNode &&
        pendingNode.context === vnode.context &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb) {
      pendingNode.elm._leaveCb()
    }
    enterHook && enterHook(el, cb)

    if (endState) {
      const animation = vnode.context._requireWeexModule('animation')
      animation.transition(el.ref, {
        styles: endState,
        duration: 300,
        timingFunction: 'ease-in-out'
      }, userWantsControl ? noop : cb)
    } else if (!userWantsControl) {
      cb()
    }
  }, 16)

  // start enter transition
  beforeEnterHook && beforeEnterHook(el)

  if (startState) {
    for (const key in startState) {
      el.setStyle(key, startState[key])
    }
  }

  if (!expectsCSS && !userWantsControl) {
    cb()
  }
}

function leave (vnode, rm) {
  const el = vnode.elm

  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true
    el._enterCb()
  }

  const data = resolveTransition(vnode.data.transition)
  if (!data) {
    return rm()
  }

  if (el._leaveCb) {
    return
  }

  const {
    leaveClass,
    leaveActiveClass,
    beforeLeave,
    leave,
    afterLeave,
    leaveCancelled,
    delayLeave
  } = data

  const userWantsControl =
    leave &&
    // leave hook may be a bound method which exposes
    // the length of original fn as _length
    (leave._length || leave.length) > 1

  const stylesheet = vnode.context.$options.style || {}
  const startState = stylesheet[leaveClass]
  const endState = stylesheet[leaveActiveClass]
  const expectsCSS = startState && endState

  const cb = el._leaveCb = once(() => {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null
    }
    if (cb.cancelled) {
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
    const animation = vnode.context._requireWeexModule('animation')
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode
    }
    beforeLeave && beforeLeave(el)

    if (startState) {
      animation.transition(el.ref, {
        styles: startState
      }, next)
    } else {
      next()
    }

    function next () {
      animation.transition(el.ref, {
        styles: endState,
        duration: 300,
        timingFunction: 'ease-in-out'
      }, userWantsControl ? noop : cb)
    }

    leave && leave(el, cb)
    if (!expectsCSS && !userWantsControl) {
      cb()
    }
  }
}

function resolveTransition (def) {
  if (!def) {
    return
  }
  /* istanbul ignore else */
  if (typeof def === 'object') {
    const res = {}
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'))
    }
    extend(res, def)
    return res
  } else if (typeof def === 'string') {
    return autoCssTransition(def)
  }
}

function once (fn) {
  let called = false
  return () => {
    if (!called) {
      called = true
      fn()
    }
  }
}

const autoCssTransition = cached(name => {
  return {
    enterClass: `${name}-enter`,
    leaveClass: `${name}-leave`,
    appearClass: `${name}-enter`,
    enterActiveClass: `${name}-enter-active`,
    leaveActiveClass: `${name}-leave-active`,
    appearActiveClass: `${name}-enter-active`
  }
})
