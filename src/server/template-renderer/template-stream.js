/* @flow */

const Transform = require('stream').Transform
import type TemplateRenderer, { ParsedTemplate } from './index'

export default class TemplateStream extends Transform {
  started: boolean;
  renderer: TemplateRenderer;
  template: ParsedTemplate;
  context: Object;

  constructor (renderer: TemplateRenderer, context: Object) {
    super()
    this.started = false
    this.renderer = renderer
    this.template = renderer.template
    this.context = context || {}
  }

  _transform (data: Buffer | string, encoding: string, done: Function) {
    if (!this.started) {
      this.emit('beforeStart')
      this.start()
    }
    this.push(data)
    done()
  }

  start () {
    this.started = true
    this.push(this.template.head)

    // inline server-rendered head meta information
    if (this.context.head) {
      this.push(this.context.head)
    }

    // inline preload directives for initial chunks
    const preloadLinks = this.renderer.renderPreloadLinks(this.context)
    if (preloadLinks) {
      this.push(preloadLinks)
    }

    // inline prefetch directives for async chunks not used during render
    const prefetchLinks = this.renderer.renderPrefetchLinks(this.context)
    if (prefetchLinks) {
      this.push(prefetchLinks)
    }

    // inline server-rendered CSS collected by vue-style-loader
    if (this.context.styles) {
      this.push(this.context.styles)
    }

    this.push(this.template.neck)
  }

  _flush (done: Function) {
    this.emit('beforeEnd')

    // inline initial store state
    const state = this.renderer.renderState(this.context)
    if (state) {
      this.push(state)
    }

    this.push(this.template.waist)

    // embed async chunks used in initial render
    const asyncChunks = this.renderer.renderAsyncChunks(this.context)
    if (asyncChunks) {
      this.push(asyncChunks)
    }

    this.push(this.template.tail)
    done()
  }
}
