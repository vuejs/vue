// @vitest-environment node

import Vue from 'vue'
import {
  compileWithWebpack,
  createWebpackBundleRenderer
} from './compile-with-webpack'
import { createRenderer } from 'server/index'
import VueSSRClientPlugin from 'server/webpack-plugin/client'
import { RenderOptions } from 'server/create-renderer'

const defaultTemplate = `<html><head></head><body><!--vue-ssr-outlet--></body></html>`
const interpolateTemplate = `<html><head><title>{{ title }}</title></head><body><!--vue-ssr-outlet-->{{{ snippet }}}</body></html>`

async function generateClientManifest(file: string) {
  const fs = await compileWithWebpack(file, {
    output: {
      path: '/',
      publicPath: '/',
      filename: '[name].js'
    },
    optimization: {
      runtimeChunk: {
        name: 'manifest'
      }
    },
    plugins: [new VueSSRClientPlugin()]
  })
  return JSON.parse(fs.readFileSync('/vue-ssr-client-manifest.json', 'utf-8'))
}

async function createRendererWithManifest(
  file: string,
  options?: RenderOptions
) {
  const clientManifest = await generateClientManifest(file)
  return createWebpackBundleRenderer(
    file,
    Object.assign(
      {
        asBundle: true,
        template: defaultTemplate,
        clientManifest
      },
      options
    )
  )
}

