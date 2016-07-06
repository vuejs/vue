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
    const cid = realChild.componentOptions.Ctor.cid
    if (this.cache[cid]) {
      const child = realChild.child = this.cache[cid].child
      realChild.elm = this.$el = child.$el
    } else {
      this.cache[cid] = realChild
    }
    realChild.data.keepAlive = true
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
