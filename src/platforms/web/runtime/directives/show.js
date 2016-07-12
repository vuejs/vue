/* @flow */

import { isIE9 } from 'web/util/index'
import { enter, leave } from '../modules/transition'

export default {
  bind (el: HTMLElement, { value }: VNodeDirective, vnode: VNodeWithData) {
    const transition = vnode.data.transition
    console.log(transition)
    if (value && transition && transition.appear && !isIE9) {
      enter(vnode)
    }
    el.style.display = value ? '' : 'none'
  },
  update (el: HTMLElement, { value }: VNodeDirective, vnode: VNodeWithData) {
    const transition = vnode.data.transition
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
