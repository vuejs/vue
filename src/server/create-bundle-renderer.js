import runInVm from './run-in-vm'
import { PassThrough } from 'stream'

export function createBundleRendererCreator (createRenderer) {
  return (code, rendererOptions) => {
    const renderer = createRenderer(rendererOptions)
    const sourceMap = rendererOptions && rendererOptions.sourceMap
    return {
      renderToString: (context, cb) => {
        if (typeof context === 'function') {
          cb = context
          context = {}
        }
        runInVm(code, context).then(app => {
          renderer.renderToString(app, (err, html) => {
            cb(err, html, sourceMap)
          })
        }).catch(err => {
          cb(err, null, sourceMap)
        })
      },
      renderToStream: (context) => {
        const res = new PassThrough()
        runInVm(code, context).then(app => {
          const renderStream = renderer.renderToStream(app)
          renderStream.on('error', err => {
            res.emit('error', err, sourceMap)
          })
          renderStream.pipe(res)
        }).catch(err => {
          process.nextTick(() => {
            res.emit('error', err, sourceMap)
          })
        })
        return res
      }
    }
  }
}
