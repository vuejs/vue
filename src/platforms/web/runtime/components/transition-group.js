import { warn, extend } from 'core/util/index'
import { transitionProps, extractTransitionData } from './transition'

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

export default {
  props: extend({ tag: String }, transitionProps),

  beforeUpdate () {
    // force removing pass
    this.__patch__(this._vnode, this.kept)
    this._vnode = this.kept
  },

  render (h) {
    const prevMap = this.prevChildrenMap
    const map = this.prevChildrenMap = {}
    const rawChildren = this.$slots.default || []
    const children = []
    const kept = []
    const transitionData = extractTransitionData(this)

    for (let i = 0; i < rawChildren.length; i++) {
      const c = rawChildren[i]
      if (c.tag) {
        if (c.key != null) {
          children.push(c)
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData
          if (prevMap && prevMap[c.key]) {
            kept.push(c)
          }
        } else if (process.env.NODE_ENV !== 'production') {
          const opts = c.componentOptions
          const name = opts
            ? (opts.Ctor.options.name || opts.tag)
            : c.tag
          warn(`<transition-group> children must be keyed: <${name}>`)
        }
      }
    }

    const tag = this.tag || this.$vnode.data.tag || 'span'
    if (this._isMounted) {
      this.kept = h(tag, null, kept)
    }

    return h(tag, null, children)
  }
}
