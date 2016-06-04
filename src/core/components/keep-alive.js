export default {
  created () {
    this.cache = Object.create(null)
  },
  render () {
    const childNode = this.$slots.default[0]
    const cid = childNode.componentOptions.Ctor.cid
    if (this.cache[cid]) {
      const child = childNode.child = this.cache[cid].child
      childNode.elm = this.$el = child.$el
    } else {
      this.cache[cid] = childNode
    }
    childNode.data.keepAlive = true
    return childNode
  },
  beforeDestroy () {
    for (const key in this.cache) {
      this.cache[key].child.$destroy()
    }
  }
}
