/* @flow */

process.env.BASIC_RENDERER = 'true'

import modules from './server/modules/index'
import directives from './server/directives/index'
import { isUnaryTag, canBeLeftOpenTag } from './compiler/util'
import { createBasicRenderer } from 'server/create-basic-renderer'

export default createBasicRenderer({
  modules,
  directives,
  isUnaryTag,
  canBeLeftOpenTag
})
