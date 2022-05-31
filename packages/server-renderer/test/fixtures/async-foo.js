// import image and font
import './test.css'
import font from './test.woff2'
import image from './test.png'

export default {
  beforeCreate() {
    this.$vnode.ssrContext._registeredComponents.add('__MODULE_ID__')
  },
  render(h) {
    return h('div', `async ${font} ${image}`)
  }
}
