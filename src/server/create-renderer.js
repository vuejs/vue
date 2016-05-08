import RenderStream from './render-stream'
import { createRenderFunction } from './render'

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false)
} = {}) {
  const render = createRenderFunction(modules, directives, isUnaryTag)
  return {
    renderToString (component) {
      let result = ''
      render(component, (str, next) => {
        result += str
        next && next()
      })
      return result
    },
    renderToStream (component) {
      return new RenderStream((write, done) => {
        render(component, write, done)
      })
    }
  }
}
