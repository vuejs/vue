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
  beforeDestroy () {
    for (const key in this.cache) {
      this.cache[key].child.$destroy()
    }
  }
}

// in case the child is also an abstract component, e.g. <transition-control>
// we want to recrusively retrieve the real component to be rendered
function getRealChild (vnode) {
  const compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options._abstract) {
    return getRealChild(compOptions.propsData.child)
  } else {
    return vnode
  }
}
