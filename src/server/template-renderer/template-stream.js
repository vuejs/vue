/* @flow */

const Transform = require('stream').Transform
import type TemplateRenderer from './index'
import type { ParsedTemplate } from './parse-template'

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

    // embed scripts needed
    const scripts = this.renderer.renderScripts(this.context)
    if (scripts) {
      this.push(scripts)
    }

    this.push(this.template.tail)
    done()
  }
}
