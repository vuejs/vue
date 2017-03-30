import path from 'path'
import webpack from 'webpack'
import MemoeryFS from 'memory-fs'

export function compileWithWebpack (file, extraConfig, cb) {
  const config = Object.assign({
    entry: path.resolve(__dirname, 'fixtures', file),
    module: {
      rules: [{ test: /\.js$/, loader: 'babel-loader' }]
    }
  }, extraConfig)

  const compiler = webpack(config)
  const fs = new MemoeryFS()
  compiler.outputFileSystem = fs

  compiler.run((err, stats) => {
    expect(err).toBeFalsy()
    expect(stats.errors).toBeFalsy()
    cb(fs)
  })
}
