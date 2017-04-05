// import image and font
import font from './test.woff2'
import image from './test.png'

module.exports = {
  render (h) {
    return h('div', `async ${font} ${image}`)
  }
}
