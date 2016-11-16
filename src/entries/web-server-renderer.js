/* @flow */

process.env.VUE_ENV = 'server'

import { createRenderer as _createRenderer } from 'server/create-renderer'
import { createBundleRendererCreator } from 'server/create-bundle-renderer'
import { isUnaryTag } from 'web/util/index'
import modules from 'web/server/modules/index'
import baseDirectives from 'web/server/directives/index'

export function createRenderer (options?: Object = {}): {
  renderToString: Function,
  renderToStream: Function
} {
  // user can provide server-side implementations for custom directives
  // when creating the renderer.
  const directives = Object.assign(baseDirectives, options.directives)
  return _createRenderer({
    isUnaryTag,
    modules,
    directives,
    cache: options.cache
  })
}

export const createBundleRenderer = createBundleRendererCreator(createRenderer)
