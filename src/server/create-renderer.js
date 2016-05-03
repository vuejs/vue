import RenderStream from './render-stream'
import { render } from './render'

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false)
} = {}) {
  function _render (component, write, done) {
    render(modules, directives, isUnaryTag)(component, write, done)
  }

  return {
    renderToString (component) {
      let result = ''
      _render(component, (str, next) => {
        result += str
        next && next()
      })
      return result
    },
    renderToStream (component) {
      return new RenderStream((write, done) => {
        _render(component, write, done)
      })
    },
    render: _render
  }
}
