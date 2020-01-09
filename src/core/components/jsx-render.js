export default {
  name: 'jsx-render',
  props: {
    renderContent: {
      type: [Object, String, Array, Function],
      default() {
        return {}
      }
    }
  },
  render(h) {
    return typeof this.renderContent == 'function' ? this.renderContent() : this.renderContent
  }
}
