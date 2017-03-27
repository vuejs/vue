/* @flow */

import TemplateStream from './template-stream'
import { createMapper } from './create-async-file-mapper'

const serialize = require('serialize-javascript')

type TemplateRendererOptions = {
  template: string;
  manifest?: {
    server: Object;
    client: Object;
  }
};

export type ParsedTemplate = {
  head: string;
  neck: string;
  waist: string;
  tail: string;
};

export default class TemplateRenderer {
  template: ParsedTemplate;
  publicPath: string;
  preloadFiles: ?Array<string>;
  prefetchFiles: ?Array<string>;
  mapFiles: ?(files: Array<string>) => Array<string>;

  constructor (options: TemplateRendererOptions) {
    this.template = parseTemplate(options.template)

    // extra functionality with manifests
    if (options.manifest) {
      const serverManifest = options.manifest.server
      const clientManifest = options.manifest.client
      if (!serverManifest || !clientManifest) {
        throw new Error(
          'The manifest option must provide both server and client manifests.'
        )
      }

      this.publicPath = clientManifest.publicPath.replace(/\/$/, '')

      // preload/prefetch drectives
      const clientInitialFiles = this.preloadFiles = []
      const clientAsyncFiles = this.prefetchFiles = []
      clientManifest.chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          if (chunk.initial) {
            clientInitialFiles.push(file)
          } else {
            clientAsyncFiles.push(file)
          }
        })
      })

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
      const mapped = this.mapFiles(Object.keys(context._evaluatedFiles))
      return (context._mappedFiles = mapped)
    }
  }

  // create a transform stream
  createStream (context: ?Object) {
    return new TemplateStream(this, context || {})
  }
}

function parseTemplate (
  template: string,
  contentPlaceholder?: string = '<!--vue-ssr-outlet-->'
): ParsedTemplate {
  if (typeof template === 'object') {
    return template
  }

  let i = template.indexOf('</head>')
  const j = template.indexOf(contentPlaceholder)

  if (j < 0) {
    throw new Error(`Content placeholder not found in template.`)
  }

  if (i < 0) {
    i = template.indexOf('<body>')
    if (i < 0) {
      i = j
    }
  }

  let waist = ''
  let tail = template.slice(j + contentPlaceholder.length)
  let k = tail.indexOf('</script>')
  if (k > 0) {
    k += '</script>'.length
    waist = tail.slice(0, k)
    tail = tail.slice(k)
  }

  return {
    head: template.slice(0, i),
    neck: template.slice(i, j),
    waist,
    tail
  }
}
