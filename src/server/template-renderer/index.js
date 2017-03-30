/* @flow */

const path = require('path')
const serialize = require('serialize-javascript')

import TemplateStream from './template-stream'
import { parseTemplate } from './parse-template'
import { createMapper } from './create-async-file-mapper'
import type { ParsedTemplate } from './parse-template'
import type { AsyncFileMapper } from './create-async-file-mapper'

const JS_RE = /\.js($|\?)/
export const isJS = (file: string): boolean => JS_RE.test(file)

type TemplateRendererOptions = {
  template: string;
  serverManifest?: ServerManifest;
  clientManifest?: ClientManifest;
  shouldPreload?: (file: string, type: string) => boolean;
};

export type ServerManifest = {
  modules: {
    [file: string]: Array<string>;
  }
};

export type ClientManifest = {
  publicPath: string;
  all: Array<string>;
  initial: Array<string>;
  async: Array<string>;
  modules: {
    [id: string]: Array<number>;
  },
  hasNoCssVersion?: {
    [file: string]: boolean;
  }
};

export default class TemplateRenderer {
  options: TemplateRendererOptions;
  template: ParsedTemplate;
  publicPath: string;
  serverManifest: ServerManifest;
  clientManifest: ClientManifest;
  preloadFiles: Array<string>;
  prefetchFiles: Array<string>;
  mapFiles: AsyncFileMapper;

  constructor (options: TemplateRendererOptions) {
    this.options = options
    this.template = parseTemplate(options.template)

    // extra functionality with client manifest
    if (options.serverManifest && options.clientManifest) {
      const serverManifest = this.serverManifest = options.serverManifest
      const clientManifest = this.clientManifest = options.clientManifest
      this.publicPath = clientManifest.publicPath.replace(/\/$/, '')
      // preload/prefetch drectives
      this.preloadFiles = clientManifest.initial
      this.prefetchFiles = clientManifest.async
      // initial async chunk mapping
      this.mapFiles = createMapper(serverManifest, clientManifest)
    }
  }

  // render synchronously given rendered app content and render context
  renderSync (content: string, context: ?Object) {
    const template = this.template
    context = context || {}
    return (
      template.head +
      (context.head || '') +
      this.renderPreloadLinks(context) +
      this.renderPrefetchLinks(context) +
      (context.styles || '') +
      template.neck +
      content +
      this.renderState(context) +
      this.renderScripts(context) +
      template.tail
    )
  }

  renderPreloadLinks (context: Object): string {
    const usedAsyncFiles = this.getUsedAsyncFiles(context)
    if (this.preloadFiles || usedAsyncFiles) {
      return (this.preloadFiles || []).concat(usedAsyncFiles || []).map(file => {
        let extra = ''
        const withoutQuery = file.replace(/\?.*/, '')
        const ext = path.extname(withoutQuery).slice(1)
        const type = getPreloadType(ext)
        const shouldPreload = this.options.shouldPreload
        // by default, we only preload scripts and fonts
        if (!shouldPreload && type !== 'script' && type !== 'font') {
          return ''
        }
        // user wants to explicitly control what to preload
        if (shouldPreload && !shouldPreload(withoutQuery, type)) {
          return ''
        }
        if (type === 'font') {
          extra = ` type="font/${ext}" crossorigin`
        }
        return `<link rel="preload" href="${
          this.publicPath}/${file
        }"${
          type !== '' ? ` as="${type}"` : ''
        }${
          extra
        }>`
      }).join('')
    } else {
      return ''
    }
  }

  renderPrefetchLinks (context: Object): string {
    if (this.prefetchFiles) {
      const usedAsyncFiles = this.getUsedAsyncFiles(context, true)
      const alreadyRendered = file => {
        return usedAsyncFiles && usedAsyncFiles.some(f => f === file)
      }
      return this.prefetchFiles.map(file => {
        if (!alreadyRendered(file)) {
          return `<link rel="prefetch" href="${this.publicPath}/${file}" as="script">`
        } else {
          return ''
        }
      }).join('')
    } else {
      return ''
    }
  }

  renderState (context: Object): string {
    return context.state
      ? `<script>window.__INITIAL_STATE__=${
          serialize(context.state, { isJSON: true })
        }</script>`
      : ''
  }

  renderScripts (context: Object): string {
    if (this.clientManifest) {
      const initial = this.clientManifest.initial
      const async = this.getUsedAsyncFiles(context)
      const needed = [initial[0]].concat(async || [], initial.slice(1))
      return needed.filter(isJS).map(file => {
        return `<script src="${this.publicPath}/${file}"></script>`
      }).join('')
    } else {
      return ''
    }
  }

  getUsedAsyncFiles (context: Object, raw?: boolean): ?Array<string> {
    if (!context._mappedfiles && context._evaluatedFiles && this.mapFiles) {
      let mapped = this.mapFiles(Object.keys(context._evaluatedFiles))
      context._rawMappedFiles = mapped
      // if a file has a no-css version (produced by vue-ssr-webpack-plugin),
      // we should use that instead.
      const noCssHash = this.clientManifest && this.clientManifest.hasNoCssVersion
      if (noCssHash) {
        mapped = mapped.map(file => {
          return noCssHash[file]
            ? file.replace(JS_RE, '.no-css.js')
            : file
        })
      }
      context._mappedFiles = mapped
    }
    return raw
      ? context._rawMappedFiles
      : context._mappedFiles
  }

  // create a transform stream
  createStream (context: ?Object): TemplateStream {
    return new TemplateStream(this, context || {})
  }
}

function getPreloadType (ext: string): string {
  if (ext === 'js') {
    return 'script'
  } else if (ext === 'css') {
    return 'style'
  } else if (/jpe?g|png|svg|gif|webp|ico/.test(ext)) {
    return 'image'
  } else if (/woff2?|ttf|otf|eot/.test(ext)) {
    return 'font'
  } else {
    // not exhausting all possbilities here, but above covers common cases
    return ''
  }
}
