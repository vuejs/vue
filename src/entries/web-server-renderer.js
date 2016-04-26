import { createRenderer } from 'server/create-renderer'
import attrs from 'web/server/modules/attrs'
import klass from 'web/server/modules/class'
import style from 'web/server/modules/style'
import show from 'web/server/directives/show'
import { isUnaryTag } from 'web/util/index'

const modules = [
  attrs,
  klass,
  style
]

const baseDirectives = {
  show
}

export default function publicCreateRenderer (options = {}) {
  // user can provide server-side implementations for custom directives
  // when creating the renderer.
  const directives = Object.assign(baseDirectives, options.directives)
  return createRenderer({
    isUnaryTag,
    modules,
    directives
  })
}
