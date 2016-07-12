import { noop } from 'shared/util'
import { warn, extend } from 'core/util/index'
import { leave } from 'web/runtime/modules/transition'
import { getRealChild, mergeVNodeHook } from 'core/vdom/helpers'

export default {
  name: 'transition',
  props: ['name', 'appear', 'tag', 'mode'],
  _abstract: true,
  render (h) {
    const children = this.$slots.default && this.$slots.default.filter(c => c.tag)
    if (!children || !children.length) {
      return
    }
    if (process.env.NODE_ENV !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.'
      )
    }
    const rawChild = children[0]
    const child = getRealChild(rawChild)
    ;(child.data || (child.data = {})).transition = extend({}, this.$options.propsData)
    child.key = child.key || `__v${child.tag + this._uid}__`

    const mode = this.mode
    const oldRawChild = this._vnode
    const oldChild = getRealChild(oldRawChild)
    if (mode && oldChild && oldChild.data && oldChild.key !== child.key) {
      if (mode === 'out-in') {
        // return empty node
        // and queue an update when the leave finishes
        if (!oldChild.elm._leaveCb) {
          leave(oldChild, () => {
            oldRawChild.data.left = true
            this.$forceUpdate()
          })
        }
        return oldRawChild.data.left ? rawChild : oldRawChild
      } else if (mode === 'in-out') {
        let delayedLeave
        const performLeave = () => { delayedLeave() }
        addHook(child, {
          afterEnter: performLeave,
          enterCancelled: performLeave
        })
        addHook(oldChild, {
          delayLeave: leave => {
            delayedLeave = leave
          },
          leaveCancelled: () => {
            delayedLeave = noop
          }
        })
      } else if (process.env.NODE_ENV !== 'production') {
        warn('invalid <transition> mode: ' + mode)
      }
    }

    return rawChild
  }
}

function addHook (vnode: VNode, hooks: Object) {
  /* istanbul ignore if */
  if (!vnode.data || !vnode.data.transition) {
    return
  }
  let trans = vnode.data.transition
  /* istanbul ignore else */
  if (typeof trans === 'string') {
    trans = vnode.data.transition = { name: trans }
  } else if (typeof trans !== 'object') {
    trans = vnode.data.transition = { name: 'v' }
  }
  trans.hooks = hooks
}
