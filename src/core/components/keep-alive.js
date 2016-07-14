import { callHook } from 'core/instance/lifecycle'
import { getRealChild } from 'core/vdom/helpers'

export default {
  name: 'keep-alive',
  _abstract: true,
  props: {
    child: Object
  },
  created () {
    this.cache = Object.create(null)
  },
  render () {
    const rawChild = this.child
    const realChild = getRealChild(this.child)
    if (realChild && realChild.componentOptions) {
      const opts = realChild.componentOptions
      // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      const key = opts.Ctor.cid + '::' + opts.tag
      if (this.cache[key]) {
        const child = realChild.child = this.cache[key].child
        realChild.elm = this.$el = child.$el
      } else {
        this.cache[key] = realChild
      }
      realChild.data.keepAlive = true
    }
    return rawChild
  },
  destroyed () {
    for (const key in this.cache) {
      const vnode = this.cache[key]
      callHook(vnode.child, 'deactivated')
      vnode.child.$destroy()
    }
  }
}
