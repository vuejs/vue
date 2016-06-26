import runInVm from './run-in-vm'
import { PassThrough } from 'stream'

export function createBundleRendererCreator (createRenderer) {
  return (code, rendererOptions) => {
    const renderer = createRenderer(rendererOptions)
    return {
      renderToString: (context, cb) => {
        runInVm(code, context).then(app => {
          renderer.renderToString(app, cb)
        })
      },
      renderToStream: (context) => {
        const res = new PassThrough()
        runInVm(code, context).then(app => {
          renderer.renderToStream(app).pipe(res)
        })
        return res
      }
    }
  }
}
