import { warn, extend } from 'core/util/index'

export default {
  name: 'transition',
  props: ['name', 'appear', 'tag', 'mode'],
  _abstract: true,
  render (h) {
    const children = this.$slots.default
    if (!children || !children.length) {
      return
    }
    if (process.env.NODE_ENV !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.'
      )
    }
    const child = children[0]
    ;(child.data || (child.data = {})).transition = extend({}, this.$options.propsData)
    child.key = child.key || `__v${child.tag + this._uid}__`

    const mode = this.mode
    const oldChild = this._vnode
    if (mode && oldChild && oldChild.data && (
      oldChild.tag !== child.tag ||
      oldChild.key !== child.key
    )) {
      if (mode === 'out-in') {
        // return empty node
        // and queue an update when the leave finishes
        return addHook(oldChild, {
          afterLeave: () => {
            this.$forceUpdate()
          }
        })
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
          }
        })
      } else if (process.env.NODE_ENV !== 'production') {
        warn('invalid <transition> mode: ' + mode)
      }
    }

    return child
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
