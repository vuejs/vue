import webpack from 'webpack'
import Vue from '../../dist/vue.runtime.common.js'
import { VueSSRClientPlugin } from 'vue-ssr-webpack-plugin'
import { compileWithWebpack } from './compile-with-webpack'
import { createRenderer } from '../../packages/vue-server-renderer'
import { createRenderer as createBundleRenderer } from './ssr-bundle-render.spec.js'

const defaultTemplate = `<html><head></head><body><!--vue-ssr-outlet--></body></html>`

function generateClientManifest (file, cb) {
  compileWithWebpack(file, {
    output: {
      path: '/',
      filename: '[name].js'
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        minChunks: Infinity
      }),
      new VueSSRClientPlugin()
    ]
  }, fs => {
    cb(JSON.parse(fs.readFileSync('/vue-ssr-client-manifest.json', 'utf-8')))
  })
}

function createRendererWithManifest (file, cb, shouldPreload) {
  generateClientManifest(file, clientManifest => {
    createBundleRenderer(file, {
      asBundle: true,
      template: defaultTemplate,
      clientManifest,
      shouldPreload
    }, cb)
  })
}

describe('SSR: template option', () => {
  it('renderToString', done => {
    const renderer = createRenderer({
      template: defaultTemplate
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
      template: defaultTemplate
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
    createBundleRenderer('app.js', {
      asBundle: true,
      template: defaultTemplate
    }, renderer => {
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
    })
  })

  it('bundleRenderer + renderToStream', done => {
    createBundleRenderer('app.js', {
      asBundle: true,
      template: defaultTemplate
    }, renderer => {
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
    })
  })

  const expectedHTMLWithManifest = preloadImage =>
    `<html><head>` +
      // used chunks should have preload
      `<link rel="preload" href="/manifest.js" as="script">` +
      `<link rel="preload" href="/main.js" as="script">` +
      `<link rel="preload" href="/0.js" as="script">` +
      // images are only preloaded when explicitly asked for
      (preloadImage ? `<link rel="preload" href="/test.png" as="image">` : ``) +
      // critical assets like fonts are preloaded by default
      `<link rel="preload" href="/test.woff2" as="font" type="font/woff2" crossorigin>` +
      // unused chunks should have prefetch
      `<link rel="prefetch" href="/1.js" as="script">` +
    `</head><body>` +
      `<div data-server-rendered="true"><div>async test.woff2 test.png</div></div>` +
      // manifest chunk should be first
      `<script src="/manifest.js"></script>` +
      // async chunks should be before main chunk
      `<script src="/0.js"></script>` +
      `<script src="/main.js"></script>` +
    `</body></html>`

  it('bundleRenderer + renderToString + clientManifest', done => {
    createRendererWithManifest('split.js', renderer => {
      renderer.renderToString({}, (err, res) => {
        expect(err).toBeNull()
        expect(res).toContain(expectedHTMLWithManifest(false))
        done()
      })
    })
  })

  it('bundleRenderer + renderToStream + clientManifest', done => {
    createRendererWithManifest('split.js', renderer => {
      const stream = renderer.renderToStream({})
      let res = ''
      stream.on('data', chunk => {
        res += chunk.toString()
      })
      stream.on('end', () => {
        expect(res).toContain(expectedHTMLWithManifest(true))
        done()
      })
    }, (file, type) => {
      if (type === 'image' || type === 'script' || type === 'font') {
        return true
      }
    })
  })
})
