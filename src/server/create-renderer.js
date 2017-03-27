/* @flow */

import RenderStream from './render-stream'
import TemplateRenderer from './template-renderer/index'
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
  basedir?: string;
  manifest?: {
    server: Object;
    client: Object;
  }
};

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false),
  template,
  cache,
  manifest
}: RenderOptions = {}): Renderer {
  const render = createRenderFunction(modules, directives, isUnaryTag, cache)
  const templateRenderer = template && new TemplateRenderer({
    template,
    manifest
  })

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
          if (templateRenderer) {
            result = templateRenderer.renderSync(result, context)
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
      if (!templateRenderer) {
        return renderStream
      } else {
        const templateStream = templateRenderer.createStream(context)
        renderStream.on('error', err => {
          templateStream.emit('error', err)
        })
        renderStream.pipe(templateStream)
        return templateStream
      }
    }
  }
}
