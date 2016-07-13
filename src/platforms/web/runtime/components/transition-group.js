import { warn } from 'core/util/index'

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

export default {
  props: ['tag'],

  beforeUpdate () {
    this.__patch__(this._vnode, this.kept)
    this._vnode = this.kept
  },

  render (h) {
    const prevMap = this.prevChildrenMap
    const children = this.$slots.default || []
    const map = this.prevChildrenMap = {}
    const kept = []

    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (c.tag) {
        if (c.key == null) {
          process.env.NODE_ENV !== 'production' && warn(
            'transition-group children must be keyed.'
          )
          c.key = i
        }
        map[c.key] = c
        ;(c.data || (c.data = {})).transition = { name: 'fade' }
        if (prevMap && prevMap[c.key]) {
          kept.push(c)
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
