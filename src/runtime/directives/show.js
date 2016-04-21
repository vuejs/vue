import { isIE9 } from '../util/index'
import { enter, leave } from '../dom/modules/transition'

export default {
  bind (el, value, _, vnode) {
    const transition = getTransition(vnode)
    if (value && transition && transition.appea && !isIE9) {
      enter(vnode)
    }
    el.style.display = value ? '' : 'none'
  },
  update (el, value, _, vnode) {
    const transition = getTransition(vnode)
    if (transition && !isIE9) {
      if (value) {
        enter(vnode)
        el.style.display = ''
      } else {
        leave(vnode, () => {
          el.style.display = 'none'
        })
      }
    } else {
      el.style.display = value ? '' : 'none'
    }
  }
}

function getTransition (vnode) {
  const parent = vnode.parent
  return parent && parent.data.transition != null
    ? parent.data.transition
    : vnode.data.transition
}
