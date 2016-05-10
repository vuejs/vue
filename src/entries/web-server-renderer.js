import { createRenderer as _createRenderer } from 'server/create-renderer'
import { isUnaryTag } from 'web/util/index'
import modules from 'web/server/modules/index'
import baseDirectives from 'web/server/directives/index'
import _Vue from './web-runtime'

export function createRenderer (options = {}) {
  // user can provide server-side implementations for custom directives
  // when creating the renderer.
  const directives = Object.assign(baseDirectives, options.directives)
  return _createRenderer({
    isUnaryTag,
    modules,
    directives
  })
}

export const Vue = _Vue

_Vue.prototype.$isServerRenderer = true
