import path from 'path'
import webpack from 'webpack'
import MemoeryFS from 'memory-fs'
import { createBundleRenderer } from '../../packages/vue-server-renderer'

const rendererCache = {}
function createRenderer (file, cb) {
  if (rendererCache[file]) {
    return cb(rendererCache[file])
  }
  const compiler = webpack({
    target: 'node',
    entry: path.resolve(__dirname, 'fixtures', file),
    output: {
      path: '/',
      filename: 'bundle.js',
      libraryTarget: 'commonjs2'
    },
    module: {
      loaders: [{ test: /\.js$/, loader: 'babel' }]
    }
  })
  const fs = new MemoeryFS()
  compiler.outputFileSystem = fs
  compiler.run((err, stats) => {
    expect(err).toBeFalsy()
    expect(stats.errors).toBeFalsy()
    const code = fs.readFileSync('/bundle.js', 'utf-8')
    const renderer = rendererCache[file] = createBundleRenderer(code)
    cb(renderer)
  })
}

describe('SSR: bundle renderer', () => {
  it('renderToString', done => {
    createRenderer('app.js', renderer => {
      const context = { url: '/test' }
      renderer.renderToString(context, (err, res) => {
        expect(err).toBeNull()
        expect(res).toBe('<div server-rendered="true">&sol;test</div>')
        expect(context.msg).toBe('hello')
        done()
      })
    })
  })

  it('renderToStream', done => {
    createRenderer('app.js', renderer => {
      const context = { url: '/test' }
      const stream = renderer.renderToStream(context)
      let res = ''
      stream.on('data', chunk => {
        res += chunk.toString()
      })
      stream.on('end', () => {
        expect(res).toBe('<div server-rendered="true">&sol;test</div>')
        expect(context.msg).toBe('hello')
        done()
      })
    })
  })

  it('renderToString catch error', done => {
    createRenderer('error.js', renderer => {
      renderer.renderToString(err => {
        expect(err.message).toBe('foo')
        done()
      })
    })
  })

  it('renderToStream catch error', done => {
    createRenderer('error.js', renderer => {
      const stream = renderer.renderToStream()
      stream.on('error', err => {
        expect(err.message).toBe('foo')
        done()
      })
    })
  })
})
