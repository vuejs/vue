import modules from './modules/index'
import directives from './directives/index'
import { isUnaryTag, canBeLeftOpenTag } from 'web/compiler/util'
import { createBasicRenderer } from 'server/create-basic-renderer'

export default createBasicRenderer({
  // @ts-expect-error
  modules,
  directives,
  isUnaryTag,
  canBeLeftOpenTag
})
