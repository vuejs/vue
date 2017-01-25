/* @flow */

import runInVm from './run-in-vm'
import { PassThrough } from 'stream'
import type { Renderer, RenderOptions } from './create-renderer'

const INVALID_MSG =
  'Invalid server-rendering bundle format. Should be a string of bundled code ' +
  'or an Object of type { entry: string; chunks: { [filename: string]: string }}.'

// The render bundle can either be a string (single bundled file)
// or an object containing a chunks hash of filename:code pairs with the
// name of the entry file. The object format is used in conjunction with
// Webpack's compilation output so that code-split chunks can also be loaded.
type RenderBundle = string | {
  entry: string;
  chunks: {
    [filename: string]: string;
  };
};

export function createBundleRendererCreator (createRenderer: () => Renderer) {
  return (bundle: RenderBundle, rendererOptions?: RenderOptions) => {
    const renderer = createRenderer(rendererOptions)
    let chunks, entry
    if (typeof bundle === 'object') {
      entry = bundle.entry
      chunks = bundle.chunks
      if (typeof entry !== 'string' || typeof chunks !== 'object') {
        throw new Error(INVALID_MSG)
      }
    } else if (typeof bundle === 'string') {
      entry = '__vue_ssr_bundle__'
      chunks = { '__vue_ssr_bundle__': bundle }
    } else {
      throw new Error(INVALID_MSG)
    }
    return {
      renderToString: (context?: Object, cb: (err: ?Error, res: ?string) => void) => {
        if (typeof context === 'function') {
          cb = context
          context = {}
        }
        runInVm(entry, chunks, context).then(app => {
          renderer.renderToString(app, cb)
        }).catch(cb)
      },
      renderToStream: (context?: Object) => {
        const res = new PassThrough()
        runInVm(entry, chunks, context).then(app => {
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
