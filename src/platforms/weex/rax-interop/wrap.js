export default function genRaxWrapper (Rax) {
  const { render, createElement, unmountComponentAtNode } = Rax

  return function wrapRaxComponent (RaxComponent) {
    return {
      created () {
        const update = this._updateFromParent
        this._updateFromParent = function () {
          update.apply(this, arguments)
          this.renderRaxComponent()
        }
      },
      render (h) {
        return h('div')
      },
      mounted () {
        this.renderRaxComponent()
      },
      beforeDestroy () {
        unmountComponentAtNode(this.$el)
      },
      methods: {
        renderRaxComponent () {
          const data = this.$vnode.data
          const props = Object.assign({}, data.attrs, data.domProps, data.props)
          render(createElement(RaxComponent, props), this.$el)
        }
      }
    }
  }
}
