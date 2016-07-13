import { warn } from 'core/util/index'
import { noop, camelize } from 'shared/util'
import { getRealChild, mergeVNodeHook } from 'core/vdom/helpers'

export default {
  name: 'transition',
  props: {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    enterClass: String,
    leaveClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String
  },
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

    // if this is a component root node and the compoennt's
    // parent container node also has transition, skip.
    if (this.$vnode.parent && this.$vnode.parent.data.transition) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    const child = getRealChild(rawChild)
    child.key = child.key || `__v${child.tag + this._uid}__`
    const data = (child.data || (child.data = {})).transition = {}
    // props
    for (const key in this.$options.propsData) {
      data[key] = this[key]
    }
    // events.
    // extract listeners and pass them directly to the transition methods
    const listeners = this.$options._parentListeners
    for (const key in listeners) {
      data[camelize(key)] = listeners[key].fn
    }

    // handle transition mode
    const mode = this.mode
    const oldRawChild = this._vnode
    const oldChild = getRealChild(oldRawChild)
    if (mode && oldChild && oldChild.data && oldChild.key !== child.key) {
      if (mode === 'out-in') {
        // return empty node and queue update when leave finishes
        mergeVNodeHook(oldChild.data.transition, 'afterLeave', () => {
          this.$forceUpdate()
        })
        return /\d-keep-alive$/.test(rawChild.tag)
          ? h('keep-alive')
          : null
      } else if (mode === 'in-out') {
        let delayedLeave
        const performLeave = () => { delayedLeave() }

        mergeVNodeHook(data, 'afterEnter', performLeave)
        mergeVNodeHook(data, 'enterCancelled', performLeave)

        const oldData = oldChild.data.transition
        mergeVNodeHook(oldData, 'delayLeave', leave => {
          delayedLeave = leave
        })
        mergeVNodeHook(oldData, 'leaveCancelled', () => {
          delayedLeave = noop
        })
      } else if (process.env.NODE_ENV !== 'production') {
        warn('invalid <transition> mode: ' + mode)
      }
    }

    return rawChild
  }
}
