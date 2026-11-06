process.env.VUE_ENV = 'server'

import { extend } from 'shared/util'
import modules from './modules/index'
import baseDirectives from './directives/index'
import { isUnaryTag, canBeLeftOpenTag } from 'web/compiler/util'

import {
  createRenderer as _createRenderer,
  Renderer,
  RenderOptions
} from 'server/create-renderer'
import { createBundleRendererCreator } from 'server/bundle-renderer/create-bundle-renderer'

export function createRenderer(
  options: RenderOptions | undefined = {}
): Renderer {
  return _createRenderer(
    extend(extend({}, options), {
      isUnaryTag,
      canBeLeftOpenTag,
      modules,
      // user can provide server-side implementations for custom directives
      // when creating the renderer.
      directives: extend(baseDirectives, options.directives)
    })
  )
}

export const createBundleRenderer = createBundleRendererCreator(createRenderer)
