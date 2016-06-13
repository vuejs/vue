/* @flow */

import { isIE9 } from 'web/util/index'
import { enter, leave } from '../modules/transition'

export default {
  bind (el: HTMLElement, { value }: VNodeDirective, vnode: VNodeWithData) {
    const transition = getTransition(vnode)
    if (value && transition && transition.appear && !isIE9) {
      enter(vnode)
    }
    el.style.display = value ? '' : 'none'
  },
  update (el: HTMLElement, { value }: VNodeDirective, vnode: VNodeWithData) {
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

function getTransition (vnode: VNodeWithData): Object | string | void {
  const parent = vnode.parent
  return parent && parent.data.transition != null
    ? parent.data.transition
    : vnode.data.transition
}
