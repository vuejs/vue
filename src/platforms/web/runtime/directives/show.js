/* @flow */

import { isIE9 } from 'web/util/index'
import { enter, leave } from '../modules/transition'

// The v-show directive may appear on a component's parent vnode or its
// inner vnode, and the transition wrapper may be defined outside or inside
// the component. To cater for all possible cases, recursively search for
// possible transition defined on component parent placeholder or inside
// child component.
function detectTransitionNode (vnode: VNode): VNodeWithData {
  let parent = vnode
  while ((parent = parent.parent)) {
    if (hasTransition(parent)) {
      return parent
    }
  }
  if (hasTransition(vnode)) {
    return vnode
  }
  while (vnode.child && (vnode = vnode.child._vnode)) {
    if (hasTransition(vnode)) {
      return vnode
    }
  }
  return vnode
}

function hasTransition (vnode) {
  return vnode.data && vnode.data.transition
}

export default {
  bind (el: any, { value }: VNodeDirective, vnode: VNodeWithData) {
    vnode = detectTransitionNode(vnode)
    const transition = vnode.data && vnode.data.transition
    if (value && transition && transition.appear && !isIE9) {
      enter(vnode)
    }
    const originalDisplay = el.style.display
    el.style.display = value ? originalDisplay : 'none'
    el.__vOriginalDisplay = originalDisplay
  },
  update (el: any, { value, oldValue }: VNodeDirective, vnode: VNodeWithData) {
    /* istanbul ignore if */
    if (value === oldValue) return
    vnode = detectTransitionNode(vnode)
    const transition = vnode.data && vnode.data.transition
    if (transition && !isIE9) {
      if (value) {
        enter(vnode)
        el.style.display = el.__vOriginalDisplay
      } else {
        leave(vnode, () => {
          el.style.display = 'none'
        })
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none'
    }
  }
}
