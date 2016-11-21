/* @flow */

import RenderStream from './render-stream'
import { createWriteFunction } from './write'
import { createRenderFunction } from './render'

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false),
  cache
}: {
  modules: Array<Function>,
  directives: Object,
  isUnaryTag: Function,
  cache: ?Object
} = {}): {
  renderToString: Function,
  renderToStream: Function
} {
  const render = createRenderFunction(modules, directives, isUnaryTag, cache)

  return {
    renderToString (
      component: Component,
      done: (err: ?Error, res: ?string) => any
    ): void {
      let result = ''
      const write = createWriteFunction(text => {
        result += text
      }, done)
      try {
        render(component, write, () => {
          done(null, result)
        })
      } catch (e) {
        done(e)
      }
    },

    renderToStream (component: Component): RenderStream {
      return new RenderStream((write, done) => {
        render(component, write, done)
      })
    }
  }
}
