/* @flow */

import RenderStream from './render-stream'
import { createRenderFunction } from './render'
import { warn } from 'core/util/debug'
import { createWriteFunction } from './write'

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
  if (process.env.VUE_ENV !== 'server') {
    warn(
      'You are using createRenderer without setting VUE_ENV enviroment variable to "server". ' +
      'It is recommended to set VUE_ENV=server this will help rendering performance, ' +
      'by turning data observation off.'
    )
  }
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
