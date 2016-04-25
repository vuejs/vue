import { createRenderer } from 'server/create-renderer'
import attrs from 'web/server/modules/attrs'
import klass from 'web/server/modules/class'
import style from 'web/server/modules/style'
import show from 'web/server/directives/show'
import { isUnaryTag } from 'web/util/index'

export default createRenderer({
  isUnaryTag,
  modules: [
    attrs,
    klass,
    style
  ],
  directives: {
    show
  }
})
