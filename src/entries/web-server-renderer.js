/* @flow */

process.env.VUE_ENV = 'server'

import { createRenderer as _createRenderer } from 'server/create-renderer'
import { createBundleRendererCreator } from 'server/bundle-renderer/create-bundle-renderer'
import { isUnaryTag, canBeLeftOpenTag } from 'web/compiler/util'
import modules from 'web/server/modules/index'
import baseDirectives from 'web/server/directives/index'

export function createRenderer (options?: Object = {}): {
  renderToString: Function,
  renderToStream: Function
} {
  return _createRenderer({
    isUnaryTag,
    canBeLeftOpenTag,
    modules,
    // user can provide server-side implementations for custom directives
    // when creating the renderer.
    directives: Object.assign(baseDirectives, options.directives),
    // component cache (optional)
    cache: options.cache,
    // page template (optional)
    template: options.template,
    // server/client build manifests (optional)
    manifest: options.manifest
  })
}

export const createBundleRenderer = createBundleRendererCreator(createRenderer)
