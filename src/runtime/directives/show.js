import { isIE9 } from '../util/index'
import { beforeEnter, onLeave } from '../vdom-web/modules/transition'

export default {
  bind (el, value) {
    el.style.display = value ? '' : 'none'
  },
  update (el, value, _, vnode) {
    const parent = vnode.parent
    const transition = parent && parent.data.transition != null
      ? parent.data.transition
      : vnode.data.transition
    if (!isIE9 && transition != null) {
      if (value) {
        beforeEnter(null, vnode)
        el.style.display = ''
      } else {
        onLeave(vnode, () => {
          el.style.display = 'none'
        })
      }
    } else {
      el.style.display = value ? '' : 'none'
    }
  }
}
