/* @flow */

// TODO: handle <script> tag embedding (so we can get rid of html-webpack-plugin)

const serialize = require('serialize-javascript')

import TemplateStream from './template-stream'
import { parseTemplate } from './parse-template'
import { createMapper } from './create-async-file-mapper'
import type { ParsedTemplate } from './parse-template'
import type { AsyncFileMapper } from './create-async-file-mapper'

type TemplateRendererOptions = {
  template: string;
  serverManifest?: ServerManifest;
  clientManifest?: ClientManifest;
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
  template: ParsedTemplate;
  publicPath: string;
  serverManifest: ServerManifest;
  clientManifest: ClientManifest;
  preloadFiles: ?Array<string>;
  prefetchFiles: ?Array<string>;
  mapFiles: ?AsyncFileMapper;

  constructor (options: TemplateRendererOptions) {
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
      template.waist +
      this.renderAsyncChunks(context) +
      template.tail
    )
  }

  renderPreloadLinks (context: Object): string {
    const renderedFiles = this.getRenderedFilesFromContext(context)
    if (this.preloadFiles || renderedFiles) {
      return (this.preloadFiles || []).concat(renderedFiles || []).map(file => {
        return `<link rel="preload" href="${
          this.publicPath}/${file
        }" as="${
          /\.css$/.test(file) ? 'style' : 'script'
        }">`
      }).join('')
    } else {
      return ''
    }
  }

  renderPrefetchLinks (context: Object): string {
    const renderedFiles = this.getRenderedFilesFromContext(context)
    if (this.prefetchFiles) {
      return this.prefetchFiles.map(file => {
        if (!renderedFiles || renderedFiles.indexOf(file) < 0) {
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

  renderAsyncChunks (context: Object): string {
    const renderedFiles = this.getRenderedFilesFromContext(context)
    if (renderedFiles) {
      return renderedFiles.map(file => {
        return `<script src="${this.publicPath}/${file}"></script>`
      }).join('')
    } else {
      return ''
    }
  }

  getRenderedFilesFromContext (context: Object) {
    if (context._mappedFiles) {
      return context._mappedFiles
    }
    if (context._evaluatedFiles && this.mapFiles) {
      let mapped = this.mapFiles(Object.keys(context._evaluatedFiles))
      // if a file has a no-css version (produced by vue-ssr-webpack-plugin),
      // we should use that instead.
      const noCssHash = this.clientManifest && this.clientManifest.hasNoCssVersion
      if (noCssHash) {
        mapped = mapped.map(file => {
          return noCssHash[file]
            ? file.replace(/\.js$/, '.no-css.js')
            : file
        })
      }
      return (context._mappedFiles = mapped)
    }
  }

  // create a transform stream
  createStream (context: ?Object) {
    return new TemplateStream(this, context || {})
  }
}
