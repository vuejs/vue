import runInVm from './run-in-vm'
import { PassThrough } from 'stream'

export function createBundleRendererCreator (createRenderer) {
  return (code, rendererOptions) => {
    const renderer = createRenderer(rendererOptions)
    const errorMapper = rendererOptions && rendererOptions.errorMapper
    return {
      renderToString: (context, cb) => {
        if (typeof context === 'function') {
          cb = context
          context = {}
        }
        runInVm(code, context).then(app => {
          renderer.renderToString(app, (err, html) => {
            if (err && errorMapper) {
              errorMapper(err)
            }
            cb(err, html)
          })
        }).catch(err => {
          if (err && errorMapper) {
            errorMapper(err)
          }
          cb(err)
        })
      },
      renderToStream: (context) => {
        const res = new PassThrough()
        runInVm(code, context).then(app => {
          const renderStream = renderer.renderToStream(app)
          renderStream.on('error', err => {
            if (errorMapper) {
              errorMapper(err)
            }
            res.emit('error', err)
          })
          renderStream.pipe(res)
        }).catch(err => {
          process.nextTick(() => {
            if (errorMapper) {
              errorMapper(err)
            }
            res.emit('error', err)
          })
        })
        return res
      }
    }
  }
}
