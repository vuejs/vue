/* @flow */

import RenderStream from './render-stream'
import { createWriteFunction } from './write'
import { createRenderFunction } from './render'
import { createPromiseCallback } from './util'
import TemplateRenderer from './template-renderer/index'
import type { ClientManifest } from './template-renderer/index'

export type Renderer = {
  renderToString: (component: Component, context: any, cb: any) => ?Promise<string>;
  renderToStream: (component: Component, context?: Object) => stream$Readable;
};

type RenderCache = {
  get: (key: string, cb?: Function) => string | void;
  set: (key: string, val: string) => void;
  has?: (key: string, cb?: Function) => boolean | void;
};

export type RenderOptions = {
  modules?: Array<(vnode: VNode) => ?string>;
  directives?: Object;
  isUnaryTag?: Function;
  cache?: RenderCache;
  template?: string | (content: string, context: any) => string;
  inject?: boolean;
  basedir?: string;
  shouldPreload?: Function;
  shouldPrefetch?: Function;
  clientManifest?: ClientManifest;
  serializer?: Function;
  runInNewContext?: boolean | 'once';
};

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false),
  template,
  inject,
  cache,
  shouldPreload,
  shouldPrefetch,
  clientManifest,
  serializer
}: RenderOptions = {}): Renderer {
  const render = createRenderFunction(modules, directives, isUnaryTag, cache)
  const templateRenderer = new TemplateRenderer({
    template,
    inject,
    shouldPreload,
    shouldPrefetch,
    clientManifest,
    serializer
  })

  return {
    renderToString (
      component: Component,
      context: any,
      cb: any
    ): ?Promise<string> {
      if (typeof context === 'function') {
        cb = context
        context = {}
      }
      if (context) {
        templateRenderer.bindRenderFns(context)
      }

      // no callback, return Promise
      let promise
      if (!cb) {
        ({ promise, cb } = createPromiseCallback())
      }

      let result = ''
      const write = createWriteFunction(text => {
        result += text
        return false
      }, cb)
      try {
        render(component, write, context, err => {
          if (err) {
            return cb(err)
          }
          if (context && context.rendered) {
            context.rendered(context)
          }
          if (template) {
            try {
              const res = templateRenderer.render(result, context)
              if (typeof res !== 'string') {
                // function template returning promise
                res
                  .then(html => cb(null, html))
                  .catch(cb)
              } else {
                cb(null, res)
              }
            } catch (e) {
              cb(e)
            }
          } else {
            cb(null, result)
          }
        })
      } catch (e) {
        cb(e)
      }

      return promise
    },

    renderToStream (
      component: Component,
      context?: Object
    ): stream$Readable {
      if (context) {
        templateRenderer.bindRenderFns(context)
      }
      const renderStream = new RenderStream((write, done) => {
        render(component, write, context, done)
      })
      if (!template) {
        if (context && context.rendered) {
          const rendered = context.rendered
          renderStream.once('beforeEnd', () => {
            rendered(context)
          })
        }
        return renderStream
      } else if (typeof template === 'function') {
        throw new Error(`function template is only supported in renderToString.`)
      } else {
        const templateStream = templateRenderer.createStream(context)
        renderStream.on('error', err => {
          templateStream.emit('error', err)
        })
        renderStream.pipe(templateStream)
        if (context && context.rendered) {
          const rendered = context.rendered
          renderStream.once('beforeEnd', () => {
            rendered(context)
          })
        }
        return templateStream
      }
    }
  }
}
