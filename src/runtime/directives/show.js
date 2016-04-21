import transitionHooks from '../vdom-web/modules/transition'

const beforeEnter = transitionHooks.create
const onLeave = transitionHooks.remove

export default {
  bind (el, value) {
    el.style.display = value ? '' : 'none'
  },
  update (el, value, _, vnode) {
    const transition = vnode.data.transition
    if (transition != null && beforeEnter) {
      if (value) {
        beforeEnter(null, vnode, true /* force */)
        el.style.display = ''
      } else {
        onLeave(vnode, () => {
          el.style.display = 'none'
        }, true /* force */)
      }
    } else {
      el.style.display = value ? '' : 'none'
    }
  }
}
