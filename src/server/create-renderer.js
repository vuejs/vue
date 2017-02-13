/* @flow */

const HTMLStream = require('vue-ssr-html-stream')

import RenderStream from './render-stream'
import { createWriteFunction } from './write'
import { createRenderFunction } from './render'

export type Renderer = {
  renderToString: (component: Component, cb: (err: ?Error, res: ?string) => void) => void;
  renderToStream: (component: Component) => stream$Readable;
};

type RenderCache = {
  get: (key: string, cb?: Function) => string | void;
  set: (key: string, val: string) => void;
  has?: (key: string, cb?: Function) => boolean | void;
};

export type RenderOptions = {
  modules?: Array<(vnode: VNode) => string>;
  directives?: Object;
  isUnaryTag?: Function;
  cache?: RenderCache;
  template?: string;
};

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false),
  template,
  cache
}: RenderOptions = {}): Renderer {
  const render = createRenderFunction(modules, directives, isUnaryTag, cache)
  const parsedTemplate = template && HTMLStream.parseTemplate(template)

  return {
    renderToString (
      component: Component,
      done: (err: ?Error, res: ?string) => any,
      context?: ?Object
    ): void {
      let result = ''
      const write = createWriteFunction(text => {
        result += text
      }, done)
      try {
        render(component, write, () => {
          if (parsedTemplate) {
            result = HTMLStream.renderTemplate(parsedTemplate, result, context)
          }
          done(null, result)
        })
      } catch (e) {
        done(e)
      }
    },

    renderToStream (
      component: Component,
      context?: ?Object
    ): stream$Readable {
      const renderStream = new RenderStream((write, done) => {
        render(component, write, done)
      })
      if (!parsedTemplate) {
        return renderStream
      } else {
        const htmlStream = new HTMLStream({
          template: parsedTemplate,
          context
        })
        renderStream.on('error', err => {
          htmlStream.emit('error', err)
        })
        renderStream.pipe(htmlStream)
        return htmlStream
      }
    }
  }
}
