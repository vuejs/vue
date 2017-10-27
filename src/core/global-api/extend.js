/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { warn, extend, mergeOptions } from '../util/index'
import { defineComputed, proxy } from '../instance/state'

export function initExtend(Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  // 每个Vue类都会有唯一的cid，并且基于这个Vue拓展的子类也会有唯一标识
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    // 保存父类构造函数及其标识
    const Super = this
    const SuperId = Super.cid
    // 检查是否有缓存该父类下的子类构造函数，使用场景不明
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      console.log('使用缓存构造器');
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characters and the hyphen, ' +
          'and must start with a letter.'
        )
      }
    }

    // new Sub 时调用Vue中_init方法，为什么用命名函数？
    const Sub = function VueComponent(options) {
      this._init(options)
    }
    // 实现Sub继承Super
    Sub.prototype = Object.create(Super.prototype)
    // 把原型上的构造函数指回来否则就是Vue
    Sub.prototype.constructor = Sub
    // 标识自增，唯一性
    Sub.cid = cid++
    // 基于父类options拓展自定义options
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // 指向父类构造函数
    // 表明这是由extend创建的
    // core > instance > init.js中的 resolveConstructorOptions 方法中会使用该字段进行判断
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // props和计算属性需要使用代理
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    // 以下字段在init方法中会使用，与父类属性进行比较检出差异 > resolveModifiedOptions
    // 父类构造函数的options
    Sub.superOptions = Super.options
    // 自定义optiions
    Sub.extendOptions = extendOptions
    // 拓展后的options
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 缓存子类构造函数
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps(Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed(Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
