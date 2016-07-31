/* @flow */

import { isIE9 } from 'web/util/index'
import { enter, leave } from '../modules/transition'

// recursively search for possible transition defined inside the component root
function locateNode (vnode: VNode): VNodeWithData {
  return vnode.child && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.child._vnode)
    : vnode
}

export default {
  bind (el: HTMLElement, { value }: VNodeDirective, vnode: VNodeWithData) {
    vnode = locateNode(vnode)
    const transition = vnode.data && vnode.data.transition
    if (value && transition && transition.appear && !isIE9) {
      enter(vnode)
    }
    el.style.display = value ? '' : 'none'
  },
  update (el: HTMLElement, { value }: VNodeDirective, vnode: VNodeWithData) {
    vnode = locateNode(vnode)
    const transition = vnode.data && vnode.data.transition
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
