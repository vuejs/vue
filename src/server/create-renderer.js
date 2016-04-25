import { createSyncRenderer } from './create-sync-renderer'
import { createStreamingRenderer } from './create-streaming-renderer'

export function createRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false)
} = {}) {
  return {
    renderToString: createSyncRenderer(modules, directives, isUnaryTag),
    renderToStream: createStreamingRenderer(modules, directives, isUnaryTag)
  }
}