describe('SSR: template option', () => {
  it('renderToString', async () => {
    const renderer = createRenderer({
      template: defaultTemplate
    })

    const context = {
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 }
    }

    const res = await renderer.renderToString(
      new Vue({
        template: '<div>hi</div>'
      }),
      context
    )

    expect(res).toContain(
      `<html><head>${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        `</body></html>`
    )
  })

  it('renderToString with interpolation', async () => {
    const renderer = createRenderer({
      template: interpolateTemplate
    })

    const context = {
      title: '<script>hacks</script>',
      snippet: '<div>foo</div>',
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 }
    }

    const res = await renderer.renderToString(
      new Vue({
        template: '<div>hi</div>'
      }),
      context
    )

    expect(res).toContain(
      `<html><head>` +
        // double mustache should be escaped
        `<title>&lt;script&gt;hacks&lt;/script&gt;</title>` +
        `${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        // triple should be raw
        `<div>foo</div>` +
        `</body></html>`
    )
  })

  it('renderToString with interpolation and context.rendered', async () => {
    const renderer = createRenderer({
      template: interpolateTemplate
    })

    const context = {
      title: '<script>hacks</script>',
      snippet: '<div>foo</div>',
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 0 },
      rendered: context => {
        context.state.a = 1
      }
    }

    const res = await renderer.renderToString(
      new Vue({
        template: '<div>hi</div>'
      }),
      context
    )
    expect(res).toContain(
      `<html><head>` +
        // double mustache should be escaped
        `<title>&lt;script&gt;hacks&lt;/script&gt;</title>` +
        `${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        // triple should be raw
        `<div>foo</div>` +
        `</body></html>`
    )
  })

  it('renderToString w/ template function', async () => {
    const renderer = createRenderer({
      template: (content, context) =>
        `<html><head>${context.head}</head>${content}</html>`
    })

    const context = {
      head: '<meta name="viewport" content="width=device-width">'
    }

    const res = await renderer.renderToString(
      new Vue({
        template: '<div>hi</div>'
      }),
      context
    )

    expect(res).toContain(
      `<html><head>${context.head}</head><div data-server-rendered="true">hi</div></html>`
    )
  })

  it('renderToString w/ template function returning Promise', async () => {
    const renderer = createRenderer({
      template: (content, context) =>
        new Promise<string>(resolve => {
          setTimeout(() => {
            resolve(`<html><head>${context.head}</head>${content}</html>`)
          }, 0)
        })
    })

    const context = {
      head: '<meta name="viewport" content="width=device-width">'
    }

    const res = await renderer.renderToString(
      new Vue({
        template: '<div>hi</div>'
      }),
      context
    )

    expect(res).toContain(
      `<html><head>${context.head}</head><div data-server-rendered="true">hi</div></html>`
    )
  })

  it('renderToString w/ template function returning Promise w/ rejection', async () => {
    const renderer = createRenderer({
      template: () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error(`foo`))
          }, 0)
        })
    })

    const context = {
      head: '<meta name="viewport" content="width=device-width">'
    }

    try {
      await renderer.renderToString(
        new Vue({
          template: '<div>hi</div>'
        }),
        context
      )
    } catch (err: any) {
      expect(err.message).toBe(`foo`)
    }
  })

  it('renderToStream', async () => {
    const renderer = createRenderer({
      template: defaultTemplate
    })

    const context = {
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 }
    }

    const res = await new Promise((resolve, reject) => {
      const stream = renderer.renderToStream(
        new Vue({
          template: '<div>hi</div>'
        }),
        context
      )

      let res = ''
      stream.on('data', chunk => {
        res += chunk
      })
      stream.on('error', reject)
      stream.on('end', () => {
        resolve(res)
      })
    })

    expect(res).toContain(
      `<html><head>${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        `</body></html>`
    )
  })

  it('renderToStream with interpolation', async () => {
    const renderer = createRenderer({
      template: interpolateTemplate
    })

    const context = {
      title: '<script>hacks</script>',
      snippet: '<div>foo</div>',
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 }
    }

    const res = await new Promise((resolve, reject) => {
      const stream = renderer.renderToStream(
        new Vue({
          template: '<div>hi</div>'
        }),
        context
      )

      let res = ''
      stream.on('data', chunk => {
        res += chunk
      })
      stream.on('error', reject)
      stream.on('end', () => {
        resolve(res)
      })
    })

    expect(res).toContain(
      `<html><head>` +
        // double mustache should be escaped
        `<title>&lt;script&gt;hacks&lt;/script&gt;</title>` +
        `${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        // triple should be raw
        `<div>foo</div>` +
        `</body></html>`
    )
  })

  it('renderToStream with interpolation and context.rendered', async () => {
    const renderer = createRenderer({
      template: interpolateTemplate
    })

    const context = {
      title: '<script>hacks</script>',
      snippet: '<div>foo</div>',
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 0 },
      rendered: context => {
        context.state.a = 1
      }
    }

    const res = await new Promise((resolve, reject) => {
      const stream = renderer.renderToStream(
        new Vue({
          template: '<div>hi</div>'
        }),
        context
      )

      let res = ''
      stream.on('data', chunk => {
        res += chunk
      })
      stream.on('error', reject)
      stream.on('end', () => {
        resolve(res)
      })
    })

    expect(res).toContain(
      `<html><head>` +
        // double mustache should be escaped
        `<title>&lt;script&gt;hacks&lt;/script&gt;</title>` +
        `${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">hi</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        // triple should be raw
        `<div>foo</div>` +
        `</body></html>`
    )
  })

  it('bundleRenderer + renderToString', async () => {
    const renderer = await createWebpackBundleRenderer('app.js', {
      asBundle: true,
      template: defaultTemplate
    })
    const context: any = {
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 },
      url: '/test'
    }
    const res = await renderer.renderToString(context)
    expect(res).toContain(
      `<html><head>${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">/test</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        `</body></html>`
    )
    expect(context.msg).toBe('hello')
  })

  it('bundleRenderer + renderToStream', async () => {
    const renderer = await createWebpackBundleRenderer('app.js', {
      asBundle: true,
      template: defaultTemplate
    })
    const context: any = {
      head: '<meta name="viewport" content="width=device-width">',
      styles: '<style>h1 { color: red }</style>',
      state: { a: 1 },
      url: '/test'
    }

    const res = await new Promise(resolve => {
      const stream = renderer.renderToStream(context)
      let res = ''
      stream.on('data', chunk => {
        res += chunk.toString()
      })
      stream.on('end', () => {
        resolve(res)
      })
    })

    expect(res).toContain(
      `<html><head>${context.head}${context.styles}</head><body>` +
        `<div data-server-rendered="true">/test</div>` +
        `<script>window.__INITIAL_STATE__={"a":1}</script>` +
        `</body></html>`
    )
    expect(context.msg).toBe('hello')
  })

  const expectedHTMLWithManifest = (options: any = {}) =>
    `<html><head>` +
    // used chunks should have preload
    `<link rel="preload" href="/manifest.js" as="script">` +
    `<link rel="preload" href="/main.js" as="script">` +
    `<link rel="preload" href="/0.js" as="script">` +
    `<link rel="preload" href="/test.css" as="style">` +
    // images and fonts are only preloaded when explicitly asked for
    (options.preloadOtherAssets
      ? `<link rel="preload" href="/test.png" as="image">`
      : ``) +
    (options.preloadOtherAssets
      ? `<link rel="preload" href="/test.woff2" as="font" type="font/woff2" crossorigin>`
      : ``) +
    // unused chunks should have prefetch
    (options.noPrefetch ? `` : `<link rel="prefetch" href="/1.js">`) +
    // css assets should be loaded
    `<link rel="stylesheet" href="/test.css">` +
    `</head><body>` +
    `<div data-server-rendered="true"><div>async test.woff2 test.png</div></div>` +
    // state should be inlined before scripts
    `<script>window.${
      options.stateKey || '__INITIAL_STATE__'
    }={"a":1}</script>` +
    // manifest chunk should be first
    `<script src="/manifest.js" defer></script>` +
    // async chunks should be before main chunk
    `<script src="/0.js" defer></script>` +
    `<script src="/main.js" defer></script>` +
    `</body></html>`

  createClientManifestAssertions(true)
  createClientManifestAssertions(false)

  function createClientManifestAssertions(runInNewContext) {
    it('bundleRenderer + renderToString + clientManifest ()', async () => {
      const renderer = await createRendererWithManifest('split.js', {
        runInNewContext
      })
      const res = await renderer.renderToString({ state: { a: 1 } })
      expect(res).toContain(expectedHTMLWithManifest())
    })

    it('bundleRenderer + renderToStream + clientManifest + shouldPreload', async () => {
      const renderer = await createRendererWithManifest('split.js', {
        runInNewContext,
        shouldPreload: (file, type) => {
          if (
            type === 'image' ||
            type === 'script' ||
            type === 'font' ||
            type === 'style'
          ) {
            return true
          }
        }
      })
      const res = await new Promise(resolve => {
        const stream = renderer.renderToStream({ state: { a: 1 } })
        let res = ''
        stream.on('data', chunk => {
          res += chunk.toString()
        })
        stream.on('end', () => {
          resolve(res)
        })
      })

      expect(res).toContain(
        expectedHTMLWithManifest({
          preloadOtherAssets: true
        })
      )
    })

    it('bundleRenderer + renderToStream + clientManifest + shouldPrefetch', async () => {
      const renderer = await createRendererWithManifest('split.js', {
        runInNewContext,
        shouldPrefetch: (file, type) => {
          if (type === 'script') {
            return false
          }
        }
      })

      const res = await new Promise(resolve => {
        const stream = renderer.renderToStream({ state: { a: 1 } })
        let res = ''
        stream.on('data', chunk => {
          res += chunk.toString()
        })
        stream.on('end', () => {
          resolve(res)
        })
      })

      expect(res).toContain(
        expectedHTMLWithManifest({
          noPrefetch: true
        })
      )
    })

    it('bundleRenderer + renderToString + clientManifest + inject: false', async () => {
      const renderer = await createRendererWithManifest('split.js', {
        runInNewContext,
        template:
          `<html>` +
          `<head>{{{ renderResourceHints() }}}{{{ renderStyles() }}}</head>` +
          `<body><!--vue-ssr-outlet-->{{{ renderState({ windowKey: '__FOO__', contextKey: 'foo' }) }}}{{{ renderScripts() }}}</body>` +
          `</html>`,
        inject: false
      })
      const context = { foo: { a: 1 } }
      const res = await renderer.renderToString(context)
      expect(res).toContain(
        expectedHTMLWithManifest({
          stateKey: '__FOO__'
        })
      )
    })

    it('bundleRenderer + renderToString + clientManifest + no template', async () => {
      const renderer = await createRendererWithManifest('split.js', {
        runInNewContext,
        template: null as any
      })
      const context: any = { foo: { a: 1 } }
      const res = await renderer.renderToString(context)

      const customOutput = `<html><head>${
        context.renderResourceHints() + context.renderStyles()
      }</head><body>${
        res +
        context.renderState({
          windowKey: '__FOO__',
          contextKey: 'foo'
        }) +
        context.renderScripts()
      }</body></html>`

      expect(customOutput).toContain(
        expectedHTMLWithManifest({
          stateKey: '__FOO__'
        })
      )
    })

    it('whitespace insensitive interpolation', async () => {
      const interpolateTemplate = `<html><head><title>{{title}}</title></head><body><!--vue-ssr-outlet-->{{{snippet}}}</body></html>`
      const renderer = createRenderer({
        template: interpolateTemplate
      })

      const context = {
        title: '<script>hacks</script>',
        snippet: '<div>foo</div>',
        head: '<meta name="viewport" content="width=device-width">',
        styles: '<style>h1 { color: red }</style>',
        state: { a: 1 }
      }

      const res = await renderer.renderToString(
        new Vue({
          template: '<div>hi</div>'
        }),
        context
      )
      expect(res).toContain(
        `<html><head>` +
          // double mustache should be escaped
          `<title>&lt;script&gt;hacks&lt;/script&gt;</title>` +
          `${context.head}${context.styles}</head><body>` +
          `<div data-server-rendered="true">hi</div>` +
          `<script>window.__INITIAL_STATE__={"a":1}</script>` +
          // triple should be raw
          `<div>foo</div>` +
          `</body></html>`
      )
    })

    it('renderToString + nonce', async () => {
      const interpolateTemplate = `<html><head><title>hello</title></head><body><!--vue-ssr-outlet--></body></html>`
      const renderer = createRenderer({
        template: interpolateTemplate
      })

      const context = {
        state: { a: 1 },
        nonce: '4AEemGb0xJptoIGFP3Nd'
      }

      const res = await renderer.renderToString(
        new Vue({
          template: '<div>hi</div>'
        }),
        context
      )
      expect(res).toContain(
        `<html><head>` +
          `<title>hello</title>` +
          `</head><body>` +
          `<div data-server-rendered="true">hi</div>` +
          `<script nonce="4AEemGb0xJptoIGFP3Nd">window.__INITIAL_STATE__={"a":1}</script>` +
          `</body></html>`
      )
    })

    it('renderToString + custom serializer', async () => {
      const expected = `{"foo":123}`
      const renderer = createRenderer({
        template: defaultTemplate,
        serializer: () => expected
      })

      const context = {
        state: { a: 1 }
      }

      const res = await renderer.renderToString(
        new Vue({
          template: '<div>hi</div>'
        }),
        context
      )
      expect(res).toContain(
        `<script>window.__INITIAL_STATE__=${expected}</script>`
      )
    })
  }
})
