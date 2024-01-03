// @vitest-environment node

import { createWebpackBundleRenderer } from './compile-with-webpack'

describe('SSR: bundle renderer', () => {
  createAssertions(true)
  // createAssertions(false)
})

function createAssertions(runInNewContext) {
  it('renderToString', async () => {
    const renderer = await createWebpackBundleRenderer('app.js', {
      runInNewContext
    })
    const context: any = { url: '/test' }
    const res = await renderer.renderToString(context)
    expect(res).toBe('<div data-server-rendered="true">/test</div>')
    expect(context.msg).toBe('hello')
  })

  it('renderToStream', async () => {
    const renderer = await createWebpackBundleRenderer('app.js', {
      runInNewContext
    })
    const context: any = { url: '/test' }

    const res = await new Promise((resolve, reject) => {
      const stream = renderer.renderToStream(context)
      let res = ''
      stream.on('data', chunk => {
        res += chunk.toString()
      })
      stream.on('error', reject)
      stream.on('end', () => {
        resolve(res)
      })
    })

    expect(res).toBe('<div data-server-rendered="true">/test</div>')
    expect(context.msg).toBe('hello')
  })

  it('renderToString catch error', async () => {
    const renderer = await createWebpackBundleRenderer('error.js', {
      runInNewContext
    })
    try {
      await renderer.renderToString()
    } catch (err: any) {
      expect(err.message).toBe('foo')
    }
  })

  it('renderToString catch Promise rejection', async () => {
    const renderer = await createWebpackBundleRenderer('promise-rejection.js', {
      runInNewContext
    })
    try {
      await renderer.renderToString()
    } catch (err: any) {
      expect(err.message).toBe('foo')
    }
  })

  it('renderToStream catch error', async () => {
    const renderer = await createWebpackBundleRenderer('error.js', {
      runInNewContext
    })

    const err = await new Promise<Error>(resolve => {
      const stream = renderer.renderToStream()
      stream.on('error', resolve)
    })

    expect(err.message).toBe('foo')
  })

  it('renderToStream catch Promise rejection', async () => {
    const renderer = await createWebpackBundleRenderer('promise-rejection.js', {
      runInNewContext
    })

    const err = await new Promise<Error>(resolve => {
      const stream = renderer.renderToStream()
      stream.on('error', resolve)
    })

    expect(err.message).toBe('foo')
  })

  it('render with cache (get/set)', async () => {
    const cache = {}
    const get = vi.fn()
    const set = vi.fn()
    const options = {
      runInNewContext,
      cache: {
        // async
        get: (key, cb) => {
          setTimeout(() => {
            get(key)
            cb(cache[key])
          }, 0)
        },
        set: (key, val) => {
          set(key, val)
          cache[key] = val
        }
      }
    }
    const renderer = await createWebpackBundleRenderer('cache.js', options)
    const expected = '<div data-server-rendered="true">/test</div>'
    const key = 'app::1'
    const res = await renderer.renderToString()

    expect(res).toBe(expected)
    expect(get).toHaveBeenCalledWith(key)
    const setArgs = set.mock.calls[0]
    expect(setArgs[0]).toBe(key)
    expect(setArgs[1].html).toBe(expected)
    expect(cache[key].html).toBe(expected)

    const res2 = await renderer.renderToString()
    expect(res2).toBe(expected)
    expect(get.mock.calls.length).toBe(2)
    expect(set.mock.calls.length).toBe(1)
  })

  it('render with cache (get/set/has)', async () => {
    const cache = {}
    const has = vi.fn()
    const get = vi.fn()
    const set = vi.fn()
    const options = {
      runInNewContext,
      cache: {
        // async
        has: (key, cb) => {
          has(key)
          cb(!!cache[key])
        },
        // sync
        get: key => {
          get(key)
          return cache[key]
        },
        set: (key, val) => {
          set(key, val)
          cache[key] = val
        }
      }
    }
    const renderer = await createWebpackBundleRenderer('cache.js', options)
    const expected = '<div data-server-rendered="true">/test</div>'
    const key = 'app::1'
    const res = await renderer.renderToString()
    expect(res).toBe(expected)
    expect(has).toHaveBeenCalledWith(key)
    expect(get).not.toHaveBeenCalled()
    const setArgs = set.mock.calls[0]
    expect(setArgs[0]).toBe(key)
    expect(setArgs[1].html).toBe(expected)
    expect(cache[key].html).toBe(expected)

    const res2 = await renderer.renderToString()
    expect(res2).toBe(expected)
    expect(has.mock.calls.length).toBe(2)
    expect(get.mock.calls.length).toBe(1)
    expect(set.mock.calls.length).toBe(1)
  })

  it('render with cache (nested)', async () => {
    const cache = new Map() as any
    vi.spyOn(cache, 'get')
    vi.spyOn(cache, 'set')
    const options = {
      cache,
      runInNewContext
    }
    const renderer = await createWebpackBundleRenderer(
      'nested-cache.js',
      options
    )
    const expected = '<div data-server-rendered="true">/test</div>'
    const key = 'app::1'
    const context1 = { registered: [] }
    const context2 = { registered: [] }
    const res = await renderer.renderToString(context1)
    expect(res).toBe(expected)
    expect(cache.set.mock.calls.length).toBe(3) // 3 nested components cached
    const cached = cache.get(key)
    expect(cached.html).toBe(expected)
    expect(cache.get.mock.calls.length).toBe(1)

    // assert component usage registration for nested children
    expect(context1.registered).toEqual(['app', 'child', 'grandchild'])

    const res2 = await renderer.renderToString(context2)
    expect(res2).toBe(expected)
    expect(cache.set.mock.calls.length).toBe(3) // no new cache sets
    expect(cache.get.mock.calls.length).toBe(2) // 1 get for root

    expect(context2.registered).toEqual(['app', 'child', 'grandchild'])
  })

  it('render with cache (opt-out)', async () => {
    const cache = {}
    const get = vi.fn()
    const set = vi.fn()
    const options = {
      runInNewContext,
      cache: {
        // async
        get: (key, cb) => {
          setTimeout(() => {
            get(key)
            cb(cache[key])
          }, 0)
        },
        set: (key, val) => {
          set(key, val)
          cache[key] = val
        }
      }
    }
    const renderer = await createWebpackBundleRenderer(
      'cache-opt-out.js',
      options
    )
    const expected = '<div data-server-rendered="true">/test</div>'
    const res = await renderer.renderToString()
    expect(res).toBe(expected)
    expect(get).not.toHaveBeenCalled()
    expect(set).not.toHaveBeenCalled()
    const res2 = await renderer.renderToString()
    expect(res2).toBe(expected)
    expect(get).not.toHaveBeenCalled()
    expect(set).not.toHaveBeenCalled()
  })

  it('renderToString (bundle format with code split)', async () => {
    const renderer = await createWebpackBundleRenderer('split.js', {
      runInNewContext,
      asBundle: true
    })
    const context = { url: '/test' }
    const res = await renderer.renderToString(context)
    expect(res).toBe(
      '<div data-server-rendered="true">/test<div>async test.woff2 test.png</div></div>'
    )
  })

  it('renderToStream (bundle format with code split)', async () => {
    const renderer = await createWebpackBundleRenderer('split.js', {
      runInNewContext,
      asBundle: true
    })
    const context = { url: '/test' }

    const res = await new Promise((resolve, reject) => {
      const stream = renderer.renderToStream(context)
      let res = ''
      stream.on('data', chunk => {
        res += chunk.toString()
      })
      stream.on('error', reject)
      stream.on('end', () => {
        resolve(res)
      })
    })

    expect(res).toBe(
      '<div data-server-rendered="true">/test<div>async test.woff2 test.png</div></div>'
    )
  })

  it('renderToString catch error (bundle format with source map)', async () => {
    const renderer = await createWebpackBundleRenderer('error.js', {
      runInNewContext,
      asBundle: true
    })

    try {
      await renderer.renderToString()
    } catch (err: any) {
      expect(err.stack).toContain('server-renderer/test/fixtures/error.js:1:0')
      expect(err.message).toBe('foo')
    }
  })

  it('renderToStream catch error (bundle format with source map)', async () => {
    const renderer = await createWebpackBundleRenderer('error.js', {
      runInNewContext,
      asBundle: true
    })

    const err = await new Promise<Error>(resolve => {
      const stream = renderer.renderToStream()
      stream.on('error', resolve)
    })

    expect(err.stack).toContain('server-renderer/test/fixtures/error.js:1:0')
    expect(err.message).toBe('foo')
  })

  it('renderToString w/ callback', async () => {
    const renderer = await createWebpackBundleRenderer('app.js', {
      runInNewContext
    })
    const context: any = { url: '/test' }
    const res = await new Promise(r =>
      renderer.renderToString(context, (_err, res) => r(res))
    )
    expect(res).toBe('<div data-server-rendered="true">/test</div>')
    expect(context.msg).toBe('hello')
  })

  it('renderToString error handling w/ callback', async () => {
    const renderer = await createWebpackBundleRenderer('error.js', {
      runInNewContext
    })
    const err = await new Promise<Error>(r => renderer.renderToString(r))
    expect(err.message).toBe('foo')
  })
}
