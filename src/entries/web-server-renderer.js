/* @flow */

import { createRenderer } from 'server/create-renderer'
import { isUnaryTag } from 'web/util/index'
import modules from 'web/server/modules/index'
import baseDirectives from 'web/server/directives/index'

export default function publicCreateRenderer (options?: Object = {}): {
  renderToString: Function,
  renderToStream: Function
} {
  // user can provide server-side implementations for custom directives
  // when creating the renderer.
  const directives = Object.assign(baseDirectives, options.directives)
  return createRenderer({
    isUnaryTag,
    modules,
    directives
  })
}
