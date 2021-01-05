import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 两件事 
// 初始化Vue构造函数
// 设置Vue实例成员


// 不使用class创建是因为 
// 在下面还是在Vue原型上挂载了很多属性  
// 因为使用了class的话 再在原型上挂载就很不搭


// Vue构造函数
function Vue (options) {
  // 判断当前环境  并且判断当前Vue构造函数内部this是否指向Vue实例
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 下面都是相关混入的方法

// 给vue原型挂载 _init 方法 注册_init()方法 初始化vm
initMixin(Vue)
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关的方法
// $on/$once/$off/$emit
eventsMixin(Vue)
// 初始化生命周期  
// _update/$forceUpdate/$destory
lifecycleMixin(Vue)

// 混入render 
// $nextTick/_render
renderMixin(Vue)

export default Vue
