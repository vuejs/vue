import Vue from '../../dist/vue.runtime.common.js'
import { createRenderer } from '../../packages/vue-server-renderer'
import { createRenderer as createBundleRenderer } from './ssr-bundle-render.spec.js'

describe('SSR: template option', () => {
  it('renderToString', done => {
    const renderer = createRenderer({
      template: `<html><head></head><body><!--vue-ssr-outlet--></body></html>`
    })

    const context = {
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 }
    }

    renderer.renderToString(new Vue({
      template: '<div>hi</div>'
    }), (err, res) => {
      expect(err).toBeNull()
      expect(res).toContain(
        `<html><head>${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        `</body></html>`
      )
      done()
    }, context)
  })

  it('renderToStream', done => {
    const renderer = createRenderer({
      template: `<html><head></head><body><!--vue-ssr-outlet--></body></html>`
    })

    const context = {
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 }
    }

    const stream = renderer.renderToStream(new Vue({
      template: '<div>hi</div>'
    }), context)

    let res = ''
    stream.on('data', chunk => {
      res += chunk
    })
    stream.on('end', () => {
      expect(res).toContain(
        `<html><head>${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        `</body></html>`
      )
      done()
    })
  })

  it('bundleRenderer + renderToString', done => {
    createBundleRenderer('app.js', renderer => {
      const context = {
        head: '<meta name="viewport" content="width=device-width">',
        styles: '<style>h1 { color: red }</style>',
        state: { a: 1 },
        url: '/test'
      }
      renderer.renderToString(context, (err, res) => {
        expect(err).toBeNull()
        expect(res).toContain(
          `<html><head>${context.head}${context.styles}</head><body>` +
          `<div data-server-rendered="true">/test</div>` +
          `<script>window.__INITIAL_STATE__={"a":1}</script>` +
          `</body></html>`
        )
        expect(context.msg).toBe('hello')
        done()
      })
    }, {
      template: `<html><head></head><body><!--vue-ssr-outlet--></body></html>`
    })
  })

  it('bundleRenderer + renderToStream', done => {
    createBundleRenderer('app.js', renderer => {
      const context = {
        head: '<meta name="viewport" content="width=device-width">',
        styles: '<style>h1 { color: red }</style>',
        state: { a: 1 },
        url: '/test'
      }
      const stream = renderer.renderToStream(context)
      let res = ''
      stream.on('data', chunk => {
        res += chunk.toString()
      })
      stream.on('end', () => {
        expect(res).toContain(
          `<html><head>${context.head}${context.styles}</head><body>` +
          `<div data-server-rendered="true">/test</div>` +
          `<script>window.__INITIAL_STATE__={"a":1}</script>` +
          `</body></html>`
        )
        expect(context.msg).toBe('hello')
        done()
      })
    }, {
      template: `<html><head></head><body><!--vue-ssr-outlet--></body></html>`
    })
  })
})
