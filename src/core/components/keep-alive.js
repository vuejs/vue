import { callHook } from 'core/instance/lifecycle'
import { getFirstComponentChild } from 'core/vdom/helpers'

export default {
  name: 'keep-alive',
  abstract: true,
  created () {
    this.cache = Object.create(null)
  },
  render () {
    const vnode = getFirstComponentChild(this.$slots.default)
    if (vnode && vnode.componentOptions) {
      const opts = vnode.componentOptions
      const key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? opts.Ctor.cid + '::' + opts.tag
        : vnode.key
      if (this.cache[key]) {
        vnode.child = this.cache[key].child
      } else {
        this.cache[key] = vnode
      }
      vnode.data.keepAlive = true
    }
    return vnode
  },
  destroyed () {
    for (const key in this.cache) {
      const vnode = this.cache[key]
      callHook(vnode.child, 'deactivated')
      vnode.child.$destroy()
    }
  }
}
