/* @flow */

process.env.VUE_ENV = 'server'

import modules from 'web/server/modules/index'
import baseDirectives from 'web/server/directives/index'
import { isUnaryTag, canBeLeftOpenTag } from 'web/compiler/util'

import { createRenderer as _createRenderer } from './create-renderer'
import { createBundleRendererCreator } from './bundle-renderer/create-bundle-renderer'

export function createRenderer (options?: Object = {}): {
  renderToString: Function,
  renderToStream: Function
} {
  return _createRenderer(Object.assign({}, options, {
    isUnaryTag,
    canBeLeftOpenTag,
    modules,
    // user can provide server-side implementations for custom directives
    // when creating the renderer.
    directives: Object.assign(baseDirectives, options.directives)
  }))
}

export const createBundleRenderer = createBundleRendererCreator(createRenderer)
