/* @flow */

import RenderStream from './render-stream'
import { createRenderFunction } from './render'
import { warn } from 'core/util/debug'

export const MAX_STACK_DEPTH = 1000

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false)
}: {
  modules: Array<Function>,
  directives: Object,
  isUnaryTag: Function
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
  const render = createRenderFunction(modules, directives, isUnaryTag)

  return {
    renderToString (
      component: Component,
      done: (err: ?Error, res: ?string) => any
    ): void {
      let result = ''
      let stackDepth = 0
      const write = (str: string, next: Function) => {
        result += str
        if (stackDepth >= MAX_STACK_DEPTH) {
          process.nextTick(() => {
            try { next() } catch (e) {
              done(e)
            }
          })
        } else {
          stackDepth++
          next()
          stackDepth--
        }
      }
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
