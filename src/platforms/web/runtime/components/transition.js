// import { emptyVNode } from 'core/vdom/vnode'

export default {
  name: 'transition',
  props: ['name', 'appear', 'tag'],
  _abstract: true,
  render (h) {
    const children = this.$slots.default
    const props = this.$options.propsData
    if (!children || !children.length) {
      return
    }
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      ;(child.data || (child.data = {})).transition = props
    }
    if (children.length > 1) {
      if (!props.tag) {
        throw new Error('prop "tag" is required when <transition> contains more than one element.')
      }
      return h(props.tag, this.$vnode.data, children)
    } else {
      const child = children[0]
      child.key = child.key || `__v${this._uid}__`
      return child
    }
  }
}
