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
  template: ?string;
  clientManifest?: ClientManifest;
  shouldPreload?: (file: string, type: string) => boolean;
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
  parsedTemplate: ParsedTemplate | null;
  publicPath: string;
  clientManifest: ClientManifest;
  preloadFiles: Array<string>;
  prefetchFiles: Array<string>;
  mapFiles: AsyncFileMapper;

  constructor (options: TemplateRendererOptions) {
    this.options = options
    // if no template option is provided, the renderer is created
    // as a utility object for rendering assets like preload links and scripts.
    this.parsedTemplate = options.template
      ? parseTemplate(options.template)
      : null

    // extra functionality with client manifest
    if (options.clientManifest) {
      const clientManifest = this.clientManifest = options.clientManifest
      this.publicPath = clientManifest.publicPath.replace(/\/$/, '')
      // preload/prefetch drectives
      this.preloadFiles = clientManifest.initial
      this.prefetchFiles = clientManifest.async
      // initial async chunk mapping
      this.mapFiles = createMapper(clientManifest)
    }
  }

  bindRenderFns (context: Object) {
    const renderer: any = this
    ;['Links', 'State', 'Scripts', 'Styles'].forEach(type => {
      context[`render${type}`] = renderer[`render${type}`].bind(renderer, context)
    })
  }

  // render synchronously given rendered app content and render context
  renderSync (content: string, context: ?Object) {
    const template = this.parsedTemplate
    if (!template) {
      throw new Error('renderSync cannot be called without a template.')
    }
    context = context || {}
    return (
      template.head(context) +
      (context.head || '') +
      this.renderLinks(context) +
      this.renderStyles(context) +
      template.neck(context) +
      content +
      this.renderState(context) +
      this.renderScripts(context) +
      template.tail(context)
    )
  }

  renderStyles (context: Object): string {
    // context.styles is a getter exposed by vue-style-loader
    return context.styles || ''
  }

  renderLinks (context: Object): string {
    return this.renderPreloadLinks(context) + this.renderPrefetchLinks(context)
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
        // by default, we only preload scripts
        if (!shouldPreload && type !== 'script') {
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
      const usedAsyncFiles = this.getUsedAsyncFiles(context)
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

  getUsedAsyncFiles (context: Object): ?Array<string> {
    if (!context._mappedfiles && context._registeredComponents && this.mapFiles) {
      context._mappedFiles = this.mapFiles(Array.from(context._registeredComponents))
    }
    return context._mappedFiles
  }

  // create a transform stream
  createStream (context: ?Object): TemplateStream {
    if (!this.parsedTemplate) {
      throw new Error('createStream cannot be called without a template.')
    }
    return new TemplateStream(this, this.parsedTemplate, context || {})
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
