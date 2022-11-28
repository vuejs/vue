import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 这里不用class，是因为方便后续给vue实例混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
// 注册vm的_init(), 初始化vm
initMixin(Vue)
// 注册vm的 $data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关方法 $on/$once/$off/$emit
eventsMixin(Vue)
// 初始化生命周期相关方法 _update/$forceUpdare/$destroy
lifecycleMixin(Vue)
// 混入render相关方法 $nextTick/_render
renderMixin(Vue)

export default Vue
