/* @flow */

import RenderStream from './render-stream'
import TemplateRenderer from './template-renderer/index'
import { createWriteFunction } from './write'
import { createRenderFunction } from './render'
import type { ClientManifest } from './template-renderer/index'

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
  inject?: boolean;
  basedir?: string;
  shouldPreload?: Function;
  clientManifest?: ClientManifest;
  runInNewContext?: boolean;
};

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false),
  template,
  inject,
  cache,
  shouldPreload,
  clientManifest
}: RenderOptions = {}): Renderer {
  const render = createRenderFunction(modules, directives, isUnaryTag, cache)
  const templateRenderer = new TemplateRenderer({
    template,
    inject,
    shouldPreload,
    clientManifest
  })

  return {
    renderToString (
      component: Component,
      done: (err: ?Error, res: ?string) => any,
      context?: ?Object
    ): void {
      if (context) {
        templateRenderer.bindRenderFns(context)
      }
      let result = ''
      const write = createWriteFunction(text => {
        result += text
        return false
      }, done)
      try {
        render(component, write, context, () => {
          if (template) {
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
      if (context) {
        templateRenderer.bindRenderFns(context)
      }
      const renderStream = new RenderStream((write, done) => {
        render(component, write, context, done)
      })
      if (!template) {
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
