import { noop } from 'shared/util'
import { warn, extend } from 'core/util/index'
import { leave } from 'web/runtime/modules/transition'
import { getRealChild } from 'core/vdom/helpers'

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
    child.key = child.key || `__v${child.tag + this._uid}__`
    ;(child.data || (child.data = {})).transition = extend(
      { context: this },
      this.$options.propsData
    )

    const mode = this.mode
    const oldRawChild = this._vnode
    const oldChild = getRealChild(oldRawChild)
    if (mode && oldChild && oldChild.data && oldChild.key !== child.key) {
      if (mode === 'out-in') {
        // return old node
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
        extend(child.data.transition, {
          afterEnter: performLeave,
          enterCancelled: performLeave
        })
        extend(oldChild.data.transition, {
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
