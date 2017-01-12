/* @flow */

import { callHook } from 'core/instance/lifecycle'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

const patternTypes = [String, RegExp]

function matches (pattern: string | RegExp, name: string): boolean {
  if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else {
    return pattern.test(name)
  }
}

export default {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes
  },
  created () {
    this.cache = Object.create(null)
  },
  render () {
    const vnode: VNode = getFirstComponentChild(this.$slots.default)
    if (vnode && vnode.componentOptions) {
      const opts: VNodeComponentOptions = vnode.componentOptions
      // check pattern
      const name = opts.Ctor.options.name || opts.tag
      if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
        return vnode
      }
      const key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? opts.Ctor.cid + (opts.tag ? `::${opts.tag}` : '')
        : vnode.key
      if (this.cache[key]) {
        vnode.componentInstance = this.cache[key].componentInstance
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
      callHook(vnode.componentInstance, 'deactivated')
      vnode.componentInstance.$destroy()
    }
  }
}
