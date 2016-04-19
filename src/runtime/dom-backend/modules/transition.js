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
        addClass(el, enterClass)
        nextFrame(() => {
          removeClass(el, enterClass)
        })
      }
      const enterActiveClass = data.enterActiveClass
      if (enterActiveClass) {
        el._activeClass = enterActiveClass
        addClass(el, enterActiveClass)
        el.addEventListener(transitionEndEvent, () => {
          el._activeClass = null
          removeClass(el, enterActiveClass)
        })
      }
    }
  },

  remove: function applyLeaveTransition (vnode, rm) {

  }
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
