import RenderStream from './render-stream'
import { createRenderFunction } from './render'
import { warn } from 'core/util/debug'

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false)
} = {}) {
  if (process.env.VUE_ENV !== 'server') {
    warn(
      'You are using createRenderer without setting VUE_ENV enviroment variable to "server". ' +
      'It is recommended to set VUE_ENV=server this will help rendering performance, ' +
      'by turning data observation off.'
    )
  }
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
