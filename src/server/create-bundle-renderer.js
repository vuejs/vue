import runInVm from './run-in-vm'
import { PassThrough } from 'stream'

export function createBundleRendererCreator (createRenderer) {
  return (code, rendererOptions) => {
    const renderer = createRenderer(rendererOptions)
    return {
      renderToString: (context, cb) => {
        if (typeof context === 'function') {
          cb = context
          context = {}
        }
        runInVm(code, context).then(app => {
          renderer.renderToString(app, cb)
        }).catch(cb)
      },
      renderToStream: (context) => {
        const res = new PassThrough()
        runInVm(code, context).then(app => {
          const renderStream = renderer.renderToStream(app)
          renderStream.on('error', err => {
            res.emit('error', err)
          })
          renderStream.pipe(res)
        }).catch(err => {
          process.nextTick(() => {
            res.emit('error', err)
          })
        })
        return res
      }
    }
  }
}
