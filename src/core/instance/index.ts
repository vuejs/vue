
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import { GlobalAPI } from 'typescript/global-api'

function Vue(options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

//@ts-ignore
initMixin(Vue)
//@ts-ignore
stateMixin(Vue)
//@ts-ignore
eventsMixin(Vue)
//@ts-ignore
lifecycleMixin(Vue)
//@ts-ignore
renderMixin(Vue)

export default Vue as unknown as GlobalAPI
