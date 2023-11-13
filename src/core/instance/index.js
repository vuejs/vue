import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
/**
 * 为什么 vue 是通过构造函数来定义而不是通过类来定义
 * 1. 需要基于 Mixin 注入到 vue 中
 * 2. 使用 class 类会导致 vue 太重
 * 3. vue 的混入是基于原型的，如果基于类的话只能继承自一个类
 */
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}    

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
