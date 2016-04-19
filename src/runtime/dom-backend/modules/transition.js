import { addClass, removeClass } from '../class-util'
import {
  isIE9,
  inBrowser,
  transitionProp,
  transitionEndEvent,
  animationProp,
  animationEndEvent
} from '../../util/index'

export default isIE9 ? {} : {
  create: function applyEnterTransition (_, vnode) {
    let data = vnode.data.transition
    const el = vnode.elm
    if (data != null) {
      if (typeof data === 'string') {
        // pure CSS
        data = cssTransition(data)
      }
      // apply enter class
      const enterClass = data.enterClass
      if (enterClass) {
        addTransitionClass(el, enterClass)
        nextFrame(() => {
          removeTransitionClass(el, enterClass)
        })
      }
      const enterActiveClass = data.enterActiveClass
      if (enterActiveClass) {
        addTransitionClass(el, enterActiveClass)
        el.addEventListener(transitionEndEvent, () => {
          removeTransitionClass(el, enterActiveClass)
        })
      }
    }
  },

  remove: function applyLeaveTransition (vnode, rm) {

  }
}

function addTransitionClass (el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls)
  addClass(el, cls)
}

function removeTransitionClass (el, cls) {
  el._transitionClasses.$remove(cls)
  removeClass(el, cls)
}

const raf = (inBrowser && window.requestAnimationFrame) || setTimeout
function nextFrame (fn) {
  raf(() => {
    raf(fn)
  })
}

function cssTransition (name) {
  name = name || 'v'
  return {
    enterClass: `${name}-enter`,
    leaveClass: `${name}-leave`,
    enterActiveClass: `${name}-enter-active`,
    leaveActiveClass: `${name}-leave-active`
  }
}
