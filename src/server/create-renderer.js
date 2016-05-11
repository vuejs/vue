import RenderStream from './render-stream'
import { createRenderFunction } from './render'

export const MAX_STACK_DEPTH = 1000

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false)
} = {}) {
  const render = createRenderFunction(modules, directives, isUnaryTag)
  return {
    renderToString (component, done) {
      let result = ''
      let stackDepth = 0
      render(component, (str, next) => {
        result += str
        if (next) {
          if (stackDepth >= MAX_STACK_DEPTH) {
            process.nextTick(next)
          } else {
            stackDepth++
            next()
            stackDepth--
          }
        } else {
          done(result)
        }
      })
    },
    renderToStream (component) {
      return new RenderStream((write, done) => {
        render(component, write, done)
      })
    }
  }
}
