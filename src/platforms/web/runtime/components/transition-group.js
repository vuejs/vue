// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

import { warn, extend } from 'core/util/index'
import { transitionProps, extractTransitionData } from './transition'
import {
  hasTransition,
  addTransitionClass,
  removeTransitionClass,
  getTransitionInfo,
  transitionEndEvent
} from '../transition-util'

const props = extend({
  tag: String,
  moveClass: String
}, transitionProps)

delete props.mode

export default {
  props,

  render (h) {
    const prevMap = this.map
    const map = this.map = {}
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
          const prev = prevMap && prevMap[c.key]
          if (prev) {
            prev.data.kept = true
            c.data.pos = prev.elm.getBoundingClientRect()
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
    if (prevMap) {
      this.kept = h(tag, null, kept)
      this.removed = []
      for (const key in prevMap) {
        const c = prevMap[key]
        if (!c.data.kept) {
          c.data.pos = c.elm.getBoundingClientRect()
          this.removed.push(c)
        }
      }
    }

    return h(tag, null, children)
  },

  beforeUpdate () {
    // force removing pass
    this.__patch__(this._vnode, this.kept)
    this._vnode = this.kept
  },

  updated () {
    const children = this.kept.children.concat(this.removed)
    const moveClass = this.moveClass || (this.name + '-move')
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    children.forEach(c => {
      const oldPos = c.data.pos
      const newPos = c.elm.getBoundingClientRect()
      const dx = oldPos.left - newPos.left
      const dy = oldPos.top - newPos.top
      if (dx || dy) {
        c.data.moved = true
        const s = c.elm.style
        s.transform = s.WebkitTransform = `translate(${dx}px,${dy}px)`
        s.transitionDuration = '0s'
      }
    })

    // force reflow to put everything in position
    const f = document.body.offsetHeight // eslint-disable-line

    children.forEach(c => {
      if (c.data.moved) {
        const el = c.elm
        const s = el.style
        addTransitionClass(el, moveClass)
        s.transform = s.WebkitTransform = s.transitionDuration = ''
        if (el._pendingMoveCb) {
          el.removeEventListener(transitionEndEvent, el._pendingMoveCb)
        }
        el.addEventListener(transitionEndEvent, el._pendingMoveCb = function cb () {
          el.removeEventListener(transitionEndEvent, cb)
          el._pendingMoveCb = null
          removeTransitionClass(el, moveClass)
        })
      }
    })
  },

  methods: {
    hasMove (el, moveClass) {
      if (!hasTransition) {
        return false
      }
      if (this._hasMove != null) {
        return this._hasMove
      }
      addTransitionClass(el, moveClass)
      const info = getTransitionInfo(el)
      removeTransitionClass(el, moveClass)
      return (this._hasMove = info.hasTransform)
    }
  }
}
