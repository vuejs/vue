/* @flow */

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

  render (h: Function) {
    const tag = this.tag || this.$vnode.data.tag || 'span'
    const map = Object.create(null)
    const prevChildren = this.prevChildren = this.children
    const rawChildren = this.$slots.default || []
    const children = this.children = []
    const transitionData = extractTransitionData(this)

    for (let i = 0; i < rawChildren.length; i++) {
      const c = rawChildren[i]
      if (c.tag) {
        if (c.key != null) {
          children.push(c)
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData
        } else if (process.env.NODE_ENV !== 'production') {
          const opts = c.componentOptions
          const name = opts
            ? (opts.Ctor.options.name || opts.tag)
            : c.tag
          warn(`<transition-group> children must be keyed: <${name}>`)
        }
      }
    }

    if (prevChildren) {
      const kept = []
      const removed = []
      for (let i = 0; i < prevChildren.length; i++) {
        const c = prevChildren[i]
        c.data.pos = c.elm.getBoundingClientRect()
        if (map[c.key]) {
          kept.push(c)
        } else {
          removed.push(c)
        }
      }
      this.kept = h(tag, null, kept)
      this.removed = removed
    }

    return h(tag, null, children)
  },

  beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    )
    this._vnode = this.kept
  },

  updated () {
    const children = this.prevChildren
    const moveClass = this.moveClass || (this.name + '-move')
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    children.forEach(c => {
      /* istanbul ignore if */
      if (c.elm._moveCb) {
        c.elm._moveCb()
      }
      const oldPos = c.data.pos
      const newPos = c.data.pos = c.elm.getBoundingClientRect()
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
        el._moveDest = c.data.pos
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb)
            el._moveCb = null
            removeTransitionClass(el, moveClass)
          }
        })
      }
    })
  },

  methods: {
    hasMove (el: Element, moveClass: string): boolean {
      /* istanbul ignore if */
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
